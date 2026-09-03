// Cálculo de fotograma para el scrub de vídeo por secuencia de imágenes.

import { clamp } from './util.js';

/**
 * Fotograma e interpolación fraccional para un progreso [0,1] sobre n fotogramas.
 * @param {number} progreso
 * @param {number} n
 * @returns {{i: number, frac: number}}
 */
export function fotograma(progreso, n) {
  if (!Number.isInteger(n) || n < 1) {
    throw new RangeError(`n debe ser un entero >= 1: ${n}`);
  }
  if (n === 1) return { i: 0, frac: 0 };

  const p = clamp(progreso, 0, 1);
  const escala = p * (n - 1);
  const i = clamp(Math.floor(escala), 0, n - 1);
  const frac = escala - i;
  return { i, frac };
}

/**
 * Elige la menor resolución de la lista que sea >= pxReales; si ninguna, la mayor.
 * @param {number} pxReales
 * @param {number[]} lista
 * @returns {number}
 */
export function elegirResolucion(pxReales, lista) {
  if (!Array.isArray(lista) || lista.length === 0) {
    throw new RangeError('lista de resoluciones vacía');
  }
  const ordenada = [...lista].sort((a, b) => a - b);
  const encontrada = ordenada.find((r) => r >= pxReales);
  return encontrada !== undefined ? encontrada : ordenada[ordenada.length - 1];
}

/**
 * Reescala progreso al tramo [inicio, fin], clampeado a [0,1].
 * @param {number} progreso
 * @param {number} inicio
 * @param {number} fin
 * @returns {number}
 */
export function tramo(progreso, inicio, fin) {
  if (fin <= inicio) {
    throw new RangeError(`fin debe ser mayor que inicio: ${inicio}, ${fin}`);
  }
  return clamp((progreso - inicio) / (fin - inicio), 0, 1);
}
