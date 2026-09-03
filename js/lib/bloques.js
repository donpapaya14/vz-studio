// Estado de color/tinta de la sección activa según el scroll (bloques de fondo).

import { clamp } from './util.js';
import { mezclar } from './color.js';

/** Paleta del concepto BLOQUES (CONCEPTO-BLOQUES.md). */
export const TOKENS = {
  gr: '#14161B',
  gr2: '#0A0B0E',
  humo: '#2A2D35',
  crema: '#E8E3D8',
  verde: '#C6FF3D',
};

/**
 * Convierte el nombre de `data-bg` a su hex. Desconocido/undefined → TOKENS.gr.
 * @param {string} [nombre]
 * @returns {string}
 */
export function parseBg(nombre) {
  return TOKENS[nombre] ?? TOKENS.gr;
}

/**
 * Calcula el color de fondo/tinta interpolado según la posición de scroll.
 * @param {{top: number, height: number, bg: string, ink: string}[]} rects ordenados por top
 * @param {number} alturaViewport
 * @returns {{bg: string, ink: string, t: number, indice: number}}
 */
export function estadoBloques(rects, alturaViewport) {
  if (!rects || rects.length === 0) {
    return { bg: TOKENS.gr, ink: 'claro', t: 0, indice: -1 };
  }

  const y = alturaViewport * 0.5;

  let indice = rects.findIndex((r) => r.top <= y && y < r.top + r.height);

  if (indice === -1) {
    // ninguno contiene el punto: el más cercano por distancia al rango [top, top+height]
    let mejorDist = Infinity;
    rects.forEach((r, idx) => {
      const centro = r.top + r.height / 2;
      const dist = Math.abs(y - centro);
      if (dist < mejorDist) {
        mejorDist = dist;
        indice = idx;
      }
    });
  }

  const activo = rects[indice];
  const siguiente = rects[indice + 1];

  const t = siguiente
    ? clamp((y - (activo.top + 0.7 * activo.height)) / (0.3 * activo.height), 0, 1)
    : 0;

  const bg = siguiente
    ? mezclar(parseBg(activo.bg), parseBg(siguiente.bg), t)
    : parseBg(activo.bg);

  const ink = siguiente
    ? t < 0.5
      ? activo.ink
      : siguiente.ink
    : activo.ink;

  return { bg, ink, t, indice };
}
