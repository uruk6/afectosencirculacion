(() => {
  'use strict';

  const TEXTOS_DIFERENCIA = {
    real: 'Diferencia real',
    mezclada: 'Diferencia en parte real',
    artefacto: 'Diferencia por la medición',
    ninguna: 'Sin diferencia'
  };

  function el(etiqueta, clase, texto) {
    const nodo = document.createElement(etiqueta);
    if (clase) nodo.className = clase;
    if (texto !== undefined && texto !== null) nodo.textContent = texto;
    return nodo;
  }

  function crearMarca(modificador, texto) {
    return el('span', `marca marca--${modificador}`, texto);
  }

  function porcentajeNumero(parte, total) {
    return total > 0 ? (parte / total) * 100 : 0;
  }

  function formatearPorcentaje(parte, total) {
    return `${porcentajeNumero(parte, total).toFixed(1).replace('.', ',')} %`;
  }

  function crearPuertas(listaTemas) {
    const puertas = el('div', 'puertas');
    listaTemas.forEach((item) => {
      const enlace = el('a', 'puerta caja');
      enlace.href = `tema.html?tema=${encodeURIComponent(item.id)}`;
      enlace.appendChild(el('h3', '', item.pregunta));
      enlace.appendChild(el('p', '', item.nombre));
      puertas.appendChild(enlace);
    });
    return puertas;
  }

  function crearMigas(nombreTema) {
    const nav = el('nav', 'migas');
    nav.setAttribute('aria-label', 'Dónde estás');
    const lista = el('ol');

    const itemResultados = el('li');
    const enlaceResultados = el('a', '', 'Resultados');
    enlaceResultados.href = 'resultados.html';
    itemResultados.appendChild(enlaceResultados);

    const itemCualitativos = el('li');
    const enlaceCualitativos = el('a', '', 'Lo que circula en los videos');
    enlaceCualitativos.href = 'cualitativos.html';
    itemCualitativos.appendChild(enlaceCualitativos);

    const itemActual = el('li', '', nombreTema);
    itemActual.setAttribute('aria-current', 'page');

    lista.append(itemResultados, itemCualitativos, itemActual);
    nav.appendChild(lista);
    return nav;
  }

  function crearTablaPlataformas(formas, base) {
    const tabla = el('table', 'tabla-plataformas');
    tabla.appendChild(el('caption', '', 'Videos con cada forma, por plataforma'));

    const thead = el('thead');
    const filaCabecera = el('tr');
    ['Forma', 'TikTok', 'Instagram'].forEach((titulo) => {
      const th = el('th', '', titulo);
      th.scope = 'col';
      filaCabecera.appendChild(th);
    });
    thead.appendChild(filaCabecera);
    tabla.appendChild(thead);

    const tbody = el('tbody');
    formas.forEach((forma) => {
      const fila = el('tr');
      const thForma = el('th', '', forma.etiqueta);
      thForma.scope = 'row';
      const tdTiktok = el(
        'td',
        '',
        `${forma.tiktok} de ${base.tiktok} (${formatearPorcentaje(forma.tiktok, base.tiktok)})`
      );
      const tdInstagram = el(
        'td',
        '',
        `${forma.instagram} de ${base.instagram} (${formatearPorcentaje(forma.instagram, base.instagram)})`
      );
      fila.append(thForma, tdTiktok, tdInstagram);
      tbody.appendChild(fila);
    });
    tabla.appendChild(tbody);
    return tabla;
  }

  function renderizarSinTema(contenedorPortada, contenedor, temas) {
    contenedorPortada.textContent = '';
    contenedorPortada.appendChild(el('h1', '', 'Tema'));

    const pila = el('div', 'pila');
    const caja = el('section', 'caja');
    caja.appendChild(el('h2', '', 'Elige un tema'));
    pila.appendChild(caja);
    pila.appendChild(crearPuertas(temas));
    contenedor.appendChild(pila);
  }

  function renderizarTema(contenedorPortada, contenedor, tema, temas, base) {
    document.title = `${tema.pregunta} · Afectos en circulación`;

    // Metadatos propios de cada tema (para buscadores y para compartir)
    const direccion = `https://afectosencirculacion.org/tema.html?tema=${encodeURIComponent(tema.id)}`;
    const resumen = tema.queEs || tema.encontramos || '';
    const poner = (selector, atributo, valor) => {
      const nodo = document.querySelector(selector);
      if (nodo) nodo.setAttribute(atributo, valor);
    };
    poner('link[rel="canonical"]', 'href', direccion);
    poner('meta[name="description"]', 'content', resumen);
    poner('meta[property="og:title"]', 'content', `${tema.pregunta} · Afectos en circulación`);
    poner('meta[property="og:description"]', 'content', resumen);
    poner('meta[property="og:url"]', 'content', direccion);

    contenedorPortada.textContent = '';
    contenedorPortada.appendChild(crearMigas(tema.nombre));
    contenedorPortada.appendChild(el('h1', '', tema.pregunta));
    contenedorPortada.appendChild(
      el(
        'p',
        'portada-cuerpo__lead',
        `${tema.nombre} · ${tema.total.videos} de ${base.total} videos (${formatearPorcentaje(tema.total.videos, base.total)})`
      )
    );

    const pila = el('div', 'pila');

    // Qué es este tema, en palabras sencillas
    if (tema.queEs) {
      const cajaQue = el('section', 'caja');
      cajaQue.appendChild(el('h2', '', '¿De qué trata?'));
      cajaQue.appendChild(el('p', '', tema.queEs));
      if (Array.isArray(tema.terminos) && tema.terminos.length) {
        const lista = el('dl', 'panel__terminos');
        tema.terminos.forEach((x) => {
          lista.appendChild(el('dt', '', x.termino));
          lista.appendChild(el('dd', '', x.definicion));
        });
        cajaQue.appendChild(lista);
      }
      pila.appendChild(cajaQue);
    }

    // Lo que encontramos, gráfico de formas, tabla por plataforma y diferencia
    const cajaHallazgos = el('section', 'caja');
    cajaHallazgos.appendChild(crearMarca('cuenta', 'Lo contamos'));
    cajaHallazgos.appendChild(el('h2', '', 'Lo que encontramos'));
    cajaHallazgos.appendChild(el('p', '', tema.encontramos));

    const contenedorGrafico = el('div');
    cajaHallazgos.appendChild(contenedorGrafico);
    if (typeof window.dibujarBarras === 'function') {
      window.dibujarBarras(contenedorGrafico, {
        id: `formas-${tema.id}`,
        titulo: 'Formas registradas en los videos',
        unidad: '%',
        maximo: 100,
        filas: tema.formas.map((f) => ({
          etiqueta: f.etiqueta,
          valor: porcentajeNumero(f.videos, base.total),
          detalle: f.videos === 1 ? '1 video' : `${f.videos} videos`
        }))
      });
    }

    cajaHallazgos.appendChild(crearTablaPlataformas(tema.formas, base));
    cajaHallazgos.appendChild(
      el('p', 'grafico__nota', 'Los porcentajes de la tabla se calculan sobre el total de videos de cada plataforma.')
    );

    if (tema.diferencia) {
      const tipo = TEXTOS_DIFERENCIA[tema.diferencia.tipo] ? tema.diferencia.tipo : 'ninguna';
      const filaDiferencia = el('p', 'con-marca');
      filaDiferencia.appendChild(el('span', `insignia insignia--${tipo}`, TEXTOS_DIFERENCIA[tipo]));
      filaDiferencia.appendChild(el('span', 'con-marca__texto', tema.diferencia.texto));
      cajaHallazgos.appendChild(filaDiferencia);
    }
    pila.appendChild(cajaHallazgos);

    // En la encuesta
    if (tema.encuesta) {
      const cajaEncuesta = el('section', 'caja');
      cajaEncuesta.appendChild(el('h2', '', 'En la encuesta'));
      cajaEncuesta.appendChild(el('p', '', tema.encuesta.texto));
      const parrafoEnlace = el('p', 'relacion');
      const enlace = el('a', '', tema.encuesta.enlaceTexto);
      enlace.href = tema.encuesta.enlace;
      parrafoEnlace.appendChild(enlace);
      cajaEncuesta.appendChild(parrafoEnlace);
      pila.appendChild(cajaEncuesta);
    }

    // Lo leemos así
    const cajaSignifica = el('section', 'caja');
    cajaSignifica.appendChild(el('h2', '', 'Lo leemos así'));
    cajaSignifica.appendChild(el('p', '', tema.significa));
    pila.appendChild(cajaSignifica);

    // Hipótesis (solo si no es null)
    if (tema.hipotesis !== null && tema.hipotesis !== undefined) {
      const cajaHipotesis = el('section', 'caja');
      cajaHipotesis.appendChild(el('h2', '', 'Hipótesis'));
      cajaHipotesis.appendChild(el('p', '', tema.hipotesis));
      pila.appendChild(cajaHipotesis);
    }

    // Límites
    const cajaLimites = el('section', 'caja');
    cajaLimites.appendChild(el('h2', '', 'Límites'));
    cajaLimites.appendChild(el('p', '', tema.limites));
    pila.appendChild(cajaLimites);

    // Extra (solo si no es null)
    if (tema.extra !== null && tema.extra !== undefined) {
      const cajaExtra = el('section', 'caja');
      cajaExtra.appendChild(crearMarca('cuenta', 'Lo contamos'));
      cajaExtra.appendChild(el('h2', '', tema.extra.titulo));
      cajaExtra.appendChild(el('p', '', tema.extra.texto));
      cajaExtra.appendChild(crearMarca('limite', 'Límites'));
      cajaExtra.appendChild(el('p', '', tema.extra.limites));
      pila.appendChild(cajaExtra);
    }

    // Citas (solo si hay citas)
    if (Array.isArray(tema.citas) && tema.citas.length > 0) {
      const cajaCitas = el('section', 'caja');
      cajaCitas.appendChild(el('h2', '', 'Citas'));
      tema.citas.forEach((cita) => {
        const bloque = el('blockquote', 'cita');
        bloque.appendChild(el('p', '', cita.texto));
        bloque.appendChild(el('footer', '', cita.plataforma || 'Fragmento de la transcripción de un video'));
        cajaCitas.appendChild(bloque);
      });
      pila.appendChild(cajaCitas);
    }

    // Otros temas
    const seccionOtros = el('section', 'grupo-integracion');
    seccionOtros.appendChild(el('h2', '', 'Otros temas'));
    seccionOtros.appendChild(crearPuertas(temas.filter((t) => t.id !== tema.id)));
    pila.appendChild(seccionOtros);

    contenedor.appendChild(pila);
  }

  function iniciar() {
    const contenedor = document.querySelector('[data-tema-contenido]');
    const contenedorPortada =
      document.querySelector('.portada-cuerpo .contenedor') || document.querySelector('.portada-cuerpo');
    if (!contenedor || !contenedorPortada) return;

    const temas = Array.isArray(window.TEMAS) ? window.TEMAS : [];
    const base = window.BASE_VIDEOS || { total: 100, tiktok: 50, instagram: 50 };
    const idTema = new URLSearchParams(window.location.search).get('tema');
    const tema = temas.find((t) => t.id === idTema);

    contenedor.textContent = '';
    if (!tema) {
      renderizarSinTema(contenedorPortada, contenedor, temas);
      return;
    }
    renderizarTema(contenedorPortada, contenedor, tema, temas, base);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }
})();
