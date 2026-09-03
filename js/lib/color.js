// Conversión y mezcla de color hexadecimal para la transición de fondo por bloques.

const HEX_RE = /^#?([0-9a-fA-F]{6})$/;

/**
 * Convierte un hex ('#RRGGBB' o 'RRGGBB') a [r,g,b].
 * @param {string} hex
 * @returns {[number, number, number]}
 */
export function hexARgb(hex) {
  const m = typeof hex === 'string' ? hex.match(HEX_RE) : null;
  if (!m) throw new TypeError(`hex inválido: ${hex}`);
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

const clamp255 = (v) => Math.min(255, Math.max(0, Math.round(v)));

/**
 * Convierte [r,g,b] a '#rrggbb' en minúsculas, con clamp y redondeo.
 * @param {[number, number, number]} rgb
 * @returns {string}
 */
export function rgbAHex([r, g, b]) {
  return (
    '#' +
    [r, g, b]
      .map(clamp255)
      .map((v) => v.toString(16).padStart(2, '0'))
      .join('')
  );
}

/**
 * Mezcla lineal entre dos hex según t (clampeado a [0,1]).
 * @param {string} hexA
 * @param {string} hexB
 * @param {number} t
 * @returns {string}
 */
export function mezclar(hexA, hexB, t) {
  const tc = Math.min(1, Math.max(0, t));
  const [ra, ga, ba] = hexARgb(hexA);
  const [rb, gb, bb] = hexARgb(hexB);
  return rgbAHex([
    ra + (rb - ra) * tc,
    ga + (gb - ga) * tc,
    ba + (bb - ba) * tc,
  ]);
}
