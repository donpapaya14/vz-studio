// Contador de cifras: anima de 0 al valor de data-hasta en 1200ms con
// ease-out cúbico, usando el formateo puro de js/lib/util.js.

import { cifraTexto, easeOutCubic } from '../lib/util.js';

const DURACION_MS = 1200;

/**
 * Anima el número dentro de un elemento marcado con data-hasta.
 * Busca el nodo a escribir en `.cnt` (o el propio elemento si no existe).
 * @param {HTMLElement} el
 */
export function contar(el) {
  const destino = Number(el.dataset.hasta);
  if (!Number.isFinite(destino)) return;

  const objetivo = el.querySelector('.cnt') || el;
  const opts = {
    prefijo: el.dataset.prefijo || '',
    sufijo: el.dataset.sufijo || '',
    decimales: Number(el.dataset.decimales) || 0,
  };

  const inicio = performance.now();

  function paso(ahora) {
    const t = Math.min(1, (ahora - inicio) / DURACION_MS);
    const valor = destino * easeOutCubic(t);
    objetivo.textContent = cifraTexto(valor, opts);
    if (t < 1) requestAnimationFrame(paso);
  }

  requestAnimationFrame(paso);
}
