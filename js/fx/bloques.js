// Interpola el color de fondo del body (--s-bg/--s-ink) entre bloques de
// sección al hacer scroll, usando la lógica pura de js/lib/bloques.js.

import { mezclar } from '../lib/color.js';
import { parseBg } from '../lib/bloques.js';

const INK_HEX = { claro: '#ECEEF2', oscuro: '#16140F' };

function aplicarInk(seccion) {
  const nombre = seccion.dataset.ink === 'oscuro' ? 'oscuro' : 'claro';
  document.documentElement.style.setProperty('--s-ink', INK_HEX[nombre]);
}

/**
 * Monta las transiciones de color de fondo entre secciones data-bg.
 * @param {import('lenis').default} [lenis]
 */
export function montarBloques(lenis) {
  const secciones = Array.from(document.querySelectorAll('section[data-bg]'));
  if (secciones.length === 0) return;

  // estado inicial = hero (primera sección con data-bg)
  document.documentElement.style.setProperty('--s-bg', parseBg(secciones[0].dataset.bg));
  aplicarInk(secciones[0]);

  secciones.forEach((sec, i) => {
    const siguiente = secciones[i + 1];
    if (!siguiente) return;

    // Ventana corta (22vh) justo en la frontera: si la mezcla dura más, la cola
    // de una sección y la cabeza de la siguiente se leen sobre un color intermedio
    // con la tinta equivocada.
    window.ScrollTrigger.create({
      trigger: siguiente,
      start: 'top 22%',
      end: 'top 0%',
      scrub: true,
      onUpdate(st) {
        const bg = mezclar(parseBg(sec.dataset.bg), parseBg(siguiente.dataset.bg), st.progress);
        document.documentElement.style.setProperty('--s-bg', bg);
        aplicarInk(st.progress > 0.5 ? siguiente : sec);
      },
    });
  });
}
