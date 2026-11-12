(function () {
  'use strict';

  const DOS_PI = Math.PI * 2;
  // Parámetros del halo. Se pueden sobrescribir antes de cargar este archivo con
  // window.PARAMETROS_PARTICULAS = { radioVacio: 60, ... } para comparar variantes.
  const PARAMETROS = Object.assign({
    radioVacio: 86,        // hueco central alrededor del puntero (px)
    radioMin: 300,         // radio mínimo del halo (px)
    radioMax: 820,         // radio máximo del halo (px)
    factorRadio: 0.42,     // proporción del lado mayor de la ventana
    opacidad: 0.55,        // intensidad general del halo (1 = la anterior); más baja deja leer el texto
    grosorBase: 0.9,       // grosor del trazo en el borde del halo (px)
    grosorExtra: 2.2,      // grosor adicional cerca del puntero (px)
    largoBase: 3,          // largo del trazo en el borde del halo (px)
    largoExtra: 14,        // largo adicional cerca del puntero (px)
    ondaAmplitud: 0.5,     // cuánto crece y se encoge el trazo con la onda
    ondaVelocidad: 2.6,    // velocidad de la onda que se aleja del puntero
    giro: 0.35,            // balanceo angular de cada trazo (radianes)
    respiro: 6             // vaivén radial de cada trazo (px)
  }, window.PARAMETROS_PARTICULAS || {});
  const SEMILLA_RETICULA = 0x2026afec;
  const SIN_ONDAS = [];
  const MAX_BANDAS = 8;

  const PALETAS = {
    ambas: [
      [0, 'violeta'],
      [0.60, 'azul'],
      [0.72, 'violeta'],
      [0.82, 'magenta'],
      [0.86, 'rojo'],
      [0.90, 'naranja'],
      [0.93, 'amarillo'],
      [0.96, 'naranja'],
      [0.98, 'rojo']
    ],
    instagram: [
      [0, 'azul'],
      [0.5, 'violeta']
    ],
    tiktok: [
      [0, 'rojo'],
      [0.2, 'naranja'],
      [0.4, 'amarillo'],
      [0.55, 'magenta'],
      [0.75, 'violeta'],
      [0.9, 'rojo']
    ]
  };

  function mulberry32(semilla) {
    let a = semilla >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  class CampoParticulas {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.modo = 'ambas';
      this.ancho = 0;
      this.alto = 0;
      this.total = 0;
      this.px = new Float32Array(0);
      this.py = new Float32Array(0);
      this.azar = new Float32Array(0);
      this.banda = new Int8Array(0);
      this.bandas = null;
      this.numBandas = 0;
      this.colores = {};
      this.leerColores();
      this.redimensionar();
    }

    get radio() {
      return Math.min(PARAMETROS.radioMax, Math.max(PARAMETROS.radioMin, PARAMETROS.factorRadio * Math.max(this.ancho, this.alto)));
    }

    leerColores() {
      const estilos = getComputedStyle(this.canvas);
      this.colores = {
        punto: estilos.getPropertyValue('--part-punto').trim(),
        azul: estilos.getPropertyValue('--part-azul').trim(),
        violeta: estilos.getPropertyValue('--part-violeta').trim(),
        magenta: estilos.getPropertyValue('--part-magenta').trim(),
        rojo: estilos.getPropertyValue('--part-rojo').trim(),
        naranja: estilos.getPropertyValue('--part-naranja').trim(),
        amarillo: estilos.getPropertyValue('--part-amarillo').trim()
      };
    }

    redimensionar() {
      if (this.canvas.hasAttribute('data-fijo')) {
        this.ancho = Math.max(1, window.innerWidth);
        this.alto = Math.max(1, window.innerHeight);
      } else {
        const contenedor = this.canvas.parentElement || this.canvas;
        const rect = contenedor.getBoundingClientRect();
        this.ancho = Math.max(1, rect.width);
        this.alto = Math.max(1, rect.height);
      }
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      this.canvas.width = Math.round(this.ancho * dpr);
      this.canvas.height = Math.round(this.alto * dpr);
      this.canvas.style.width = this.ancho + 'px';
      this.canvas.style.height = this.alto + 'px';
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      this.generarPuntos();
    }

    establecerModo(modo) {
      if (modo !== 'ambas' && modo !== 'instagram' && modo !== 'tiktok') return;
      this.modo = modo;
      this.generarPuntos();
    }

    generarPuntos() {
      const cantidad = this.ancho >= 768 ? 1500 : 400;
      const paso = Math.sqrt((this.ancho * this.alto) / cantidad);
      const cols = Math.max(1, Math.round(this.ancho / paso));
      const filas = Math.max(1, Math.round(this.alto / paso));
      const total = cols * filas;

      if (this.total !== total) {
        this.px = new Float32Array(total);
        this.py = new Float32Array(total);
        this.azar = new Float32Array(total);
        this.banda = new Int8Array(total);
        this.total = total;
      }

      const margenX = (this.ancho - (cols - 1) * paso) * 0.5;
      const margenY = (this.alto - (filas - 1) * paso) * 0.5;
      const amplitudDesorden = this.modo === 'instagram' ? 0 : 0.35 * paso;
      const aleatorio = mulberry32(SEMILLA_RETICULA);

      let i = 0;
      for (let fila = 0; fila < filas; fila++) {
        const yBase = margenY + fila * paso;
        for (let col = 0; col < cols; col++) {
          const xBase = margenX + col * paso;
          const dx = (aleatorio() * 2 - 1) * amplitudDesorden;
          const dy = (aleatorio() * 2 - 1) * amplitudDesorden;
          this.px[i] = xBase + dx;
          this.py[i] = yBase + dy;
          this.azar[i] = aleatorio();
          i++;
        }
      }

      if (this.numBandas > 0 && this.bandas) {
        this.establecerBandas(this.bandas);
      } else {
        this.banda.fill(-1);
      }
    }

    // Cada banda es un tramo vertical de la ventana con su propia paleta (secciones oscuras y claras).
    establecerBandas(bandas) {
      if (!bandas || !bandas.length) {
        this.bandas = null;
        this.numBandas = 0;
        this.banda.fill(-1);
        return;
      }

      const n = Math.min(bandas.length, MAX_BANDAS);
      this.bandas = bandas;
      this.numBandas = n;

      const py = this.py;
      const destino = this.banda;
      const total = this.total;

      for (let i = 0; i < total; i++) {
        const y = py[i];
        let indice = -1;
        for (let b = 0; b < n; b++) {
          const tramo = bandas[b];
          if (y >= tramo.y0 && y < tramo.y1) {
            indice = b;
            break;
          }
        }
        destino[i] = indice;
      }
    }

    colorPorAngulo(angulo, azarPunto, paleta, coloresBanda) {
      let f = (angulo + Math.PI) / DOS_PI + (azarPunto - 0.5) * 0.08;
      f = f - Math.floor(f);
      let nombre = paleta[0][1];
      for (let j = paleta.length - 1; j >= 0; j--) {
        if (f >= paleta[j][0]) {
          nombre = paleta[j][1];
          break;
        }
      }
      const fuente = coloresBanda || this.colores;
      return fuente[nombre];
    }

    dibujar(estado) {
      const x = estado ? estado.x : 0;
      const y = estado ? estado.y : 0;
      const alfa = estado && estado.alfa != null ? estado.alfa : 0;
      const ondas = (estado && estado.ondas) || SIN_ONDAS;
      const tiempo = estado && estado.tiempo != null ? estado.tiempo : 0;

      const ctx = this.ctx;
      const total = this.total;
      const px = this.px;
      const py = this.py;
      const azar = this.azar;
      const banda = this.banda;
      const bandas = this.bandas;
      const numBandas = this.numBandas;
      const coloresBase = this.colores;

      ctx.clearRect(0, 0, this.ancho, this.alto);

      ctx.globalAlpha = 1;
      for (let b = -1; b < numBandas; b++) {
        const colBanda = b < 0 ? coloresBase : (bandas[b].colores || coloresBase);
        let abierto = false;
        for (let i = 0; i < total; i++) {
          if (banda[i] !== b) continue;
          if (!abierto) {
            ctx.fillStyle = colBanda.punto;
            ctx.beginPath();
            abierto = true;
          }
          ctx.rect(px[i] - 0.8, py[i] - 0.8, 1.6, 1.6);
        }
        if (abierto) ctx.fill();
      }

      if (alfa > 0.001) {
        const R = this.radio;
        const R2 = R * R;
        const rv = PARAMETROS.radioVacio;
        const rv2 = rv * rv;
        const rvBorde = rv * 1.6;
        const esInstagram = this.modo === 'instagram';
        const paleta = PALETAS[this.modo] || PALETAS.ambas;
        ctx.lineCap = 'round';

        for (let i = 0; i < total; i++) {
          const x0 = px[i];
          const y0 = py[i];
          const dx = x0 - x;
          const dy = y0 - y;
          const d2 = dx * dx + dy * dy;
          if (d2 <= rv2 || d2 >= R2) continue;

          const d = Math.sqrt(d2);
          const t = 1 - d / R;
          const anguloRadial = Math.atan2(dy, dx);

          // Movimiento: una onda viaja desde el puntero hacia afuera; cada trazo crece, se balancea y respira.
          const pulso = esInstagram ? 0 : Math.sin(tiempo * PARAMETROS.ondaVelocidad - d * 0.014 + azar[i] * DOS_PI);
          const giro = esInstagram ? 0 : PARAMETROS.giro * Math.sin(tiempo * 1.3 + azar[i] * DOS_PI);
          const mitadLargo = (PARAMETROS.largoBase + PARAMETROS.largoExtra * t) * 0.5 * (1 + PARAMETROS.ondaAmplitud * pulso);
          const angulo = esInstagram ? 0 : anguloRadial + giro;
          const ux = Math.cos(angulo) * mitadLargo;
          const uy = Math.sin(angulo) * mitadLargo;
          const desplazamiento = PARAMETROS.respiro * pulso * t;
          const cx = x0 + (dx / d) * desplazamiento;
          const cy = y0 + (dy / d) * desplazamiento;

          // El borde del hueco central se suaviza en vez de cortar en seco.
          const suave = d < rvBorde ? (d - rv) / (rvBorde - rv) : 1;

          const b = banda[i];
          const colBanda = b < 0 ? coloresBase : (bandas[b].colores || coloresBase);

          ctx.globalAlpha = alfa * PARAMETROS.opacidad * Math.min(1, 0.35 + 0.65 * t) * suave;
          ctx.lineWidth = PARAMETROS.grosorBase + PARAMETROS.grosorExtra * t;
          ctx.strokeStyle = this.colorPorAngulo(anguloRadial, azar[i], paleta, colBanda);
          ctx.beginPath();
          ctx.moveTo(cx - ux, cy - uy);
          ctx.lineTo(cx + ux, cy + uy);
          ctx.stroke();
        }
      }

      const numOndas = ondas.length;
      if (numOndas > 0) {
        for (let w = 0; w < numOndas; w++) {
          const onda = ondas[w];
          if (!onda || onda.edad >= 1.2 || onda.edad < 0) continue;
          const r = onda.edad * 900;
          const factorEdad = 1 - onda.edad / 1.2;

          for (let i = 0; i < total; i++) {
            const odx = px[i] - onda.x;
            const ody = py[i] - onda.y;
            const dd = Math.sqrt(odx * odx + ody * ody);
            const delta = Math.abs(dd - r);
            if (delta >= 45) continue;

            const b = banda[i];
            const colBanda = b < 0 ? coloresBase : (bandas[b].colores || coloresBase);
            const k = (1 - delta / 45) * factorEdad;
            const desp = dd > 0.0001 ? (6 * k) / dd : 0;
            ctx.fillStyle = colBanda.violeta;
            ctx.globalAlpha = 0.4 + 0.6 * k;
            ctx.beginPath();
            ctx.arc(px[i] + odx * desp, py[i] + ody * desp, 0.8 * (1 + 0.8 * k), 0, DOS_PI);
            ctx.fill();
          }
        }
      }

      ctx.globalAlpha = 1;
    }
  }

  window.CampoParticulas = CampoParticulas;
})();
