import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { clamp, lerp, easeOutCubic, cifraTexto } from './util.js';

describe('clamp', () => {
  it('deja pasar valores dentro del rango', () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it('recorta por debajo del mínimo', () => {
    expect(clamp(-5, 0, 10)).toBe(0);
  });

  it('recorta por encima del máximo', () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });

  it('propiedad: siempre dentro de [min,max]', () => {
    fc.assert(
      fc.property(
        fc.double({ noNaN: true }),
        fc.double({ noNaN: true }),
        fc.double({ noNaN: true }),
        (v, a, b) => {
          const min = Math.min(a, b);
          const max = Math.max(a, b);
          const r = clamp(v, min, max);
          expect(r).toBeGreaterThanOrEqual(min);
          expect(r).toBeLessThanOrEqual(max);
        }
      )
    );
  });
});

describe('lerp', () => {
  it('t=0 devuelve a', () => {
    expect(lerp(10, 20, 0)).toBe(10);
  });

  it('t=1 devuelve b', () => {
    expect(lerp(10, 20, 1)).toBe(20);
  });

  it('t=0.5 devuelve el punto medio', () => {
    expect(lerp(10, 20, 0.5)).toBe(15);
  });
});

describe('easeOutCubic', () => {
  it('t=0 devuelve 0', () => {
    expect(easeOutCubic(0)).toBe(0);
  });

  it('t=1 devuelve 1', () => {
    expect(easeOutCubic(1)).toBe(1);
  });

  it('calcula 1-(1-t)^3', () => {
    expect(easeOutCubic(0.5)).toBeCloseTo(1 - Math.pow(0.5, 3), 10);
  });

  it('clampea t fuera de [0,1]', () => {
    expect(easeOutCubic(-1)).toBe(0);
    expect(easeOutCubic(2)).toBe(1);
  });
});

describe('cifraTexto', () => {
  it('redondea a entero por defecto', () => {
    expect(cifraTexto(4.7)).toBe('5');
  });

  it('añade prefijo y sufijo', () => {
    expect(cifraTexto(5, { prefijo: '+', sufijo: 'M' })).toBe('+5M');
  });

  it('usa decimales con toFixed', () => {
    expect(cifraTexto(4.567, { decimales: 2 })).toBe('4.57');
  });

  it('decimales=0 usa Math.round', () => {
    expect(cifraTexto(4.5, { decimales: 0 })).toBe('5');
  });
});
