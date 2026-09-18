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
          duration: 0.9,
          stagger: 0.08,
          ease: 'power3.out',
          scrollTrigger: { trigger: h2, start: 'top 85%', once: true },
        });
      },
    });
  });
}

/** Revela en lote los .rv y anima el contador de los que llevan data-hasta. */
function montarLoteRevelados() {
  window.ScrollTrigger.batch('.rv', {
    start: 'top 92%',
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
