(function () {
  'use strict';

  const DOS_PI = Math.PI * 2;
  const SEMILLA_RETICULA = 0x2026c0de;
  const RADIO_FOCO = 110;
  const RADIO_FOCO_CUAD = RADIO_FOCO * RADIO_FOCO;

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
      this.total = 0;
      this.px = new Float32Array(0);
      this.py = new Float32Array(0);
      this.altura = new Float32Array(0);
      this.azar = new Float32Array(0);
      this.dentro = new Uint8Array(0);
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
      }

      return path;
    }

    establecerModo(modo) {
      if (modo !== 'ambas' && modo !== 'instagram' && modo !== 'tiktok') return;
      this.modo = modo;
      this.generarPuntos();
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
        this.altura = new Float32Array(total);
        this.azar = new Float32Array(total);
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
          this.azar[i] = aleatorio();
          this.altura[i] = Math.max(0, Math.min(1, (y - y0) / sh));
          this.dentro[i] = this.ctx.isPointInPath(this.silueta, x, y) ? 1 : 0;
          i++;
        }
      }
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    }

    colorPunto(h, azar) {
      if (this.modo === 'instagram') {
        return h < 0.5 ? this.colores.azul : this.colores.violeta;
      }
      if (this.modo === 'tiktok') {
        if (azar < 0.25) return this.colores.rojo;
        if (azar < 0.5) return this.colores.naranja;
        if (azar < 0.75) return this.colores.magenta;
        return this.colores.amarillo;
      }
      if (azar < 0.12) return this.colores.naranja;
      if (h < 0.45) return this.colores.azul;
      if (h <= 0.75) return this.colores.violeta;
      return this.colores.violeta;
    }

    dibujar(estado) {
      const foco = estado && estado.foco ? estado.foco : null;
      const fuerza = estado && estado.fuerza > 0 ? estado.fuerza : 0;
      const tiempo = estado && estado.tiempo != null ? estado.tiempo : 0;
      const hayFoco = foco !== null && fuerza > 0;
      const fx = hayFoco ? foco.x : 0;
      const fy = hayFoco ? foco.y : 0;

      const ctx = this.ctx;
      const total = this.total;
      const px = this.px;
      const py = this.py;
      const altura = this.altura;
      const azar = this.azar;
      const dentro = this.dentro;
      const quieto = this.modo === 'instagram';

      ctx.clearRect(0, 0, this.ancho, this.alto);

      ctx.globalAlpha = 1;
      ctx.fillStyle = this.colores.punto;
      ctx.beginPath();
      for (let i = 0; i < total; i++) {
        if (!dentro[i]) {
          ctx.rect(px[i] - 0.7, py[i] - 0.7, 1.4, 1.4);
        }
      }
      ctx.fill();

      for (let i = 0; i < total; i++) {
        if (!dentro[i]) continue;
        let x = px[i];
        let y = py[i];

        if (hayFoco) {
          const dx = fx - x;
          const dy = fy - y;
          const d2 = dx * dx + dy * dy;
          if (d2 < RADIO_FOCO_CUAD) {
            const d = Math.sqrt(d2);
            const desp = d > 0.0001 ? (18 * fuerza * (1 - d / RADIO_FOCO)) / d : 0;
            ctx.fillStyle = this.colores.amarillo;
            ctx.beginPath();
            ctx.arc(x + dx * desp, y + dy * desp, 2.4, 0, DOS_PI);
            ctx.fill();
            continue;
          }
        }

        const factor = quieto ? 1 : 1 + 0.15 * Math.sin(tiempo * 2 + azar[i] * 6.28);
        ctx.fillStyle = this.colorPunto(altura[i], azar[i]);
        ctx.beginPath();
        ctx.arc(x, y, 2.2 * factor, 0, DOS_PI);
        ctx.fill();
      }

      if (hayFoco) {
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
