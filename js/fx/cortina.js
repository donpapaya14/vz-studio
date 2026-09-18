// Cortina antes/después: el "después" se revela con scroll (scrub de
// ScrollTrigger) y, en cuanto el usuario mueve el ratón o el dedo encima,
// pasa a seguir el puntero y deja de escuchar al scroll (sin volver atrás).

import { clamp } from '../lib/util.js';

/**
 * Calcula el porcentaje de corte (0-100) a partir de una coordenada X de
 * puntero relativa al rectángulo del escenario.
 * @param {number} clientX
 * @param {DOMRect} rect
 * @returns {number}
 */
function corteDesdePuntero(clientX, rect) {
  return clamp(((clientX - rect.left) / rect.width) * 100, 0, 100);
}

/** Monta el efecto cortina en todos los `[data-cortina]` de la página. */
export function montarCortinas() {
  // En pantallas estrechas el CSS apila antes y después como dos láminas: no
  // hay nada que revelar ni que arrastrar. Solo se monta con ratón y sitio.
  if (!window.matchMedia('(min-width: 861px) and (hover: hover)').matches) return;

  document.querySelectorAll('[data-cortina]').forEach((el) => {
    let st = window.ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      end: 'top 25%',
      scrub: true,
      onUpdate(self) {
        el.style.setProperty('--corte', `${100 - self.progress * 100}%`);
      },
    });

    // el usuario manda en cuanto interactúa: mata el scrub, sin volver atrás
    function seguirPuntero(clientX) {
      if (st) { st.kill(); st = null; }
      el.style.setProperty('--corte', `${corteDesdePuntero(clientX, el.getBoundingClientRect())}%`);
    }

    el.addEventListener('pointerdown', (e) => seguirPuntero(e.clientX));
    el.addEventListener('pointermove', (e) => {
      // con ratón basta pasar por encima; con un dedo (tablet) hace falta arrastrar
      if (e.pointerType === 'mouse' || e.buttons > 0) seguirPuntero(e.clientX);
    });
  });
}

/** Reduce-motion: corte fijo al 50%, sin scrub ni seguimiento de puntero. */
export function fijarCortinas() {
  document.querySelectorAll('[data-cortina]').forEach((el) => {
    el.style.setProperty('--corte', '50%');
  });
}
