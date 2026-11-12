(function () {
  'use strict';

  function formatearValor(valor, unidad) {
    const numero = Number(valor);
    const seguro = Number.isFinite(numero) ? numero : 0;
    if (unidad === '%') {
      return seguro.toFixed(1).replace('.', ',') + ' %';
    }
    if (unidad === 'media') {
      return seguro.toFixed(2).replace('.', ',');
    }
    return String(Math.round(seguro));
  }

  function calcularAncho(valor, maximo) {
    const numValor = Number(valor);
    const numMaximo = Number(maximo);
    if (!Number.isFinite(numValor) || !Number.isFinite(numMaximo) || numMaximo <= 0) {
      return 0;
    }
    return Math.max(0, Math.min(100, (numValor / numMaximo) * 100));
  }

  // «1 video» en singular, «N videos» en plural.
  function textoVideos(cantidad) {
    const n = Number(cantidad) || 0;
    return n === 1 ? '1 video' : n + ' videos';
  }

  // Las preguntas de selección múltiple traen conteos ('menciones') y la base de personas:
  // se muestran como porcentaje de esa base, igual que el resto de los gráficos, con el conteo al lado.
  function normalizarGrafico(grafico) {
    const base = Number(grafico && grafico.base);
    if (!grafico || grafico.unidad !== 'menciones' || !(base > 0)) {
      return grafico;
    }
    const filas = (Array.isArray(grafico.filas) ? grafico.filas : []).map(function (fila) {
      const conteo = Number(fila && fila.valor) || 0;
      return Object.assign({}, fila, {
        valor: (conteo / base) * 100,
        detalle: fila && fila.detalle ? fila.detalle : (conteo === 1 ? '1 persona' : conteo + ' personas')
      });
    });
    return Object.assign({}, grafico, { unidad: '%', maximo: 100, filas: filas });
  }

  function crearFilaBarra(fila, unidad, maximo) {
    const item = document.createElement('li');
    item.className = 'barra';

    const etiqueta = document.createElement('span');
    etiqueta.className = 'barra__etiqueta';
    etiqueta.textContent = fila && fila.etiqueta != null ? String(fila.etiqueta) : '';

    if (fila && fila.detalle != null && fila.detalle !== '') {
      etiqueta.appendChild(document.createTextNode(' '));
      const detalle = document.createElement('span');
      detalle.className = 'barra__detalle';
      detalle.textContent = String(fila.detalle);
      etiqueta.appendChild(detalle);
    }

    const pista = document.createElement('span');
    pista.className = 'barra__pista';
    const relleno = document.createElement('span');
    relleno.className = 'barra__relleno';
    relleno.style.width = calcularAncho(fila ? fila.valor : 0, maximo) + '%';
    pista.appendChild(relleno);

    const valor = document.createElement('span');
    valor.className = 'barra__valor';
    valor.textContent = formatearValor(fila ? fila.valor : 0, unidad);

    item.appendChild(etiqueta);
    item.appendChild(pista);
    item.appendChild(valor);
    return item;
  }

  function dibujarBarras(contenedor, graficoOriginal, opciones) {
    if (!contenedor || !graficoOriginal) {
      return;
    }
    const grafico = normalizarGrafico(graficoOriginal);
    const opts = opciones || {};
    while (contenedor.firstChild) {
      contenedor.removeChild(contenedor.firstChild);
    }

    const figura = document.createElement('figure');
    figura.className = 'grafico';
    if (opts.titulo !== false && grafico.titulo) {
      const titulo = document.createElement('figcaption');
      titulo.className = 'grafico__titulo';
      titulo.textContent = String(grafico.titulo);
      figura.appendChild(titulo);
    }

    const lista = document.createElement('ul');
    lista.className = 'barras';
    if (opts.clase === 'instagram' || opts.clase === 'tiktok') {
      lista.classList.add('barras--' + opts.clase);
    }

    const filas = Array.isArray(grafico.filas) ? grafico.filas : [];
    for (let i = 0; i < filas.length; i++) {
      lista.appendChild(crearFilaBarra(filas[i], grafico.unidad, grafico.maximo));
    }
    figura.appendChild(lista);

    if (grafico.nota) {
      const nota = document.createElement('p');
      nota.className = 'grafico__nota';
      nota.textContent = String(grafico.nota);
      figura.appendChild(nota);
    }

    contenedor.appendChild(figura);
  }

  window.formatearValor = formatearValor;
  window.textoVideos = textoVideos;
  window.dibujarBarras = dibujarBarras;
})();
