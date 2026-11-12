(() => {
  'use strict';

  const TEXTOS_DIFERENCIA = {
    real: 'Diferencia real',
    mezclada: 'Diferencia en parte real',
    artefacto: 'Diferencia por la medición',
    ninguna: 'Sin diferencia'
  };

  const NOMBRES_PLATAFORMA = {
    tiktok: 'TikTok',
    instagram: 'Instagram'
  };

  function formatearPorcentaje(valor) {
    const numero = Number(valor) || 0;
    if (typeof window.formatearValor === 'function') {
      const texto = String(window.formatearValor(numero, '%'));
      return texto.includes('%') ? texto : `${texto} %`;
    }
    return `${numero.toFixed(1).replace('.', ',')} %`;
  }

  function calcularPorcentaje(parte, base) {
    if (!base || base <= 0) return 0;
    return Math.round((parte / base) * 1000) / 10;
  }

  function obtenerBaseVideos(plataforma) {
    const bases = window.BASE_VIDEOS || { total: 100, tiktok: 50, instagram: 50 };
    if (plataforma === 'tiktok') return Number(bases.tiktok) || 0;
    if (plataforma === 'instagram') return Number(bases.instagram) || 0;
    return Number(bases.total) || 0;
  }

  function obtenerConteo(objeto, plataforma) {
    if (!objeto) return 0;
    if (plataforma === 'tiktok') return Number(objeto.tiktok) || 0;
    if (plataforma === 'instagram') return Number(objeto.instagram) || 0;
    return Number(objeto.videos) || 0;
  }

  function crearMarca(modificador, texto) {
    const marca = document.createElement('span');
    marca.className = `marca marca--${modificador}`;
    marca.textContent = texto;
    return marca;
  }

  // Etiqueta y texto en dos nodos: el texto largo no se enrolla por debajo de la etiqueta (ver .con-marca en cuerpo.css).
  function crearFilaConMarca(claseParrafo, marca, contenido) {
    const p = document.createElement('p');
    p.className = `${claseParrafo} con-marca`;
    const texto = document.createElement('span');
    texto.className = 'con-marca__texto';
    texto.textContent = contenido;
    p.append(marca, texto);
    return p;
  }

  function crearParrafoConMarca(claseParrafo, modMarca, textoMarca, contenido) {
    return crearFilaConMarca(claseParrafo, crearMarca(modMarca, textoMarca), contenido);
  }

  function textoVideos(n) {
    return typeof window.textoVideos === 'function' ? window.textoVideos(n) : `${n} videos`;
  }

  function renderizarPanelTema(raiz, tema, plataforma = 'ambas') {
    if (!raiz) return;
    raiz.replaceChildren();
    if (!tema) return;

    const modo = plataforma === 'tiktok' || plataforma === 'instagram' ? plataforma : 'ambas';
    const base = obtenerBaseVideos(modo);
    const videosTema = obtenerConteo(tema.total, modo);
    const porcentajeTema = calcularPorcentaje(videosTema, base);

    const titulo = document.createElement('h3');
    titulo.className = 'panel__titulo';
    titulo.textContent = tema.pregunta || '';

    const nombre = document.createElement('p');
    nombre.className = 'panel__nombre';
    nombre.textContent = `${tema.nombre || ''} · ${videosTema} de ${base} videos (${formatearPorcentaje(porcentajeTema)})`;

    const encontramos = crearParrafoConMarca('panel__encontramos', 'cuenta', 'Lo contamos', tema.encontramos || '');

    const contenedorGrafico = document.createElement('div');
    contenedorGrafico.className = 'panel__grafico';
    const formas = Array.isArray(tema.formas) ? tema.formas : [];
    const filas = formas.map((forma) => {
      const n = obtenerConteo(forma, modo);
      return {
        etiqueta: forma.etiqueta || '',
        valor: calcularPorcentaje(n, base),
        detalle: textoVideos(n)
      };
    });

    const notaPlataforma = modo === 'ambas'
      ? `Porcentajes sobre los ${base} videos analizados.`
      : `Son porcentajes de los ${base} videos de ${NOMBRES_PLATAFORMA[modo]}.`;

    if (typeof window.dibujarBarras === 'function') {
      const opciones = modo === 'ambas' ? {} : { clase: modo };
      window.dibujarBarras(contenedorGrafico, {
        id: `panel-formas-${tema.id}`,
        titulo: 'Formas en que aparece el tema',
        unidad: '%',
        maximo: 100,
        nota: notaPlataforma,
        filas
      }, opciones);
    }

    raiz.append(titulo, nombre, encontramos, contenedorGrafico);

    if (tema.diferencia) {
      const tipo = TEXTOS_DIFERENCIA[tema.diferencia.tipo] ? tema.diferencia.tipo : 'ninguna';
      const insignia = document.createElement('span');
      insignia.className = `insignia insignia--${tipo}`;
      insignia.textContent = TEXTOS_DIFERENCIA[tipo];
      raiz.appendChild(crearFilaConMarca('panel__diferencia', insignia, tema.diferencia.texto || ''));
    }

    if (tema.encuesta) {
      const pEncuesta = crearParrafoConMarca('panel__encuesta', 'encuesta', 'En la encuesta', tema.encuesta.texto || '');
      if (tema.encuesta.enlace) {
        const enlaceEncuesta = document.createElement('a');
        enlaceEncuesta.href = tema.encuesta.enlace;
        enlaceEncuesta.textContent = tema.encuesta.enlaceTexto || 'Ver en la encuesta';
        pEncuesta.querySelector('.con-marca__texto').append(' ', enlaceEncuesta);
      }
      raiz.appendChild(pEncuesta);
    }

    raiz.appendChild(crearParrafoConMarca('panel__significa', 'lectura', 'Lo leemos así', tema.significa || ''));

    if (tema.hipotesis) {
      raiz.appendChild(crearParrafoConMarca('panel__hipotesis', 'hipotesis', 'Hipótesis', tema.hipotesis));
    }

    raiz.appendChild(crearParrafoConMarca('panel__limites', 'limite', 'Límites', tema.limites || ''));

    if (Array.isArray(tema.citas) && tema.citas.length > 0) {
      tema.citas.forEach((cita) => {
        const bloqueCita = document.createElement('blockquote');
        bloqueCita.className = 'panel__cita cita';
        const sufijo = cita.plataforma ? ` — Video en ${cita.plataforma}` : '';
        bloqueCita.textContent = `«${cita.texto || ''}»${sufijo}`;
        raiz.appendChild(bloqueCita);
      });
    }

    const enlaceFicha = document.createElement('a');
    enlaceFicha.className = 'boton boton--secundario boton--chico panel__ficha';
    enlaceFicha.href = `tema.html?tema=${encodeURIComponent(tema.id || '')}`;
    enlaceFicha.textContent = 'Ver la página del tema';
    raiz.appendChild(enlaceFicha);
  }

  window.renderizarPanelTema = renderizarPanelTema;
})();
