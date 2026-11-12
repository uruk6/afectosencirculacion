// Rellena las secciones de conclusiones.html a partir de window.CONCLUSIONES.

(function () {
  'use strict';

  function crear(etiqueta, clase, texto) {
    const elemento = document.createElement(etiqueta);
    if (clase) {
      elemento.className = clase;
    }
    if (typeof texto === 'string') {
      elemento.textContent = texto;
    }
    return elemento;
  }

  function obtenerContenedor(clave) {
    return document.querySelector('[data-conclusiones="' + clave + '"]');
  }

  function pintarEsencial(entrada) {
    const contenedor = obtenerContenedor('esencial');
    if (!contenedor || !entrada || !Array.isArray(entrada.esencial)) {
      return;
    }
    contenedor.replaceChildren();
    const lista = crear('ol', 'esencial');
    for (const idea of entrada.esencial) {
      lista.appendChild(crear('li', '', idea));
    }
    contenedor.appendChild(lista);
  }

  function pintarObjetivos(objetivos) {
    const contenedor = obtenerContenedor('objetivos');
    if (!contenedor || !Array.isArray(objetivos)) {
      return;
    }
    contenedor.replaceChildren();
    for (const objetivo of objetivos) {
      const caja = crear('article', 'caja');
      if (objetivo.id) {
        caja.id = objetivo.id;
      }
      caja.appendChild(crear('h3', '', objetivo.titulo));
      caja.appendChild(crear('p', '', objetivo.texto));
      contenedor.appendChild(caja);
    }
  }

  function pintarSubgrupoIntegracion(clave, listaElementos) {
    const contenedor = obtenerContenedor(clave);
    if (!contenedor || !Array.isArray(listaElementos)) {
      return;
    }
    contenedor.replaceChildren();
    const grupo = crear('div', 'grupo-integracion');
    for (const item of listaElementos) {
      const caja = crear('article', 'caja');
      caja.appendChild(crear('h4', '', item.titulo));
      caja.appendChild(crear('p', '', item.texto));
      grupo.appendChild(caja);
    }
    contenedor.appendChild(grupo);
  }

  function pintarIntegracion(integracion) {
    if (!integracion) {
      return;
    }
    const contenedorNota = obtenerContenedor('integracion-nota');
    if (contenedorNota && typeof integracion.nota === 'string') {
      contenedorNota.replaceChildren();
      contenedorNota.appendChild(crear('p', '', integracion.nota));
    }
    pintarSubgrupoIntegracion('coinciden', integracion.coinciden);
    pintarSubgrupoIntegracion('tensiones', integracion.tensiones);
    pintarSubgrupoIntegracion('abierto', integracion.abierto);
  }

  function crearCajaPlataforma(textoMarca, modificadorMarca, contenido) {
    const caja = crear('div', 'caja');
    const marca = crear('span', 'marca ' + modificadorMarca, textoMarca);
    const parrafo = crear('p', '', contenido);
    caja.appendChild(marca);
    caja.appendChild(parrafo);
    return caja;
  }

  function pintarPlataformas(plataformas) {
    const contenedor = obtenerContenedor('plataformas');
    if (!contenedor || !plataformas) {
      return;
    }
    contenedor.replaceChildren();
    contenedor.appendChild(crear('h3', '', plataformas.titulo));
    contenedor.appendChild(crear('p', '', plataformas.texto));

    const columnas = crear('div', 'columnas-dos');
    columnas.appendChild(
      crearCajaPlataforma('Lo que perciben', 'marca--encuesta', plataformas.percibido)
    );
    columnas.appendChild(
      crearCajaPlataforma('Lo que muestran los videos', 'marca--cuenta', plataformas.mostrado)
    );
    contenedor.appendChild(columnas);
  }

  function pintarLimites(limites) {
    const contenedor = obtenerContenedor('limites');
    if (!contenedor || !Array.isArray(limites)) {
      return;
    }
    contenedor.replaceChildren();
    const lista = crear('ul');
    for (const limite of limites) {
      lista.appendChild(crear('li', '', limite));
    }
    contenedor.appendChild(lista);
  }

  function pintarFase2(fase2) {
    const contenedor = obtenerContenedor('fase2');
    if (!contenedor || !fase2) {
      return;
    }
    contenedor.replaceChildren();
    contenedor.appendChild(crear('h3', '', fase2.titulo));
    contenedor.appendChild(crear('p', '', fase2.texto));
  }

  function pintarParaTuFeed(paraTuFeed) {
    const contenedor = obtenerContenedor('para-tu-feed');
    if (!contenedor || !paraTuFeed) {
      return;
    }
    contenedor.replaceChildren();
    contenedor.appendChild(crear('h3', '', paraTuFeed.titulo));

    if (Array.isArray(paraTuFeed.preguntas)) {
      const lista = crear('ol');
      for (const pregunta of paraTuFeed.preguntas) {
        lista.appendChild(crear('li', '', pregunta));
      }
      contenedor.appendChild(lista);
    }

    if (typeof paraTuFeed.bienestar === 'string') {
      contenedor.appendChild(crear('p', 'aviso', paraTuFeed.bienestar));
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    const datos = window.CONCLUSIONES;
    if (!datos) {
      return;
    }
    pintarEsencial(datos.entrada);
    pintarObjetivos(datos.objetivos);
    pintarIntegracion(datos.integracion);
    pintarPlataformas(datos.plataformas);
    pintarLimites(datos.limites);
    pintarFase2(datos.fase2);
    pintarParaTuFeed(datos.paraTuFeed);
  });
})();
