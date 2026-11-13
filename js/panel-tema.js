// Contenido de cada tema para la cartografía. Cada tema se reparte en «secciones»: cada una es un punto
// que rodea al tema cuando se abre, y su texto aparece en una ficha al elegirlo.
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

  function textoVideos(n) {
    return typeof window.textoVideos === 'function' ? window.textoVideos(n) : `${n} videos`;
  }

  function crear(etiqueta, clase, texto) {
    const nodo = document.createElement(etiqueta);
    if (clase) nodo.className = clase;
    if (texto !== undefined && texto !== null) nodo.textContent = texto;
    return nodo;
  }

  // Etiqueta y texto en dos nodos: el texto largo no se enrolla por debajo de la etiqueta (ver .con-marca en cuerpo.css).
  function filaConMarca(claseParrafo, marca, contenido) {
    const p = crear('p', `${claseParrafo} con-marca`);
    const texto = crear('span', 'con-marca__texto', contenido);
    p.append(marca, texto);
    return { p, texto };
  }

  function marca(modificador, texto) {
    return crear('span', `marca marca--${modificador}`, texto);
  }

  // Las secciones disponibles de un tema, en el orden en que se leen
  function seccionesTema(tema) {
    if (!tema) return [];
    const lista = [];
    if (tema.queEs) lista.push({ clave: 'quees', etiqueta: 'De qué trata' });
    lista.push({ clave: 'encontramos', etiqueta: 'Qué encontramos' });
    if (Array.isArray(tema.formas) && tema.formas.length) lista.push({ clave: 'formas', etiqueta: 'Cómo aparece' });
    if (tema.diferencia) lista.push({ clave: 'diferencia', etiqueta: 'Instagram y TikTok' });
    if (tema.encuesta) lista.push({ clave: 'encuesta', etiqueta: 'Y en la encuesta' });
    lista.push({ clave: 'significa', etiqueta: 'Cómo lo leemos' });
    if (tema.hipotesis) lista.push({ clave: 'hipotesis', etiqueta: 'Una idea por probar' });
    if (tema.extra) lista.push({ clave: 'extra', etiqueta: tema.extra.etiqueta || 'Un hallazgo extra' });
    lista.push({ clave: 'limites', etiqueta: 'Qué no podemos decir' });
    return lista;
  }

  function renderizarSeccionTema(raiz, tema, clave, plataforma = 'ambas') {
    if (!raiz) return;
    raiz.replaceChildren();
    if (!tema) return;

    const modo = plataforma === 'tiktok' || plataforma === 'instagram' ? plataforma : 'ambas';
    const base = obtenerBaseVideos(modo);
    const videosTema = obtenerConteo(tema.total, modo);
    const porcentajeTema = calcularPorcentaje(videosTema, base);
    const secciones = seccionesTema(tema);
    const indice = secciones.findIndex((s) => s.clave === clave);
    const seccion = secciones[indice];
    if (!seccion) return;

    const kicker = crear('p', 'panel__nombre', `${tema.region} · ${tema.nombre}`);
    const titulo = crear('h3', 'panel__titulo', seccion.etiqueta);
    raiz.append(kicker, titulo);

    switch (clave) {
      case 'quees': {
        raiz.appendChild(crear('p', 'panel__encontramos', tema.queEs));
        if (Array.isArray(tema.terminos) && tema.terminos.length) {
          const lista = crear('dl', 'panel__terminos');
          tema.terminos.forEach((t) => {
            lista.appendChild(crear('dt', '', t.termino));
            lista.appendChild(crear('dd', '', t.definicion));
          });
          raiz.appendChild(lista);
        }
        break;
      }
      case 'encontramos': {
        raiz.appendChild(crear('p', 'panel__cifra', `${textoVideos(videosTema)} de ${base} (${formatearPorcentaje(porcentajeTema)})`));
        const { p } = filaConMarca('panel__encontramos', marca('cuenta', 'Lo contamos'), tema.encontramos || '');
        raiz.appendChild(p);
        break;
      }
      case 'formas': {
        const contenedor = crear('div', 'panel__grafico');
        const filas = tema.formas.map((forma) => {
          const n = obtenerConteo(forma, modo);
          return { etiqueta: forma.etiqueta || '', valor: calcularPorcentaje(n, base), detalle: textoVideos(n) };
        });
        const nota = modo === 'ambas'
          ? `Porcentajes sobre los ${base} videos analizados.`
          : `Son porcentajes de los ${base} videos de ${NOMBRES_PLATAFORMA[modo]}.`;
        if (typeof window.dibujarBarras === 'function') {
          window.dibujarBarras(contenedor, {
            id: `panel-formas-${tema.id}`,
            titulo: 'Formas en que aparece el tema',
            unidad: '%',
            maximo: 100,
            nota,
            filas
          }, modo === 'ambas' ? {} : { clase: modo });
        }
        raiz.appendChild(contenedor);
        break;
      }
      case 'diferencia': {
        const tipo = TEXTOS_DIFERENCIA[tema.diferencia.tipo] ? tema.diferencia.tipo : 'ninguna';
        const insignia = crear('span', `insignia insignia--${tipo}`, TEXTOS_DIFERENCIA[tipo]);
        raiz.appendChild(filaConMarca('panel__diferencia', insignia, tema.diferencia.texto || '').p);
        break;
      }
      case 'encuesta': {
        const { p, texto } = filaConMarca('panel__encuesta', marca('encuesta', 'En la encuesta'), tema.encuesta.texto || '');
        if (tema.encuesta.enlace) {
          const enlace = crear('a', '', tema.encuesta.enlaceTexto || 'Ver en la encuesta');
          enlace.href = tema.encuesta.enlace;
          texto.append(' ', enlace);
        }
        raiz.appendChild(p);
        break;
      }
      case 'significa':
        raiz.appendChild(filaConMarca('panel__significa', marca('lectura', 'Lo leemos así'), tema.significa || '').p);
        break;
      case 'hipotesis':
        raiz.appendChild(filaConMarca('panel__hipotesis', marca('hipotesis', 'Hipótesis'), tema.hipotesis || '').p);
        break;
      case 'extra': {
        raiz.appendChild(crear('h4', 'panel__subtitulo', tema.extra.titulo));
        raiz.appendChild(filaConMarca('panel__encontramos', marca('cuenta', 'Lo contamos'), tema.extra.texto || '').p);
        raiz.appendChild(filaConMarca('panel__limites', marca('limite', 'Límites'), tema.extra.limites || '').p);
        break;
      }
      case 'limites':
        raiz.appendChild(filaConMarca('panel__limites', marca('limite', 'Límites'), tema.limites || '').p);
        break;
      default:
        break;
    }

    const enlaceFicha = crear('a', 'boton boton--secundario boton--chico panel__ficha', 'Ver el tema completo');
    enlaceFicha.href = `tema.html?tema=${encodeURIComponent(tema.id || '')}`;
    raiz.appendChild(enlaceFicha);
  }

  window.seccionesTema = seccionesTema;
  window.renderizarSeccionTema = renderizarSeccionTema;
})();
