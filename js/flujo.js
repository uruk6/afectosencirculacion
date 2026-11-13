// Capa de la cartografía sobre el cuerpo: líneas entre temas que aparecen juntos en un mismo video
// y, cuando se abre un tema, las líneas del «universo» que lo rodea.
(function () {
  'use strict';

  const DOS_PI = Math.PI * 2;

  class Flujo {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.ancho = 0;
      this.alto = 0;
      this.dpr = 1;
      this.colores = { violeta: '', amarillo: '', fondo: '', texto: '' };
      this.fuenteTexto = 'sans-serif';

      this.leerColores();
      this.redimensionar();
    }

    leerColores() {
      const estilos = getComputedStyle(this.canvas);
      this.colores.violeta = estilos.getPropertyValue('--part-violeta').trim();
      this.colores.amarillo = estilos.getPropertyValue('--part-amarillo').trim();
      this.colores.fondo = estilos.getPropertyValue('--fondo').trim();
      this.colores.texto = estilos.getPropertyValue('--color-texto').trim();
      this.fuenteTexto =
        estilos.getPropertyValue('--fuente-texto').trim() ||
        estilos.fontFamily ||
        'sans-serif';
    }

    redimensionar() {
      const padre = this.canvas.parentElement;
      if (!padre) return;

      const rect = padre.getBoundingClientRect();
      this.ancho = Math.max(1, Math.floor(rect.width));
      this.alto = Math.max(1, Math.floor(rect.height));
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);

      this.canvas.width = Math.round(this.ancho * this.dpr);
      this.canvas.height = Math.round(this.alto * this.dpr);
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    }

    // nodos: [{ id, x, y, activo }] ya en pantalla; pares: [{ a, b, videos }]
    // opciones.extras(ctx, colores): dibuja encima, también en coordenadas de pantalla.
    dibujar({ nodos, pares, tiempo = 0, visible, extras } = {}) {
      const ctx = this.ctx;
      ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      ctx.clearRect(0, 0, this.ancho, this.alto);

      if (visible && Array.isArray(nodos) && Array.isArray(pares) && pares.length > 0) {
        this.dibujarPares(ctx, nodos, pares, tiempo);
      }

      if (typeof extras === 'function') {
        extras(ctx, this.colores, tiempo);
      }
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
    }

    dibujarPares(ctx, nodos, pares, tiempo) {
      const mapaNodos = new Map();
      for (let i = 0; i < nodos.length; i++) {
        const n = nodos[i];
        if (n && n.id != null) mapaNodos.set(n.id, n);
      }

      let maxVideos = 0;
      for (let i = 0; i < pares.length; i++) {
        const v = Number(pares[i] && pares[i].videos) || 0;
        if (v > maxVideos) maxVideos = v;
      }
      if (maxVideos <= 0) maxVideos = 1;

      // Las tres conexiones más fuertes se dibujan en amarillo; el resto, en violeta
      const ordenadas = pares.map((p) => Number(p && p.videos) || 0).sort((a, b) => b - a);
      const umbralFuerte = ordenadas[Math.min(2, ordenadas.length - 1)];

      const etiquetas = [];
      ctx.lineCap = 'round';
      ctx.setLineDash([]);

      for (let k = 0; k < pares.length; k++) {
        const par = pares[k];
        if (!par) continue;
        const a = mapaNodos.get(par.a);
        const b = mapaNodos.get(par.b);
        if (!a || !b) continue;

        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const distancia = Math.hypot(dx, dy);
        if (distancia === 0) continue;

        const videos = Number(par.videos) || 0;
        const fuerte = videos >= umbralFuerte;
        const lado = k % 2 === 0 ? 1 : -1;
        const desp = (0.24 + 0.1 * (k % 3)) * distancia * lado;
        const cx = (a.x + b.x) * 0.5 + (-dy / distancia) * desp;
        const cy = (a.y + b.y) * 0.5 + (dx / distancia) * desp;

        const tocaActivo = Boolean(a.activo || b.activo);
        const hayActivo = nodos.some((n) => n.activo);
        ctx.globalAlpha = hayActivo ? (tocaActivo ? 0.95 : 0.2) : (fuerte ? 0.9 : 0.55);
        ctx.strokeStyle = fuerte ? this.colores.amarillo : this.colores.violeta;
        ctx.lineWidth = 1.5 + 11 * (videos / maxVideos);

        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.quadraticCurveTo(cx, cy, b.x, b.y);
        ctx.stroke();

        // Una chispa recorre la línea para dar sentido de «circulación»
        const t = ((tiempo * 0.12) + k * 0.29) % 1;
        const u = 1 - t;
        const px = u * u * a.x + 2 * u * t * cx + t * t * b.x;
        const py = u * u * a.y + 2 * u * t * cy + t * t * b.y;
        ctx.globalAlpha = 1;
        ctx.fillStyle = this.colores.texto;
        ctx.beginPath();
        ctx.arc(px, py, 2.6, 0, DOS_PI);
        ctx.fill();

        const mx = 0.25 * a.x + 0.5 * cx + 0.25 * b.x;
        const my = 0.25 * a.y + 0.5 * cy + 0.25 * b.y;
        etiquetas.push({ x: mx, y: my, videos, fuerte, tenue: hayActivo && !tocaActivo });
      }

      // Cada línea lleva su cifra: cuántos videos hablan a la vez de los dos temas
      ctx.font = `600 13px ${this.fuenteTexto}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (let i = 0; i < etiquetas.length; i++) {
        const e = etiquetas[i];
        if (e.tenue) continue;
        const texto = String(e.videos);
        const w = ctx.measureText(texto).width + 14;
        ctx.globalAlpha = 1;
        ctx.fillStyle = this.colores.fondo;
        ctx.beginPath();
        ctx.roundRect(e.x - w / 2, e.y - 11, w, 22, 11);
        ctx.fill();
        ctx.strokeStyle = e.fuerte ? this.colores.amarillo : this.colores.violeta;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.fillStyle = this.colores.texto;
        ctx.fillText(texto, e.x, e.y + 0.5);
      }
    }
  }

  window.Flujo = Flujo;
})();
