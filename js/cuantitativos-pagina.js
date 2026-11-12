// Pinta la página de resultados cuantitativos (muestra y secciones) desde window.ENCUESTA.

(function () {
  'use strict';

  function crearParrafoConMarca(modificador, textoMarca, contenido) {
    // La etiqueta y el texto van en columnas separadas (ver .con-marca en cuerpo.css).
    const parrafo = document.createElement('p');
    parrafo.className = 'con-marca';
    const marca = document.createElement('span');
    marca.className = 'marca marca--' + modificador;
    marca.textContent = textoMarca;
    const texto = document.createElement('span');
    texto.className = 'con-marca__texto';
    texto.textContent = contenido;
    parrafo.appendChild(marca);
    parrafo.appendChild(texto);
    return parrafo;
  }

  function crearBloqueDestacados(listaDestacados) {
    if (!Array.isArray(listaDestacados) || listaDestacados.length === 0) {
      return null;
    }

    const contenedor = document.createElement('div');
    contenedor.className = 'destacados';

    listaDestacados.forEach(function (item) {
      const destacado = document.createElement('div');
      destacado.className = 'destacado';

      const valor = document.createElement('strong');
      valor.className = 'destacado__valor';
      valor.textContent = item.valor;

      const rotulo = document.createElement('span');
      rotulo.className = 'destacado__rotulo';
      rotulo.textContent = item.rotulo;

      destacado.appendChild(valor);
      destacado.appendChild(document.createTextNode(' '));
      destacado.appendChild(rotulo);
      contenedor.appendChild(destacado);
    });

    return contenedor;
  }

  function pintarMuestra(contenedorMuestra, muestra) {
    if (!contenedorMuestra || !muestra) {
      return;
    }

    contenedorMuestra.textContent = '';

    const caja = document.createElement('section');
    caja.className = 'caja seccion-datos';
    caja.id = 'muestra';
    caja.setAttribute('aria-labelledby', 'titulo-muestra');

    const titulo = document.createElement('h2');
    titulo.id = 'titulo-muestra';
    titulo.textContent = 'Quiénes respondieron';
    caja.appendChild(titulo);

    if (muestra.texto) {
      const parrafoTexto = document.createElement('p');
      parrafoTexto.textContent = muestra.texto;
      caja.appendChild(parrafoTexto);
    }

    const destacados = crearBloqueDestacados(muestra.destacados);
    if (destacados) {
      caja.appendChild(destacados);
    }

    if (muestra.grafico && typeof window.dibujarBarras === 'function') {
      const huecoGrafico = document.createElement('div');
      caja.appendChild(huecoGrafico);
      window.dibujarBarras(huecoGrafico, muestra.grafico);
    }

    const aviso = document.createElement('p');
    aviso.className = 'aviso';
    aviso.textContent = 'Es una muestra voluntaria (por autoselección) y de un solo programa: no es representativa del conjunto de estudiantes.';
    caja.appendChild(aviso);

    contenedorMuestra.appendChild(caja);
  }

  function crearSeccionDatos(seccion) {
    const bloque = document.createElement('section');
    bloque.className = 'caja seccion-datos';
    bloque.id = seccion.id;

    const idTitulo = 'titulo-' + seccion.id;
    bloque.setAttribute('aria-labelledby', idTitulo);

    const titulo = document.createElement('h2');
    titulo.id = idTitulo;
    titulo.textContent = seccion.pregunta;
    bloque.appendChild(titulo);

    if (seccion.objetivo) {
      const objetivo = document.createElement('p');
      objetivo.className = 'seccion-datos__objetivo';
      objetivo.textContent = seccion.objetivo;
      bloque.appendChild(objetivo);
    }

    if (seccion.texto) {
      bloque.appendChild(crearParrafoConMarca('cuenta', 'Lo contamos', seccion.texto));
    }

    const destacados = crearBloqueDestacados(seccion.destacados);
    if (destacados) {
      bloque.appendChild(destacados);
    }

    if (Array.isArray(seccion.graficos) && typeof window.dibujarBarras === 'function') {
      seccion.graficos.forEach(function (grafico) {
        const huecoGrafico = document.createElement('div');
        bloque.appendChild(huecoGrafico);
        window.dibujarBarras(huecoGrafico, grafico);
      });
    }

    if (seccion.significa) {
      bloque.appendChild(crearParrafoConMarca('lectura', 'Lo leemos así', seccion.significa));
    }

    if (seccion.limite) {
      bloque.appendChild(crearParrafoConMarca('limite', 'Límites', seccion.limite));
    }

    if (seccion.relacion && seccion.relacion.texto) {
      const relacion = document.createElement('p');
      relacion.className = 'relacion';
      relacion.appendChild(document.createTextNode(seccion.relacion.texto));

      const destino = seccion.relacion.enlace || seccion.relacion.href;
      if (destino && seccion.relacion.enlaceTexto) {
        relacion.appendChild(document.createTextNode(' '));
        const enlace = document.createElement('a');
        enlace.href = destino;
        enlace.textContent = seccion.relacion.enlaceTexto;
        relacion.appendChild(enlace);
      }

      bloque.appendChild(relacion);
    }

    return bloque;
  }

  function iniciarCuantitativos() {
    const datos = window.ENCUESTA;
    if (!datos) {
      return;
    }

    const contenedorMuestra = document.querySelector('[data-muestra]');
    pintarMuestra(contenedorMuestra, datos.muestra);

    const contenedorSecciones = document.querySelector('[data-secciones]');
    if (contenedorSecciones && Array.isArray(datos.secciones)) {
      contenedorSecciones.textContent = '';
      datos.secciones.forEach(function (seccion) {
        contenedorSecciones.appendChild(crearSeccionDatos(seccion));
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciarCuantitativos);
  } else {
    iniciarCuantitativos();
  }
})();
