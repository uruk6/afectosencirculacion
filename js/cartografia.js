(() => {
  document.addEventListener('DOMContentLoaded', () => {
    const contenedor = document.querySelector('[data-cartografia]');
    if (!contenedor) return;

    const seccion = contenedor.closest('.cartografia') || document;
    const escenario = contenedor.querySelector('[data-escenario]');
    const canvasSilueta = contenedor.querySelector('canvas[data-silueta]');
    const canvasFlujo = contenedor.querySelector('canvas[data-flujo]');
    const contenedorNodos = contenedor.querySelector('[data-nodos]');
    const panel = contenedor.querySelector('#panel-tema') || document.getElementById('panel-tema');
    const vistaLista = seccion.querySelector('[data-lista]');
    const leyenda = seccion.querySelector('.cartografia__leyenda');
    const botonCerrar = panel ? panel.querySelector('[data-cerrar]') : null;
    const estado = seccion.querySelector('[data-estado]');

    if (!escenario || !canvasSilueta || !canvasFlujo || !contenedorNodos || !panel) return;

    const panelContenido = panel.querySelector('.panel__contenido');
    // Lienzo donde se dibujan la silueta y el flujo: los nodos se miden respecto de él.
    const lienzo = canvasSilueta.parentElement;
    // En pantallas grandes la ficha queda al lado del cuerpo; en las demás, debajo.
    const escenaCompleta = window.matchMedia('(min-width: 1200px) and (min-height: 780px)');

    const temas = Array.isArray(window.TEMAS) ? window.TEMAS : [];
    const baseVideos = window.BASE_VIDEOS || { total: 0, tiktok: 0, instagram: 0 };
    const pares = Array.isArray(window.PARES) ? window.PARES : [];

    const silueta = new Silueta(canvasSilueta);
    const flujo = new Flujo(canvasFlujo);

    let plataforma = 'ambas';
    let capa = 'cuerpo';
    let vista = 'cartografia';
    let temaActivo = null;
    let temaFoco = null;

    let fuerza = 0;
    let fuerzaObjetivo = 0;
    let enPantalla = true;
    let enBucle = false;
    let idCuadro = 0;
    let ultimoTiempo = 0;
    let tiempoActual = 0;

    const mediaReducido = window.matchMedia('(prefers-reduced-motion: reduce)');
    const botonesNodo = new Map();

    const esEstatico = () => mediaReducido.matches;

    const obtenerBasePlataforma = (plat) => {
      if (plat === 'instagram') return Number(baseVideos.instagram) || 0;
      if (plat === 'tiktok') return Number(baseVideos.tiktok) || 0;
      return Number(baseVideos.total) || 0;
    };

    const obtenerVideosTema = (tema, plat) => {
      if (!tema || !tema.total) return 0;
      if (plat === 'instagram') return Number(tema.total.instagram) || 0;
      if (plat === 'tiktok') return Number(tema.total.tiktok) || 0;
      return Number(tema.total.videos) || 0;
    };

    const obtenerDatosPlataforma = (tema, plat) => {
      const m = obtenerBasePlataforma(plat);
      const n = obtenerVideosTema(tema, plat);
      const pct = m > 0 ? Math.min(100, Math.max(0, (n / m) * 100)) : 0;
      return { n, m, pct };
    };

    const formatearPorcentaje = (pct) => pct.toFixed(1).replace('.', ',');

    // Los nodos viven en un marco 4:5 centrado en la escena; el lienzo es más ancho que ese marco.
    // Se suma el desfase del marco para dibujar sobre los puntos del cuerpo (la resta no cambia con el desplazamiento).
    const origenNodos = () => {
      const marco = contenedorNodos.getBoundingClientRect();
      const base = lienzo.getBoundingClientRect();
      return { x: marco.left - base.left, y: marco.top - base.top };
    };

    const posicionNodo = (tema, origen) => {
      const boton = botonesNodo.get(tema.id);
      if (boton && boton.offsetWidth > 0) {
        return { x: origen.x + boton.offsetLeft, y: origen.y + boton.offsetTop };
      }
      return {
        x: origen.x + (tema.x / 100) * contenedorNodos.clientWidth,
        y: origen.y + (tema.y / 100) * contenedorNodos.clientHeight
      };
    };

    const obtenerFocoPx = () => {
      if (!temaFoco) return null;
      return posicionNodo(temaFoco, origenNodos());
    };

    const obtenerNodosPx = () => {
      const origen = origenNodos();
      return temas.map((tema) => {
        const { x, y } = posicionNodo(tema, origen);
        return { id: tema.id, x, y, activo: tema.id === temaActivo };
      });
    };

    const dibujarCuadro = (tiempo) => {
      const foco = fuerza > 0.001 ? obtenerFocoPx() : null;
      silueta.dibujar({ foco, fuerza, tiempo });
      flujo.dibujar({
        nodos: obtenerNodosPx(),
        pares,
        tiempo,
        visible: capa === 'circulacion'
      });
    };

    const necesitaAnimacion = () => {
      const animandoFuerza = Math.abs(fuerza - fuerzaObjetivo) > 0.002;
      return capa === 'circulacion' || animandoFuerza || plataforma !== 'instagram';
    };

    const detenerBucle = () => {
      if (!enBucle) return;
      cancelAnimationFrame(idCuadro);
      enBucle = false;
      ultimoTiempo = 0;
    };

    const bucle = (marca) => {
      if (!enBucle || esEstatico() || !enPantalla || document.hidden || vista !== 'cartografia') {
        enBucle = false;
        ultimoTiempo = 0;
        return;
      }

      const tiempo = marca / 1000;
      const dt = ultimoTiempo ? Math.min(tiempo - ultimoTiempo, 0.05) : 1 / 60;
      ultimoTiempo = tiempo;
      tiempoActual = tiempo;

      const k = 1 - Math.pow(1 - 0.12, dt * 60);
      fuerza += (fuerzaObjetivo - fuerza) * k;
      if (Math.abs(fuerza - fuerzaObjetivo) <= 0.002) {
        fuerza = fuerzaObjetivo;
      }

      dibujarCuadro(tiempo);

      if (!necesitaAnimacion()) {
        enBucle = false;
        ultimoTiempo = 0;
        return;
      }

      idCuadro = requestAnimationFrame(bucle);
    };

    const iniciarBucle = () => {
      if (enBucle || esEstatico() || !enPantalla || document.hidden || vista !== 'cartografia') return;
      if (!necesitaAnimacion()) return;
      enBucle = true;
      ultimoTiempo = 0;
      idCuadro = requestAnimationFrame(bucle);
    };

    const redibujar = () => {
      if (esEstatico()) {
        detenerBucle();
        fuerza = fuerzaObjetivo;
        dibujarCuadro(0);
        return;
      }
      dibujarCuadro(tiempoActual);
      iniciarBucle();
    };

    const actualizarLeyenda = () => {
      if (!leyenda) return;
      if (capa === 'circulacion') {
        leyenda.textContent =
          'Cada línea une dos temas que aparecen en un mismo video; cuanto más gruesa, más videos comparten. Muestra qué temas viajan juntos, no cómo se difunden los videos.';
      } else {
        const m = obtenerBasePlataforma(plataforma);
        leyenda.textContent =
          `El tamaño del punto es el porcentaje de videos de la plataforma elegida que tienen ese tema. Base: ${m} videos.`;
      }
    };

    const anunciar = (texto) => {
      if (estado) estado.textContent = texto;
    };

    const actualizarPanel = (tema, enfocar = false) => {
      // La ficha entera se muestra u oculta con data-abierto (el cuerpo se corre y la ficha aparece).
      seccion.toggleAttribute('data-abierto', Boolean(tema));

      if (!tema) {
        panelContenido.replaceChildren();
        return;
      }

      if (typeof window.renderizarPanelTema === 'function') {
        window.renderizarPanelTema(panelContenido, tema, plataforma);
      }

      if (enfocar && !escenaCompleta.matches) {
        panel.focus({ preventScroll: false });
      }
    };

    const actualizarNodos = () => {
      temas.forEach((tema) => {
        const boton = botonesNodo.get(tema.id);
        if (!boton) return;
        const { n, m, pct } = obtenerDatosPlataforma(tema, plataforma);
        const tam = 14 + (30 * pct) / 100;
        boton.style.setProperty('--tam', `${tam}px`);
        boton.setAttribute('aria-label', `${tema.region}: ${tema.nombre}, ${n} de ${m} videos`);
        if (m <= 0 || n <= 0) {
          boton.dataset.apagado = 'true';
        } else {
          boton.removeAttribute('data-apagado');
        }
      });
    };

    const renderizarLista = () => {
      if (!vistaLista) return;
      let lista = vistaLista.querySelector('ul');
      if (!lista) {
        lista = document.createElement('ul');
        vistaLista.appendChild(lista);
      } else {
        lista.replaceChildren();
      }

      temas.forEach((tema) => {
        const { n, m, pct } = obtenerDatosPlataforma(tema, plataforma);
        const item = document.createElement('li');
        item.dataset.tema = tema.id;

        const titulo = document.createElement('h3');
        titulo.textContent = tema.pregunta;

        const resumen = document.createElement('p');
        resumen.textContent = `${tema.nombre} · ${n} de ${m} videos (${formatearPorcentaje(pct)} %)`;

        const encontramos = document.createElement('p');
        encontramos.textContent = tema.encontramos;

        const enlace = document.createElement('a');
        enlace.href = `tema.html?tema=${encodeURIComponent(tema.id)}`;
        enlace.textContent = 'Ver la página del tema';

        item.append(titulo, resumen, encontramos, enlace);
        lista.appendChild(item);
      });
    };

    const seleccionar = (id) => {
      const nuevoId = id && temaActivo !== id ? id : null;
      temaActivo = nuevoId;
      const tema = temas.find((t) => t.id === temaActivo) || null;
      if (tema) temaFoco = tema;
      fuerzaObjetivo = tema ? 1 : 0;

      botonesNodo.forEach((boton, idNodo) => {
        boton.setAttribute('aria-pressed', String(idNodo === temaActivo));
      });

      actualizarPanel(tema, Boolean(tema));
      panel.scrollTop = 0;
      anunciar(tema ? `Ficha abierta: ${tema.region}, ${tema.nombre}.` : 'Ficha cerrada.');
      redibujar();
    };

    if (botonCerrar) {
      botonCerrar.addEventListener('click', () => {
        const botonAnterior = temaActivo ? botonesNodo.get(temaActivo) : null;
        seleccionar(null);
        if (botonAnterior) botonAnterior.focus();
      });
    }

    contenedorNodos.replaceChildren();
    temas.forEach((tema) => {
      const boton = document.createElement('button');
      boton.className = 'nodo';
      boton.type = 'button';
      boton.dataset.tema = tema.id;
      boton.setAttribute('aria-pressed', 'false');
      boton.style.left = `${tema.x}%`;
      boton.style.top = `${tema.y}%`;

      const punto = document.createElement('span');
      punto.className = 'nodo__punto';
      punto.setAttribute('aria-hidden', 'true');

      const etiqueta = document.createElement('span');
      etiqueta.className = 'nodo__etiqueta';
      etiqueta.textContent = tema.region;

      boton.append(punto, etiqueta);
      boton.addEventListener('click', () => seleccionar(tema.id));

      contenedorNodos.appendChild(boton);
      botonesNodo.set(tema.id, boton);
    });

    const configurarGrupo = (atributo, alCambiar) => {
      const botones = seccion.querySelectorAll(`[${atributo}]`);
      botones.forEach((boton) => {
        boton.addEventListener('click', () => {
          const valor = boton.getAttribute(atributo);
          if (!valor) return;
          botones.forEach((b) => b.setAttribute('aria-pressed', String(b === boton)));
          alCambiar(valor);
        });
      });
    };

    configurarGrupo('data-plataforma', (valor) => {
      plataforma = valor;
      silueta.establecerModo(plataforma);
      actualizarNodos();
      actualizarLeyenda();
      renderizarLista();
      if (temaActivo) {
        const tema = temas.find((t) => t.id === temaActivo) || null;
        actualizarPanel(tema, false);
      }
      redibujar();
    });

    configurarGrupo('data-capa', (valor) => {
      capa = valor;
      actualizarLeyenda();
      redibujar();
    });

    configurarGrupo('data-vista', (valor) => {
      vista = valor;
      const esLista = vista === 'lista';
      seccion.dataset.vista = vista;
      contenedor.hidden = esLista;
      if (vistaLista) vistaLista.hidden = !esLista;
      if (esLista) {
        detenerBucle();
      } else {
        silueta.redimensionar();
        flujo.redimensionar();
        redibujar();
      }
    });

    seccion.addEventListener('keydown', (evento) => {
      if (evento.key !== 'Escape' || !temaActivo) return;
      const activo = document.activeElement;
      if (!escenario.contains(activo) && !panel.contains(activo)) return;
      const botonAnterior = botonesNodo.get(temaActivo);
      seleccionar(null);
      if (botonAnterior) botonAnterior.focus();
    });

    const observadorVista = new IntersectionObserver((entradas) => {
      enPantalla = entradas[0]?.isIntersecting ?? true;
      if (!enPantalla) detenerBucle();
      else redibujar();
    });
    observadorVista.observe(escenario);

    const observadorTamano = new ResizeObserver(() => {
      silueta.redimensionar();
      flujo.redimensionar();
      redibujar();
    });
    observadorTamano.observe(escenario);

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) detenerBucle();
      else redibujar();
    });

    mediaReducido.addEventListener('change', () => redibujar());

    actualizarNodos();
    actualizarLeyenda();
    renderizarLista();
    silueta.redimensionar();
    flujo.redimensionar();
    redibujar();
  });
})();
