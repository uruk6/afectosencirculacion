// Botón de pausa del campo de partículas (único control: el modo de plataforma y el cambio de fondo se quitaron).
(() => {
  'use strict';

  const maxIntentos = 20;

  function actualizarBotonPausa(boton, pausado) {
    boton.setAttribute('aria-pressed', String(Boolean(pausado)));
    boton.textContent = pausado ? 'Reanudar movimiento' : 'Pausar movimiento';
  }

  function conectar(boton, control) {
    // Con "reducir movimiento" el campo arranca pausado y el botón lo dice.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      if (!control.pausado) control.alternarPausa();
      actualizarBotonPausa(boton, true);
    }

    boton.addEventListener('click', () => {
      actualizarBotonPausa(boton, control.alternarPausa());
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    const boton = document.querySelector('[data-pausa]');
    const canvas = document.querySelector('canvas[data-particulas]');
    if (!boton || !canvas) return;

    function intentarConectar(intentos) {
      if (canvas.control) {
        conectar(boton, canvas.control);
      } else if (intentos < maxIntentos) {
        requestAnimationFrame(() => intentarConectar(intentos + 1));
      }
    }

    intentarConectar(0);
  });
})();
