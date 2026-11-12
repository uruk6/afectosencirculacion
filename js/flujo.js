// Capa "Qué temas viajan juntos": curvas cuadráticas animadas entre nodos de la cartografía.
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
      this.guionCurva = [2, 9];
      this.guionVacio = [];
      this.colores = { violeta: '', amarillo: '' };
      this.fuenteTexto = 'sans-serif';

      this.leerColores();
      this.redimensionar();
    }

    leerColores() {
      const estilos = getComputedStyle(this.canvas);
      this.colores.violeta = estilos.getPropertyValue('--part-violeta').trim();
      this.colores.amarillo = estilos.getPropertyValue('--part-amarillo').trim();
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

    dibujar({ nodos, pares, tiempo = 0, visible } = {}) {
      const ctx = this.ctx;
      ctx.clearRect(0, 0, this.ancho, this.alto);

      if (!visible || !Array.isArray(nodos) || !Array.isArray(pares) || pares.length === 0) {
        return;
      }

      const mapaNodos = new Map();
      for (let i = 0; i < nodos.length; i++) {
        const n = nodos[i];
        if (n && n.id != null) {
          mapaNodos.set(n.id, n);
        }
      }

      let maxVideos = 0;
      for (let i = 0; i < pares.length; i++) {
        const v = Number(pares[i] && pares[i].videos) || 0;
        if (v > maxVideos) maxVideos = v;
      }
      if (maxVideos <= 0) maxVideos = 1;

      ctx.lineCap = 'round';
      ctx.setLineDash(this.guionCurva);
      ctx.lineDashOffset = -tiempo * 40;
      ctx.strokeStyle = this.colores.violeta;
      ctx.fillStyle = this.colores.amarillo;
      ctx.font = `12px ${this.fuenteTexto}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

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
        const lado = k % 2 === 0 ? 1 : -1;
        const desp = 0.18 * distancia * lado;
        const cx = (a.x + b.x) * 0.5 + (-dy / distancia) * desp;
        const cy = (a.y + b.y) * 0.5 + (dx / distancia) * desp;

        const tocaActivo = Boolean(a.activo || b.activo);
        ctx.globalAlpha = tocaActivo ? 0.9 : 0.35;
        ctx.lineWidth = 1 + 5 * (videos / maxVideos);

        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.quadraticCurveTo(cx, cy, b.x, b.y);
        ctx.stroke();

        const t = ((tiempo * 0.15) + k * 0.29) % 1;
        const u = 1 - t;
        const px = u * u * a.x + 2 * u * t * cx + t * t * b.x;
        const py = u * u * a.y + 2 * u * t * cy + t * t * b.y;

        ctx.beginPath();
        ctx.arc(px, py, 3, 0, DOS_PI);
        ctx.fill();

        if (tocaActivo) {
          const mx = 0.25 * a.x + 0.5 * cx + 0.25 * b.x;
          const my = 0.25 * a.y + 0.5 * cy + 0.25 * b.y;
          ctx.fillText(String(videos), mx, my);
        }
      }

      ctx.setLineDash(this.guionVacio);
      ctx.lineDashOffset = 0;
      ctx.globalAlpha = 1;
    }
  }

  window.Flujo = Flujo;
})();
