(() => {
  if (
    !window.matchMedia('(hover: hover) and (pointer: fine)').matches ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    return;
  }

  const limitar = (valor) => Math.max(-1, Math.min(1, valor));

  document.querySelectorAll('.tarjeta').forEach((tarjeta) => {
    let idCuadro = 0;
    let punteroX = 0;
    let punteroY = 0;

    const actualizar = () => {
      idCuadro = 0;
      const rect = tarjeta.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const px = limitar(((punteroX - rect.left) / rect.width) * 2 - 1);
      const py = limitar(((punteroY - rect.top) / rect.height) * 2 - 1);
      tarjeta.style.setProperty('--inclinar-x', -py * 5 + 'deg');
      tarjeta.style.setProperty('--inclinar-y', px * 5 + 'deg');
    };

    const restablecer = () => {
      if (idCuadro) {
        cancelAnimationFrame(idCuadro);
        idCuadro = 0;
      }
      tarjeta.style.setProperty('--inclinar-x', '0deg');
      tarjeta.style.setProperty('--inclinar-y', '0deg');
    };

    tarjeta.addEventListener('pointermove', (evento) => {
      punteroX = evento.clientX;
      punteroY = evento.clientY;
      if (!idCuadro) idCuadro = requestAnimationFrame(actualizar);
    });

    tarjeta.addEventListener('pointerleave', restablecer);
    tarjeta.addEventListener('blur', restablecer);
    tarjeta.addEventListener('focusout', restablecer);
  });
})();
