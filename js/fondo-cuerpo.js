(function () {
  'use strict';

  const ESPERA_REDIMENSION_MS = 150;
  const CUADRO_ESTATICO = {
    foco: null,
    fuerza: 0,
    tiempo: 0
  };

  function dibujarEstable(silueta) {
    silueta.dibujar(CUADRO_ESTATICO);
  }

  function iniciarFondosCuerpo() {
    if (typeof window.Silueta !== 'function') {
      return;
    }

    const lienzos = document.querySelectorAll('canvas[data-fondo-cuerpo]');
    if (!lienzos.length) {
      return;
    }

    const instancias = [];
    for (let i = 0; i < lienzos.length; i++) {
      const silueta = new window.Silueta(lienzos[i]);
      silueta.leerColores();
      dibujarEstable(silueta);
      instancias.push(silueta);
    }

    let temporizador = 0;
    window.addEventListener('resize', function () {
      window.clearTimeout(temporizador);
      temporizador = window.setTimeout(function () {
        for (let i = 0; i < instancias.length; i++) {
          instancias[i].leerColores();
          instancias[i].redimensionar();
          dibujarEstable(instancias[i]);
        }
      }, ESPERA_REDIMENSION_MS);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciarFondosCuerpo);
  } else {
    iniciarFondosCuerpo();
  }
})();
