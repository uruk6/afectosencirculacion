(function () {
  'use strict';

  const DOS_PI = Math.PI * 2;
  const SEMILLA_RETICULA = 0x2026c0de;
  const RADIO_FOCO = 110;
  const RADIO_FOCO_CUAD = RADIO_FOCO * RADIO_FOCO;
  // De la cabeza (calor) a las piernas (frío): un degradado vertical que hace legible el cuerpo.
  const ORDEN_COLORES = ['amarillo', 'naranja', 'magenta', 'violeta', 'azul'];

  function mulberry32(semilla) {
    let a = semilla >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function agregarCapsula(path, x1, y1, x2, y2, radio) {
    const ang = Math.atan2(y2 - y1, x2 - x1);
    const a1 = ang + Math.PI * 0.5;
    const a2 = ang + Math.PI * 1.5;
    path.moveTo(x1 + Math.cos(a1) * radio, y1 + Math.sin(a1) * radio);
    path.arc(x1, y1, radio, a1, a2);
    path.arc(x2, y2, radio, ang - Math.PI * 0.5, a1);
    path.closePath();
  }

  class Silueta {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.modo = 'ambas';
      this.ancho = 0;
      this.alto = 0;
      this.dpr = 1;
      // Retícula de fondo
      this.total = 0;
      this.px = new Float32Array(0);
      this.py = new Float32Array(0);
      this.dentro = new Uint8Array(0);
      // Puntos del cuerpo (retícula más fina, solo dentro de la silueta)
      this.totalCuerpo = 0;
      this.cx = new Float32Array(0);
      this.cy = new Float32Array(0);
      this.cAzar = new Float32Array(0);
      this.cColor = new Uint8Array(0);
      this.silueta = null;
      this.colores = {};
      this.leerColores();
      this.redimensionar();
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
      const contenedor = this.canvas.parentElement || this.canvas;
      const rect = contenedor.getBoundingClientRect();
      this.ancho = Math.max(1, rect.width);
      this.alto = Math.max(1, rect.height);
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);

      this.canvas.width = Math.round(this.ancho * this.dpr);
      this.canvas.height = Math.round(this.alto * this.dpr);
      this.canvas.style.width = this.ancho + 'px';
      this.canvas.style.height = this.alto + 'px';
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

      this.silueta = this.crearSilueta();
      this.generarPuntos();
    }

    crearSilueta() {
      const sh = 0.9 * this.alto;
      const y0 = 0.05 * this.alto;
      const cx = this.ancho * 0.5;
      const path = new Path2D();

      // Cabeza y cuello
      const rCab = 0.075 * sh;
      const cyCab = y0 + 0.11 * sh;
      path.moveTo(cx + rCab, cyCab);
      path.arc(cx, cyCab, rCab, 0, DOS_PI);
      path.rect(cx - 0.03 * sh, y0 + 0.17 * sh, 0.06 * sh, 0.07 * sh);

      // Torso con esquinas redondeadas
      const yHombro = y0 + 0.24 * sh;
      const yCintura = y0 + 0.62 * sh;
      const yCadera = y0 + 0.78 * sh;
      const wHombro = 0.17 * sh;
      const wCintura = 0.12 * sh;
      const wCadera = 0.14 * sh;
      const rTorso = 0.03 * sh;

      path.moveTo(cx, yHombro);
      path.arcTo(cx + wHombro, yHombro, cx + wCintura, yCintura, rTorso);
      path.arcTo(cx + wCintura, yCintura, cx + wCadera, yCadera, rTorso);
      path.arcTo(cx + wCadera, yCadera, cx - wCadera, yCadera, rTorso);
      path.arcTo(cx - wCadera, yCadera, cx - wCintura, yCintura, rTorso);
      path.arcTo(cx - wCintura, yCintura, cx - wHombro, yHombro, rTorso);
      path.arcTo(cx - wHombro, yHombro, cx, yHombro, rTorso);
      path.closePath();

      // Brazos (cápsulas) y manos
      const rBrazo = 0.036 * sh;
      const rMano = 0.04 * sh;
      for (let s = -1; s <= 1; s += 2) {
        agregarCapsula(
          path,
          cx + s * 0.17 * sh,
          y0 + 0.26 * sh,
          cx + s * 0.27 * sh,
          y0 + 0.62 * sh,
          rBrazo
        );
        const mx = cx + s * 0.28 * sh;
        const my = y0 + 0.66 * sh;
        path.moveTo(mx + rMano, my);
        path.arc(mx, my, rMano, 0, DOS_PI);

        // Piernas: el cuerpo llena la altura de la escena
        agregarCapsula(
          path,
          cx + s * 0.075 * sh,
          y0 + 0.76 * sh,
          cx + s * 0.085 * sh,
          y0 + 0.955 * sh,
          0.058 * sh
        );
      }

      return path;
    }

    establecerModo(modo) {
      if (modo !== 'ambas' && modo !== 'instagram' && modo !== 'tiktok') return;
      this.modo = modo;
      this.generarPuntos();
    }

    // Índice de color (0 = cabeza, 4 = piernas) según la altura; un poco de azar suaviza los bordes entre franjas.
    indiceColor(h, azar) {
      if (this.modo === 'instagram') return azar < 0.5 ? 3 : 4;
      if (this.modo === 'tiktok') return azar < 0.34 ? 0 : (azar < 0.67 ? 1 : 2);
      let i = h < 0.16 ? 0 : (h < 0.34 ? 1 : (h < 0.56 ? 2 : (h < 0.78 ? 3 : 4)));
      if (azar < 0.12 && i > 0) i -= 1;
      else if (azar > 0.9 && i < 4) i += 1;
      return i;
    }

    generarPuntos() {
      // En pantallas anchas la densidad sigue el área (≈ un punto cada 21 px) para que el cuerpo
      // se vea igual en el fondo de las páginas y en la escena de la cartografía.
      const cantidad = this.ancho >= 768
        ? Math.min(7000, Math.max(4200, Math.round((this.ancho * this.alto) / 441)))
        : 1600;
      const paso = Math.sqrt((this.ancho * this.alto) / cantidad);
      const cols = Math.max(1, Math.round(this.ancho / paso));
      const filas = Math.max(1, Math.round(this.alto / paso));
      const total = cols * filas;

      if (this.total !== total) {
        this.px = new Float32Array(total);
        this.py = new Float32Array(total);
        this.dentro = new Uint8Array(total);
        this.total = total;
      }

      const margenX = (this.ancho - (cols - 1) * paso) * 0.5;
      const margenY = (this.alto - (filas - 1) * paso) * 0.5;
      const desorden = this.modo === 'instagram' ? 0 : 0.3 * paso;
      const aleatorio = mulberry32(SEMILLA_RETICULA);
      const y0 = 0.05 * this.alto;
      const sh = 0.9 * this.alto;

      // Transformación identidad temporal para evaluar isPointInPath en px CSS
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      let i = 0;
      for (let fila = 0; fila < filas; fila++) {
        const yBase = margenY + fila * paso;
        for (let col = 0; col < cols; col++) {
          const x = margenX + col * paso + (aleatorio() * 2 - 1) * desorden;
          const y = yBase + (aleatorio() * 2 - 1) * desorden;
          this.px[i] = x;
          this.py[i] = y;
          aleatorio();
          this.dentro[i] = this.ctx.isPointInPath(this.silueta, x, y) ? 1 : 0;
          i++;
        }
      }

      // Cuerpo: retícula más fina (≈ 60 % del paso) para que la figura se lea con claridad
      const pasoC = paso * 0.6;
      const cxc = this.ancho * 0.5;
      const x0c = cxc - 0.34 * sh;
      const x1c = cxc + 0.34 * sh;
      const y0c = y0 + 0.02 * sh;
      const y1c = y0 + 1.0 * sh;
      const colsC = Math.max(1, Math.floor((x1c - x0c) / pasoC));
      const filasC = Math.max(1, Math.floor((y1c - y0c) / pasoC));
      const maxC = colsC * filasC;
      const cx = new Float32Array(maxC);
      const cy = new Float32Array(maxC);
      const caz = new Float32Array(maxC);
      const ccol = new Uint8Array(maxC);
      const alC = mulberry32(SEMILLA_RETICULA ^ 0x5a5a);
      const desC = this.modo === 'instagram' ? 0 : 0.28 * pasoC;
      let n = 0;
      for (let f = 0; f < filasC; f++) {
        for (let c = 0; c < colsC; c++) {
          const x = x0c + c * pasoC + (alC() * 2 - 1) * desC;
          const y = y0c + f * pasoC + (alC() * 2 - 1) * desC;
          const azar = alC();
          if (!this.ctx.isPointInPath(this.silueta, x, y)) continue;
          const h = Math.max(0, Math.min(1, (y - y0) / sh));
          cx[n] = x;
          cy[n] = y;
          caz[n] = azar;
          ccol[n] = this.indiceColor(h, azar);
          n++;
        }
      }
      this.cx = cx.subarray(0, n);
      this.cy = cy.subarray(0, n);
      this.cAzar = caz.subarray(0, n);
      this.cColor = ccol.subarray(0, n);
      this.totalCuerpo = n;

      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    }

    // estado: { foco, fuerza, tiempo, camara: { s, fx, fy, tx, ty } }
    // La cámara acerca la escena: un punto P del mundo se ve en (P − F)·s + T.
    dibujar(estado) {
      const foco = estado && estado.foco ? estado.foco : null;
      const fuerza = estado && estado.fuerza > 0 ? estado.fuerza : 0;
      const tiempo = estado && estado.tiempo != null ? estado.tiempo : 0;
      const cam = estado && estado.camara ? estado.camara : null;
      const hayFoco = foco !== null && fuerza > 0;
      const fx = hayFoco ? foco.x : 0;
      const fy = hayFoco ? foco.y : 0;

      const ctx = this.ctx;
      const dpr = this.dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, this.ancho, this.alto);

      const s = cam ? cam.s : 1;
      // Al acercar la cámara los puntos crecen menos que la escena: así se ven más nítidos y no se empastan
      const comp = 1 / Math.pow(s, 0.55);
      if (cam) {
        ctx.setTransform(dpr * s, 0, 0, dpr * s, dpr * (cam.tx - cam.fx * s), dpr * (cam.ty - cam.fy * s));
      }

      const total = this.total;
      const px = this.px;
      const py = this.py;
      const dentro = this.dentro;
      const quieto = this.modo === 'instagram';

      // Retícula de fondo (fuera del cuerpo)
      ctx.globalAlpha = 1;
      ctx.fillStyle = this.colores.punto;
      ctx.beginPath();
      for (let i = 0; i < total; i++) {
        if (!dentro[i]) {
          ctx.rect(px[i] - 0.7 * comp, py[i] - 0.7 * comp, 1.4 * comp, 1.4 * comp);
        }
      }
      ctx.fill();

      // Puntos del cuerpo, agrupados por color: primero el resplandor y luego el núcleo
      const nC = this.totalCuerpo;
      const cxs = this.cx;
      const cys = this.cy;
      const caz = this.cAzar;
      const ccol = this.cColor;
      const enfocados = [];
      for (let pasada = 0; pasada < 2; pasada++) {
        for (let g = 0; g < ORDEN_COLORES.length; g++) {
          ctx.fillStyle = this.colores[ORDEN_COLORES[g]];
          ctx.globalAlpha = pasada === 0 ? 0.16 : 1;
          ctx.beginPath();
          let abierto = false;
          for (let i = 0; i < nC; i++) {
            if (ccol[i] !== g) continue;
            const x = cxs[i];
            const y = cys[i];
            if (hayFoco) {
              const dx = fx - x;
              const dy = fy - y;
              if (dx * dx + dy * dy < RADIO_FOCO_CUAD) {
                if (pasada === 0 && g === 0) enfocados.push(i);
                continue;
              }
            }
            const factor = quieto ? 1 : 1 + 0.18 * Math.sin(tiempo * 2 + caz[i] * 6.28);
            const r = (pasada === 0 ? 5.6 : 2.5) * factor * comp;
            ctx.moveTo(x + r, y);
            ctx.arc(x, y, r, 0, DOS_PI);
            abierto = true;
          }
          if (abierto) ctx.fill();
        }
      }
      ctx.globalAlpha = 1;

      // Puntos cercanos al foco: se acercan al nodo y se encienden
      if (hayFoco) {
        for (let i = 0; i < nC; i++) {
          const dx = fx - cxs[i];
          const dy = fy - cys[i];
          const d2 = dx * dx + dy * dy;
          if (d2 >= RADIO_FOCO_CUAD) continue;
          const d = Math.sqrt(d2);
          const desp = d > 0.0001 ? (18 * fuerza * (1 - d / RADIO_FOCO)) / d : 0;
          ctx.fillStyle = this.colores.amarillo;
          ctx.globalAlpha = 0.22;
          ctx.beginPath();
          ctx.arc(cxs[i] + dx * desp, cys[i] + dy * desp, 6.4 * comp, 0, DOS_PI);
          ctx.fill();
          ctx.globalAlpha = 1;
          ctx.beginPath();
          ctx.arc(cxs[i] + dx * desp, cys[i] + dy * desp, 2.9 * comp, 0, DOS_PI);
          ctx.fill();
        }

        ctx.globalAlpha = 0.6 * fuerza;
        ctx.strokeStyle = this.colores.amarillo;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(fx, fy, 22, 0, DOS_PI);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }
  }

  window.Silueta = Silueta;
})();
