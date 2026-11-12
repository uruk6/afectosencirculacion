(function () {
  'use strict';

  document.documentElement.classList.add('js');

  const boton = document.querySelector('.nav__alternar');
  const lista = document.getElementById('nav-lista');
  if (!boton || !lista) return;

  const nav = boton.closest('.nav');

  function estaAbierto() {
    return boton.getAttribute('aria-expanded') === 'true';
  }

  function establecerAbierto(abierto) {
    boton.setAttribute('aria-expanded', abierto ? 'true' : 'false');
    boton.textContent = abierto ? 'Cerrar' : 'Menú';
  }

  boton.addEventListener('click', () => {
    establecerAbierto(!estaAbierto());
  });

  lista.addEventListener('click', (evento) => {
    if (evento.target instanceof Element && evento.target.closest('a')) {
      establecerAbierto(false);
    }
  });

  document.addEventListener('click', (evento) => {
    if (estaAbierto() && nav && !nav.contains(evento.target)) {
      establecerAbierto(false);
    }
  });

  document.addEventListener('keydown', (evento) => {
    if (evento.key === 'Escape' && estaAbierto()) {
      establecerAbierto(false);
      boton.focus();
    }
  });

  const mediaEscritorio = window.matchMedia('(min-width: 1100px)');
  mediaEscritorio.addEventListener('change', (evento) => {
    if (evento.matches) {
      establecerAbierto(false);
    }
  });
})();
