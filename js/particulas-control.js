class ControlParticulas {
  constructor(campo, canvas) {
    this.campo = campo;
    this.canvas = canvas;
    this.fijo = canvas.hasAttribute('data-fijo');
    this.seccion = canvas.parentElement;

    this.x = 0;
    this.y = 0;
    this.objetivoX = 0;
    this.objetivoY = 0;
    this.alfa = 0;
    this.alfaObjetivo = 0;
    this.ondas = [];
    this.modo = 'ambas';
    this._pausado = false;
    this.visible = true;
    this.enBucle = false;

    this.primerMovimiento = true;
    this.ultimoTiempo = 0;
    this.idCuadro = 0;
    this.idCuadroScroll = 0;
    this.tiempoActual = 0;
    this.seccionesBanda = [];
    this.mediaReducido = window.matchMedia('(prefers-reduced-motion: reduce)');

    this.bucle = this.bucle.bind(this);
    if (this.fijo) {
      this.cargarColoresSecciones();
    }
    this.configurarEventos();
    this.redibujar();
  }

  get pausado() {
    return this._pausado;
  }

  set pausado(valor) {
    this._pausado = Boolean(valor);
  }

  esEstatico() {
    return this._pausado || this.mediaReducido.matches;
  }

  leerColoresElemento(elemento) {
    const estilos = getComputedStyle(elemento);
    const base = this.campo.colores || {};
    return {
      punto: estilos.getPropertyValue('--part-punto').trim() || base.punto || '',
      azul: estilos.getPropertyValue('--part-azul').trim() || base.azul || '',
      violeta: estilos.getPropertyValue('--part-violeta').trim() || base.violeta || '',
      magenta: estilos.getPropertyValue('--part-magenta').trim() || base.magenta || '',
      rojo: estilos.getPropertyValue('--part-rojo').trim() || base.rojo || '',
      naranja: estilos.getPropertyValue('--part-naranja').trim() || base.naranja || '',
      amarillo: estilos.getPropertyValue('--part-amarillo').trim() || base.amarillo || ''
    };
  }

  cargarColoresSecciones() {
    if (!this.fijo) return;
    const elementos = [];
    const cabecera = document.querySelector('header');
    if (cabecera && (cabecera.classList.contains('tema-tinta') || cabecera.classList.contains('tema-papel'))) {
      elementos.push(cabecera);
    }
    document.querySelectorAll('main > section, main > div.seccion, footer').forEach((el) => {
      elementos.push(el);
    });
    this.seccionesBanda = elementos.map((elemento) => ({
      elemento,
      colores: this.leerColoresElemento(elemento)
    }));
  }

  actualizarBandas() {
    if (!this.fijo || typeof this.campo.establecerBandas !== 'function') return;
    const altoVentana = window.innerHeight;
    const bandas = [];
    for (let i = 0; i < this.seccionesBanda.length; i++) {
      const item = this.seccionesBanda[i];
      const rect = item.elemento.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > altoVentana) continue;
      bandas.push({
        y0: rect.top,
        y1: rect.bottom,
        colores: item.colores
      });
      if (bandas.length >= 8) break;
    }
    this.campo.establecerBandas(bandas);
  }

  configurarEventos() {
    const actualizarPuntero = (evento) => {
      if (this.fijo) {
        this.objetivoX = evento.clientX;
        this.objetivoY = evento.clientY;
      } else {
        const rect = this.canvas.getBoundingClientRect();
        this.objetivoX = evento.clientX - rect.left;
        this.objetivoY = evento.clientY - rect.top;
      }
      if (this.primerMovimiento) {
        this.x = this.objetivoX;
        this.y = this.objetivoY;
        this.primerMovimiento = false;
      }
      this.alfaObjetivo = 1;
    };

    const objetivoPuntero = this.fijo ? window : this.seccion;

    objetivoPuntero.addEventListener('pointermove', (evento) => {
      if (this.esEstatico()) return;
      actualizarPuntero(evento);
      this.iniciarBucle();
    });

    objetivoPuntero.addEventListener('pointerdown', (evento) => {
      if (this.esEstatico()) return;
      actualizarPuntero(evento);
      this.ondas.push({ x: this.objetivoX, y: this.objetivoY, edad: 0 });
      this.iniciarBucle();
    });

    if (this.fijo) {
      document.addEventListener('pointerout', (evento) => {
        if (this.esEstatico()) return;
        if (evento.relatedTarget === null) {
          this.alfaObjetivo = 0;
          this.iniciarBucle();
        }
      });

      window.addEventListener('resize', () => {
        this.campo.redimensionar();
        this.cargarColoresSecciones();
        this.redibujar();
      });

      // Al desplazarse sin mover el puntero, las bandas cambian de posición: un solo cuadro por evento.
      window.addEventListener('scroll', () => {
        if (this.enBucle || this.idCuadroScroll || document.hidden) return;
        this.idCuadroScroll = requestAnimationFrame(() => {
          this.idCuadroScroll = 0;
          if (this.enBucle || document.hidden) return;
          this.redibujar();
        });
      }, { passive: true });
    } else {
      this.seccion.addEventListener('pointerleave', () => {
        if (this.esEstatico()) return;
        this.alfaObjetivo = 0;
        this.iniciarBucle();
      });

      this.observadorVista = new IntersectionObserver((entradas) => {
        this.visible = entradas[0]?.isIntersecting ?? true;
        if (!this.visible) this.detenerBucle();
      });
      this.observadorVista.observe(this.seccion);

      this.observadorTamano = new ResizeObserver(() => {
        this.campo.redimensionar();
        this.redibujar();
      });
      this.observadorTamano.observe(this.seccion);
    }

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.detenerBucle();
        if (this.idCuadroScroll) {
          cancelAnimationFrame(this.idCuadroScroll);
          this.idCuadroScroll = 0;
        }
      }
    });

    this.mediaReducido.addEventListener('change', () => this.redibujar());
  }

  iniciarBucle() {
    if (this.enBucle || this.esEstatico() || !this.visible || document.hidden) return;
    if (this.idCuadroScroll) {
      cancelAnimationFrame(this.idCuadroScroll);
      this.idCuadroScroll = 0;
    }
    this.enBucle = true;
    this.ultimoTiempo = 0;
    this.idCuadro = requestAnimationFrame(this.bucle);
  }

  detenerBucle() {
    if (!this.enBucle) return;
    cancelAnimationFrame(this.idCuadro);
    this.enBucle = false;
    this.ultimoTiempo = 0;
  }

  redibujar() {
    this.actualizarBandas();
    if (this.esEstatico()) {
      this.detenerBucle();
      this.ondas = [];
      const rect = this.fijo ? null : this.seccion.getBoundingClientRect();
      const ancho = this.fijo ? window.innerWidth : rect.width;
      const alto = this.fijo ? window.innerHeight : rect.height;
      this.campo.dibujar({
        x: ancho * 0.5,
        y: alto * 0.45,
        alfa: 1,
        ondas: []
      });
      return;
    }
    this.campo.dibujar({ x: this.x, y: this.y, alfa: this.alfa, ondas: this.ondas, tiempo: this.tiempoActual });
  }

  bucle(tiempo) {
    if (!this.enBucle || this.esEstatico() || !this.visible || document.hidden) {
      this.enBucle = false;
      this.ultimoTiempo = 0;
      return;
    }

    const dt = this.ultimoTiempo ? Math.min((tiempo - this.ultimoTiempo) / 1000, 0.05) : 1 / 60;
    this.ultimoTiempo = tiempo;

    const factor = this.modo === 'instagram' ? 1 : (this.modo === 'tiktok' ? 0.05 : 0.12);
    const k = 1 - Math.pow(1 - factor, dt * 60);
    this.x += (this.objetivoX - this.x) * k;
    this.y += (this.objetivoY - this.y) * k;

    const pasoAlfa = dt / 0.6;
    if (this.alfa < this.alfaObjetivo) {
      this.alfa = Math.min(this.alfaObjetivo, this.alfa + pasoAlfa);
    } else if (this.alfa > this.alfaObjetivo) {
      this.alfa = Math.max(this.alfaObjetivo, this.alfa - pasoAlfa);
    }

    for (let i = this.ondas.length - 1; i >= 0; i--) {
      this.ondas[i].edad += dt;
      if (this.ondas[i].edad > 1.2) this.ondas.splice(i, 1);
    }

    this.tiempoActual = tiempo / 1000;
    this.actualizarBandas();
    this.campo.dibujar({ x: this.x, y: this.y, alfa: this.alfa, ondas: this.ondas, tiempo: this.tiempoActual });

    // El halo respira mientras sea visible: el bucle solo se detiene cuando se apaga del todo.
    const sinOndas = this.ondas.length === 0;
    const alfaEstable = Math.abs(this.alfa - this.alfaObjetivo) < 0.001;
    const oculto = alfaEstable && this.alfaObjetivo === 0;

    if (sinOndas && oculto) {
      this.alfa = this.alfaObjetivo;
      this.enBucle = false;
      this.ultimoTiempo = 0;
      return;
    }

    this.idCuadro = requestAnimationFrame(this.bucle);
  }

  establecerModo(modo) {
    this.modo = modo;
    this.campo.establecerModo(modo);
    this.redibujar();
  }

  alternarPausa() {
    this._pausado = !this._pausado;
    this.redibujar();
    return this._pausado;
  }

  recargarColores() {
    this.campo.leerColores();
    if (this.fijo) {
      this.cargarColoresSecciones();
    }
    this.redibujar();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('canvas[data-particulas]').forEach((canvas) => {
    const campo = new CampoParticulas(canvas);
    canvas.control = new ControlParticulas(campo, canvas);
  });
});
