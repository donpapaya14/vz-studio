import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { fotograma, elegirResolucion, tramo } from './scrub.js';

describe('fotograma', () => {
  it('progreso=0 → primer fotograma', () => {
    expect(fotograma(0, 10)).toEqual({ i: 0, frac: 0 });
  });

  it('progreso=1 → último fotograma', () => {
    expect(fotograma(1, 10)).toEqual({ i: 9, frac: 0 });
  });

  it('progreso a mitad calcula i y frac', () => {
    // n=5 → (n-1)=4; p=0.5 → 2, i=2, frac=0
    expect(fotograma(0.5, 5)).toEqual({ i: 2, frac: 0 });
  });

  it('clampea progreso fuera de [0,1]', () => {
    expect(fotograma(-1, 10)).toEqual({ i: 0, frac: 0 });
    expect(fotograma(2, 10)).toEqual({ i: 9, frac: 0 });
  });

  it('n=1 devuelve siempre {i:0, frac:0}', () => {
    expect(fotograma(0, 1)).toEqual({ i: 0, frac: 0 });
    expect(fotograma(0.5, 1)).toEqual({ i: 0, frac: 0 });
    expect(fotograma(1, 1)).toEqual({ i: 0, frac: 0 });
  });

  it('n no entero lanza RangeError', () => {
    expect(() => fotograma(0.5, 3.5)).toThrow(RangeError);
  });

  it('n<1 lanza RangeError', () => {
    expect(() => fotograma(0.5, 0)).toThrow(RangeError);
    expect(() => fotograma(0.5, -2)).toThrow(RangeError);
  });

  it('propiedad: i y frac siempre en rango para cualquier progreso y n', () => {
    fc.assert(
      fc.property(
        fc.double({ noNaN: true }),
        fc.integer({ min: 1, max: 2000 }),
        (progreso, n) => {
          const { i, frac } = fotograma(progreso, n);
          expect(i).toBeGreaterThanOrEqual(0);
          expect(i).toBeLessThanOrEqual(n - 1);
          expect(frac).toBeGreaterThanOrEqual(0);
          expect(frac).toBeLessThan(1);
        }
      )
    );
  });
});

describe('elegirResolucion', () => {
  it('elige la menor resolución que cubre el tamaño real', () => {
    expect(elegirResolucion(500, [320, 640, 1280])).toBe(640);
  });

  it('coincidencia exacta', () => {
    expect(elegirResolucion(640, [320, 640, 1280])).toBe(640);
  });

  it('si ninguna cubre, devuelve la mayor', () => {
    expect(elegirResolucion(2000, [320, 640, 1280])).toBe(1280);
  });

  it('lista vacía lanza RangeError', () => {
    expect(() => elegirResolucion(500, [])).toThrow(RangeError);
  });

  it('propiedad: siempre devuelve un elemento de la lista', () => {
    fc.assert(
      fc.property(
        fc.double({ noNaN: true, min: 0, max: 5000 }),
        fc.array(fc.integer({ min: 1, max: 5000 }), { minLength: 1, maxLength: 20 }),
        (px, lista) => {
          const r = elegirResolucion(px, lista);
          expect(lista).toContain(r);
        }
      )
    );
  });
});

describe('tramo', () => {
  it('reescala progreso dentro del tramo', () => {
    expect(tramo(0.5, 0, 1)).toBe(0.5);
    expect(tramo(0.25, 0, 0.5)).toBe(0.5);
  });

  it('clampea fuera del tramo', () => {
    expect(tramo(-1, 0, 1)).toBe(0);
    expect(tramo(2, 0, 1)).toBe(1);
  });

  it('fin<=inicio lanza RangeError', () => {
    expect(() => tramo(0.5, 0.5, 0.5)).toThrow(RangeError);
    expect(() => tramo(0.5, 0.6, 0.5)).toThrow(RangeError);
  });
});
