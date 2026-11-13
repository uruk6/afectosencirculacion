// Cartografía del cuerpo. Al elegir un punto la cámara se acerca a él y a su alrededor aparece un
// «universo»: un punto por cada parte del tema. Al elegir uno se abre su ficha.
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
    const botonVolver = contenedor.querySelector('[data-volver]');
    const estado = seccion.querySelector('[data-estado]');

    if (!escenario || !canvasSilueta || !canvasFlujo || !contenedorNodos || !panel) return;

    const panelContenido = panel.querySelector('.panel__contenido');
    const lienzo = canvasSilueta.parentElement;
    const capaSatelites = lienzo.querySelector('[data-satelites]');
    const tituloUniverso = lienzo.querySelector('[data-universo-titulo]');
    const listaSatelites = contenedor.querySelector('[data-satelites-lista]');

    const escenaCompleta = window.matchMedia('(min-width: 1200px) and (min-height: 780px)');
    const pantallaAncha = window.matchMedia('(min-width: 700px)');
    const mediaReducido = window.matchMedia('(prefers-reduced-motion: reduce)');

    const temas = Array.isArray(window.TEMAS) ? window.TEMAS : [];
    const baseVideos = window.BASE_VIDEOS || { total: 0, tiktok: 0, instagram: 0 };
    const pares = Array.isArray(window.PARES) ? window.PARES : [];
    const nombresTema = new Map(temas.map((t) => [t.id, t.region]));

    const silueta = new Silueta(canvasSilueta);
    const flujo = new Flujo(canvasFlujo);

    let plataforma = 'ambas';
    let capa = 'cuerpo';
    let vista = 'cartografia';
    let temaActivo = null;
    let seccionActiva = null;
    let satelites = [];

    let fuerza = 0;
    let fuerzaObjetivo = 0;
    let enPantalla = true;
    let enBucle = false;
    let idCuadro = 0;
    let ultimoTiempo = 0;
    let tiempoActual = 0;

    // Cámara: un punto P del mundo se ve en (P − F)·s + C
    const cam = { s: 1, cx: 0, cy: 0, fx: 0, fy: 0, sObj: 1, cxObj: 0, cyObj: 0 };
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
    const limitar = (v, a, b) => Math.min(b, Math.max(a, v));

    // --- Geometría -----------------------------------------------------------------

    // Los nodos viven en un marco 4:5 centrado en la escena; el lienzo es más ancho que ese marco.
    const origenNodos = () => {
      const marco = contenedorNodos.getBoundingClientRect();
      const base = lienzo.getBoundingClientRect();
      return { x: marco.left - base.left, y: marco.top - base.top };
    };

    const posicionBase = (tema, origen) => ({
      x: origen.x + (tema.x / 100) * contenedorNodos.clientWidth,
      y: origen.y + (tema.y / 100) * contenedorNodos.clientHeight
    });

    const aPantalla = (p) => ({
      x: (p.x - cam.fx) * cam.s + cam.cx,
      y: (p.y - cam.fy) * cam.s + cam.cy
    });

    const centroLienzo = () => ({ x: lienzo.clientWidth / 2, y: lienzo.clientHeight / 2 });

    const zoomObjetivo = () => (pantallaAncha.matches ? 2.5 : 2.1);

    // Hacia dónde mira la cámara: el centro de la escena y, si hay ficha a un lado, el centro del espacio libre
    const centroObjetivo = () => {
      const c = centroLienzo();
      if (seccionActiva && escenaCompleta.matches) {
        c.x -= (panel.offsetWidth + 24) / 2;
      }
      return c;
    };

    const posicionNodoMundo = (tema) => posicionBase(tema, origenNodos());

    // --- Dibujo ----------------------------------------------------------------------

    const progresoUniverso = () => {
      const sObj = zoomObjetivo();
      return limitar((cam.s - 1) / (sObj - 1), 0, 1);
    };

    const radioUniverso = () => {
      const alto = lienzo.clientHeight;
      const ancho = escenario.clientWidth;
      return pantallaAncha.matches
        ? limitar(Math.min(alto * 0.34, ancho * 0.27), 150, 270)
        : limitar(ancho * 0.36, 110, 170);
    };

    const nodosPantalla = () => {
      const origen = origenNodos();
      return temas.map((tema) => {
        const p = aPantalla(posicionBase(tema, origen));
        return { id: tema.id, x: p.x, y: p.y, activo: tema.id === temaActivo };
      });
    };

    const centroUniversoPantalla = () => {
      const tema = temas.find((t) => t.id === temaActivo);
      return tema ? aPantalla(posicionNodoMundo(tema)) : centroLienzo();
    };

    const dibujarExtras = (ctx, colores) => {
      if (!satelites.length) return;
      const c = centroUniversoPantalla();
      const u = progresoUniverso();
      const R = radioUniverso() * u;
      if (R < 4) return;
      ctx.globalAlpha = 0.35 * u;
      ctx.strokeStyle = colores.amarillo;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 7]);
      ctx.beginPath();
      ctx.arc(c.x, c.y, R, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 0.5 * u;
      satelites.forEach((s) => {
        ctx.beginPath();
        ctx.moveTo(c.x, c.y);
        ctx.lineTo(c.x + Math.cos(s.angulo) * R, c.y + Math.sin(s.angulo) * R);
        ctx.stroke();
      });
      ctx.globalAlpha = 1;
    };

    const actualizarDom = () => {
      const origen = origenNodos();
      temas.forEach((tema) => {
        const boton = botonesNodo.get(tema.id);
        if (!boton) return;
        const p = aPantalla(posicionBase(tema, origen));
        boton.style.left = `${p.x - origen.x}px`;
        boton.style.top = `${p.y - origen.y}px`;
      });

      if (!satelites.length) return;
      const c = centroUniversoPantalla();
      const u = progresoUniverso();
      const R = radioUniverso() * u;
      const orbita = pantallaAncha.matches;

      if (tituloUniverso) {
        tituloUniverso.style.left = `${c.x}px`;
        tituloUniverso.style.top = `${c.y + 38}px`;
        tituloUniverso.style.opacity = String(limitar((u - 0.5) * 2, 0, 1));
      }

      if (!orbita) return;
      satelites.forEach((s) => {
        const x = c.x + Math.cos(s.angulo) * R;
        const y = c.y + Math.sin(s.angulo) * R;
        s.boton.style.left = `${x}px`;
        s.boton.style.top = `${y}px`;
        s.boton.style.opacity = String(limitar((u - 0.35) * 1.6, 0, 1));
      });
    };

    const dibujarCuadro = (tiempo) => {
      const tema = temas.find((t) => t.id === temaActivo) || null;
      const foco = tema && fuerza > 0.001 ? posicionNodoMundo(tema) : null;
      silueta.dibujar({
        foco,
        fuerza,
        tiempo,
        camara: { s: cam.s, fx: cam.fx, fy: cam.fy, tx: cam.cx, ty: cam.cy }
      });
      flujo.dibujar({
        nodos: nodosPantalla(),
        pares,
        tiempo,
        visible: capa === 'circulacion',
        extras: dibujarExtras
      });
      actualizarDom();
    };

    const camaraEnMovimiento = () =>
      Math.abs(cam.s - cam.sObj) > 0.003 ||
      Math.abs(cam.cx - cam.cxObj) > 0.4 ||
      Math.abs(cam.cy - cam.cyObj) > 0.4;

    const necesitaAnimacion = () => {
      const animandoFuerza = Math.abs(fuerza - fuerzaObjetivo) > 0.002;
      return capa === 'circulacion' || animandoFuerza || camaraEnMovimiento() || plataforma !== 'instagram';
    };

    const detenerBucle = () => {
      if (!enBucle) return;
      cancelAnimationFrame(idCuadro);
      enBucle = false;
      ultimoTiempo = 0;
    };

    const retirarSateliteSiCorresponde = () => {
      if (!temaActivo && satelites.length && cam.s < 1.02) {
        vaciarUniverso();
      }
    };

    const avanzarCamara = (dt) => {
      const k = 1 - Math.pow(1 - 0.09, dt * 60);
      cam.s += (cam.sObj - cam.s) * k;
      cam.cx += (cam.cxObj - cam.cx) * k;
      cam.cy += (cam.cyObj - cam.cy) * k;
      if (!camaraEnMovimiento()) {
        cam.s = cam.sObj;
        cam.cx = cam.cxObj;
        cam.cy = cam.cyObj;
      }
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
      if (Math.abs(fuerza - fuerzaObjetivo) <= 0.002) fuerza = fuerzaObjetivo;
      avanzarCamara(dt);

      dibujarCuadro(tiempo);
      retirarSateliteSiCorresponde();

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
        cam.s = cam.sObj;
        cam.cx = cam.cxObj;
        cam.cy = cam.cyObj;
        dibujarCuadro(0);
        retirarSateliteSiCorresponde();
        return;
      }
      dibujarCuadro(tiempoActual);
      iniciarBucle();
    };

    // --- Textos de apoyo -----------------------------------------------------------------

    const textoParesMasFuertes = () => {
      const ordenados = pares.slice().sort((x, y) => y.videos - x.videos).slice(0, 3);
      const frases = ordenados.map((p) => `${nombresTema.get(p.a)} y ${nombresTema.get(p.b)} (${p.videos})`);
      return frases.length ? `Los que más se juntan: ${frases.join('; ')}.` : '';
    };

    const actualizarLeyenda = () => {
      if (!leyenda) return;
      if (capa === 'circulacion') {
        leyenda.textContent =
          `Cada línea une dos temas que aparecen a la vez en un mismo video, y su número dice en cuántos de los ${baseVideos.total} videos pasa. ` +
          `Cuanto más gruesa, más se juntan. Es igual en Instagram y en TikTok, por eso no cambia con la plataforma. ${textoParesMasFuertes()}`;
      } else {
        const m = obtenerBasePlataforma(plataforma);
        leyenda.textContent =
          `El tamaño del punto es el porcentaje de videos de la plataforma elegida que tienen ese tema. Base: ${m} videos.`;
      }
    };

    const anunciar = (texto) => {
      if (estado) estado.textContent = texto;
    };

    // --- Universo de un tema ---------------------------------------------------------------

    function vaciarUniverso() {
      satelites.forEach((s) => s.boton.remove());
      satelites = [];
      if (capaSatelites) capaSatelites.replaceChildren();
      if (listaSatelites) {
        listaSatelites.replaceChildren();
        listaSatelites.hidden = true;
      }
      if (tituloUniverso) tituloUniverso.hidden = true;
    }

    function crearUniverso(tema) {
      vaciarUniverso();
      const secciones = typeof window.seccionesTema === 'function' ? window.seccionesTema(tema) : [];
      const total = secciones.length;
      const orbita = pantallaAncha.matches;
      const destino = orbita ? capaSatelites : listaSatelites;
      if (!destino) return;

      secciones.forEach((sec, i) => {
        const angulo = -Math.PI / 2 + (i * 2 * Math.PI) / total;
        const boton = document.createElement('button');
        boton.type = 'button';
        boton.className = 'satelite';
        boton.dataset.seccion = sec.clave;
        boton.setAttribute('aria-pressed', 'false');
        const lado = Math.cos(angulo) > 0.35 ? 'der' : (Math.cos(angulo) < -0.35 ? 'izq' : (Math.sin(angulo) < 0 ? 'arriba' : 'abajo'));
        boton.dataset.lado = lado;

        const numero = document.createElement('span');
        numero.className = 'satelite__numero';
        numero.textContent = String(i + 1);
        numero.setAttribute('aria-hidden', 'true');

        const etiqueta = document.createElement('span');
        etiqueta.className = 'satelite__etiqueta';
        etiqueta.textContent = sec.etiqueta;

        boton.append(numero, etiqueta);
        boton.addEventListener('click', () => abrirSeccion(sec.clave));
        destino.appendChild(boton);
        satelites.push({ clave: sec.clave, angulo, boton });
      });

      if (listaSatelites) listaSatelites.hidden = orbita;
      if (tituloUniverso) {
        tituloUniverso.hidden = false;
        tituloUniverso.querySelector('[data-universo-nombre]').textContent = `${tema.region} · ${tema.nombre}`;
        tituloUniverso.querySelector('[data-universo-pregunta]').textContent = tema.pregunta;
      }
    }

    function abrirSeccion(clave) {
      const tema = temas.find((t) => t.id === temaActivo);
      if (!tema) return;
      seccionActiva = clave;
      satelites.forEach((s) => s.boton.setAttribute('aria-pressed', String(s.clave === clave)));
      if (typeof window.renderizarSeccionTema === 'function') {
        window.renderizarSeccionTema(panelContenido, tema, clave, plataforma);
      }
      seccion.setAttribute('data-ficha', '');
      panel.scrollTop = 0;
      cam.cxObj = centroObjetivo().x;
      const etiqueta = satelites.find((s) => s.clave === clave)?.boton.textContent || '';
      anunciar(`Ficha abierta: ${etiqueta}.`);
      if (!escenaCompleta.matches) panel.focus({ preventScroll: false });
      redibujar();
    }

    function cerrarFicha() {
      if (!seccionActiva) return false;
      seccionActiva = null;
      satelites.forEach((s) => s.boton.setAttribute('aria-pressed', 'false'));
      seccion.removeAttribute('data-ficha');
      panelContenido.replaceChildren();
      cam.cxObj = centroObjetivo().x;
      anunciar('Ficha cerrada.');
      redibujar();
      return true;
    }

    function abrirTema(tema) {
      // La cámara sigue donde está: el nuevo foco se fija en el punto que ya ocupa en pantalla
      const nuevo = posicionNodoMundo(tema);
      const enPantallaActual = aPantalla(nuevo);
      cam.fx = nuevo.x;
      cam.fy = nuevo.y;
      cam.cx = enPantallaActual.x;
      cam.cy = enPantallaActual.y;

      temaActivo = tema.id;
      seccionActiva = null;
      seccion.removeAttribute('data-ficha');
      panelContenido.replaceChildren();
      seccion.setAttribute('data-abierto', '');
      if (botonVolver) botonVolver.hidden = false;

      cam.sObj = zoomObjetivo();
      const c = centroLienzo();
      cam.cxObj = c.x;
      cam.cyObj = c.y;
      fuerzaObjetivo = 1;

      botonesNodo.forEach((boton, id) => {
        boton.setAttribute('aria-pressed', String(id === tema.id));
        boton.dataset.apagado = id === tema.id ? 'false' : 'true';
      });
      crearUniverso(tema);
      anunciar(`Tema abierto: ${tema.region}, ${tema.nombre}. Elige uno de los puntos que lo rodean.`);
      if (satelites[0]) satelites[0].boton.focus({ preventScroll: true });
      actualizarNodos();
      redibujar();
    }

    function cerrarTema() {
      const anterior = temaActivo;
      cerrarFicha();
      temaActivo = null;
      seccion.removeAttribute('data-abierto');
      if (botonVolver) botonVolver.hidden = true;
      cam.sObj = 1;
      cam.cxObj = cam.fx;
      cam.cyObj = cam.fy;
      fuerzaObjetivo = 0;
      botonesNodo.forEach((boton) => {
        boton.setAttribute('aria-pressed', 'false');
        boton.removeAttribute('data-apagado');
      });
      anunciar('Volviste al cuerpo completo.');
      actualizarNodos();
      redibujar();
      return anterior;
    }

    const seleccionar = (id) => {
      if (!id || temaActivo === id) {
        const anterior = cerrarTema();
        const boton = anterior ? botonesNodo.get(anterior) : null;
        if (boton) boton.focus();
        return;
      }
      const tema = temas.find((t) => t.id === id);
      if (tema) abrirTema(tema);
    };

    // --- Nodos, lista y controles -----------------------------------------------------------

    const actualizarNodos = () => {
      temas.forEach((tema) => {
        const boton = botonesNodo.get(tema.id);
        if (!boton) return;
        const { n, m, pct } = obtenerDatosPlataforma(tema, plataforma);
        const tam = tema.id === temaActivo ? 46 : 14 + (30 * pct) / 100;
        boton.style.setProperty('--tam', `${tam}px`);
        boton.setAttribute('aria-label', `${tema.region}: ${tema.nombre}, ${n} de ${m} videos`);
        if (!temaActivo && (m <= 0 || n <= 0)) boton.dataset.apagado = 'true';
        else if (!temaActivo) boton.removeAttribute('data-apagado');
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
        encontramos.textContent = tema.queEs || tema.encontramos;

        const enlace = document.createElement('a');
        enlace.href = `tema.html?tema=${encodeURIComponent(tema.id)}`;
        enlace.textContent = 'Ver el tema completo';

        item.append(titulo, resumen, encontramos, enlace);
        lista.appendChild(item);
      });
    };

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
          if (!valor || boton.disabled) return;
          botones.forEach((b) => b.setAttribute('aria-pressed', String(b === boton)));
          alCambiar(valor);
        });
      });
    };

    // «Qué temas viajan juntos» es igual en las dos plataformas: se desactiva la elección de plataforma
    const actualizarEstadoPlataforma = () => {
      const bloqueada = capa === 'circulacion';
      seccion.querySelectorAll('[data-plataforma]').forEach((b) => {
        b.disabled = bloqueada;
        b.title = bloqueada ? 'Esta capa es igual en Instagram y en TikTok' : '';
      });
    };

    configurarGrupo('data-plataforma', (valor) => {
      plataforma = valor;
      silueta.establecerModo(plataforma);
      actualizarNodos();
      actualizarLeyenda();
      renderizarLista();
      if (temaActivo && seccionActiva) abrirSeccion(seccionActiva);
      redibujar();
    });

    configurarGrupo('data-capa', (valor) => {
      capa = valor;
      actualizarEstadoPlataforma();
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

    if (botonCerrar) {
      botonCerrar.addEventListener('click', () => {
        const activo = satelites.find((s) => s.clave === seccionActiva);
        cerrarFicha();
        if (activo) activo.boton.focus();
      });
    }

    if (botonVolver) {
      botonVolver.addEventListener('click', () => {
        const anterior = cerrarTema();
        const boton = anterior ? botonesNodo.get(anterior) : null;
        if (boton) boton.focus();
      });
    }

    seccion.addEventListener('keydown', (evento) => {
      if (evento.key !== 'Escape' || !temaActivo) return;
      const activo = document.activeElement;
      if (!contenedor.contains(activo)) return;
      if (seccionActiva) {
        const boton = satelites.find((s) => s.clave === seccionActiva)?.boton;
        cerrarFicha();
        if (boton) boton.focus();
      } else {
        const anterior = cerrarTema();
        const boton = anterior ? botonesNodo.get(anterior) : null;
        if (boton) boton.focus();
      }
    });

    const observadorVista = new IntersectionObserver((entradas) => {
      enPantalla = entradas[0]?.isIntersecting ?? true;
      if (!enPantalla) detenerBucle();
      else redibujar();
    });
    observadorVista.observe(escenario);

    const reajustar = () => {
      silueta.redimensionar();
      flujo.redimensionar();
      const c = centroLienzo();
      if (temaActivo) {
        cam.cxObj = centroObjetivo().x;
        cam.cyObj = c.y;
        cam.sObj = zoomObjetivo();
        // Si el espacio cambió de forma, se vuelve a armar el universo para la nueva disposición
        const tema = temas.find((t) => t.id === temaActivo);
        const eraOrbita = Boolean(capaSatelites && capaSatelites.children.length);
        if (tema && eraOrbita !== pantallaAncha.matches) {
          const guardada = seccionActiva;
          crearUniverso(tema);
          if (guardada) abrirSeccion(guardada);
        }
      } else {
        cam.cx = cam.cxObj = c.x;
        cam.cy = cam.cyObj = c.y;
        cam.fx = c.x;
        cam.fy = c.y;
      }
      redibujar();
    };

    const observadorTamano = new ResizeObserver(reajustar);
    observadorTamano.observe(escenario);

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) detenerBucle();
      else redibujar();
    });

    mediaReducido.addEventListener('change', () => redibujar());

    actualizarNodos();
    actualizarLeyenda();
    actualizarEstadoPlataforma();
    renderizarLista();
    silueta.redimensionar();
    flujo.redimensionar();
    {
      const c = centroLienzo();
      cam.cx = cam.cxObj = cam.fx = c.x;
      cam.cy = cam.cyObj = cam.fy = c.y;
    }
    redibujar();
  });
})();
