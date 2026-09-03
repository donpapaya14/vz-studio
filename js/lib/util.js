// Utilidades numéricas puras compartidas por los efectos de scroll.

/**
 * Recorta v al rango [min, max].
 * @param {number} v
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

/**
 * Interpolación lineal entre a y b según t.
 * @param {number} a
 * @param {number} b
 * @param {number} t
 * @returns {number}
 */
export function lerp(a, b, t) {
  return a + (b - a) * t;
}

/**
 * Ease-out cúbico: 1-(1-t)^3, con t clampeado a [0,1].
 * @param {number} t
 * @returns {number}
 */
export function easeOutCubic(t) {
  const tc = clamp(t, 0, 1);
  return 1 - Math.pow(1 - tc, 3);
}

/**
 * Formatea una cifra para el contador (prefijo/sufijo + decimales).
 * @param {number} v
 * @param {{prefijo?: string, sufijo?: string, decimales?: number}} [opts]
 * @returns {string}
 */
export function cifraTexto(v, { prefijo = '', sufijo = '', decimales = 0 } = {}) {
  const numero = decimales > 0 ? v.toFixed(decimales) : String(Math.round(v));
  return `${prefijo}${numero}${sufijo}`;
}
