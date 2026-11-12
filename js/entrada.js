(function () {
  function iniciarEntrada() {
    const datos = window.CONCLUSIONES && window.CONCLUSIONES.entrada;
    if (!datos) return;

    const nodoLead = document.querySelector('[data-entrada-lead], .portada-cuerpo__lead');
    if (nodoLead && typeof datos.lead === 'string') {
      nodoLead.textContent = datos.lead;
    }

    const listaEsencial = document.querySelector('[data-entrada-esencial], ol.esencial');
    if (listaEsencial && Array.isArray(datos.esencial)) {
      listaEsencial.textContent = '';
      datos.esencial.forEach(function (frase) {
        const item = document.createElement('li');
        item.textContent = frase;
        listaEsencial.appendChild(item);
      });
    }

    const contenedorPuertas = document.querySelector('[data-entrada-puertas], .puertas');
    if (contenedorPuertas && Array.isArray(datos.puertas)) {
      contenedorPuertas.textContent = '';
      datos.puertas.forEach(function (puerta) {
        const enlace = document.createElement('a');
        enlace.className = 'puerta caja';
        enlace.href = puerta.href || '#';
        if (puerta.id) enlace.dataset.puerta = puerta.id;

        const titulo = document.createElement('h3');
        titulo.textContent = puerta.titulo || '';

        const texto = document.createElement('p');
        texto.textContent = puerta.texto || '';

        enlace.appendChild(titulo);
        enlace.appendChild(texto);
        contenedorPuertas.appendChild(enlace);
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciarEntrada);
  } else {
    iniciarEntrada();
  }
})();
