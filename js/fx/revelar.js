// Revelados al hacer scroll: líneas de titular enmascaradas (SplitText) y
// aparición en lote de los bloques .rv, con contador para los que llevan
// data-hasta.

import { contar } from './contar.js';

/** Divide por líneas con máscara los h2 de cabecera de sección y contacto. */
function montarSplitTitulares() {
  const titulares = document.querySelectorAll('.shead h2, .contact h2');
  titulares.forEach((h2) => {
    window.SplitText.create(h2, {
      type: 'lines',
      mask: 'lines',
      linesClass: 'linea',
      autoSplit: true,
      onSplit(self) {
        return window.gsap.from(self.lines, {
          yPercent: 110,
          duration: 0.7,
          stagger: 0.06,
          ease: 'power3.out',
          scrollTrigger: { trigger: h2, start: 'top 96%', once: true },
        });
      },
    });
  });
}

/** Revela en lote los .rv y anima el contador de los que llevan data-hasta. */
function montarLoteRevelados() {
  // 'top bottom' y no 'top 92%': con el efecto hoja la sección entra tapando a
  // la anterior y, si el visitante baja rápido, llegaba con el contenido aún a
  // opacidad 0 encima de una sección oscurecida = pantalla vacía.
  window.ScrollTrigger.batch('.rv', {
    start: 'top bottom',
    once: true,
    onEnter(lote) {
      lote.forEach((el) => {
        el.classList.add('in');
        if (el.dataset.hasta) contar(el);
      });
    },
  });
}

export function montarRevelados() {
  montarSplitTitulares();
  montarLoteRevelados();
}
