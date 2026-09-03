import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { hexARgb, rgbAHex, mezclar } from './color.js';

describe('hexARgb', () => {
  it('convierte con almohadilla', () => {
    expect(hexARgb('#C6FF3D')).toEqual([198, 255, 61]);
  });

  it('convierte sin almohadilla', () => {
    expect(hexARgb('C6FF3D')).toEqual([198, 255, 61]);
  });

  it('acepta minúsculas', () => {
    expect(hexARgb('#c6ff3d')).toEqual([198, 255, 61]);
  });

  it('lanza TypeError si no es válido', () => {
    expect(() => hexARgb('no-es-hex')).toThrow(TypeError);
    expect(() => hexARgb('#GGGGGG')).toThrow(TypeError);
    expect(() => hexARgb(undefined)).toThrow(TypeError);
    expect(() => hexARgb('#FFF')).toThrow(TypeError);
  });
});

describe('rgbAHex', () => {
  it('convierte a hex en minúsculas', () => {
    expect(rgbAHex([198, 255, 61])).toBe('#c6ff3d');
  });

  it('redondea decimales', () => {
    expect(rgbAHex([198.6, 254.5, 60.4])).toBe('#c7ff3c');
  });

  it('recorta (clamp) fuera de 0-255', () => {
    expect(rgbAHex([-10, 300, 128])).toBe('#00ff80');
  });
});

describe('mezclar', () => {
  it('t=0 devuelve el primer color', () => {
    expect(mezclar('#14161B', '#C6FF3D', 0)).toBe('#14161b');
  });

  it('t=1 devuelve el segundo color', () => {
    expect(mezclar('#14161B', '#C6FF3D', 1)).toBe('#c6ff3d');
  });

  it('t=0.5 mezcla a mitad de camino', () => {
    expect(mezclar('#000000', '#ffffff', 0.5)).toBe('#808080');
  });

  it('clampea t fuera de 0-1', () => {
    expect(mezclar('#000000', '#ffffff', -5)).toBe('#000000');
    expect(mezclar('#000000', '#ffffff', 5)).toBe('#ffffff');
  });

  it('propiedad: t=0 siempre es el primero, t=1 siempre el segundo', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 0xffffff }),
        fc.integer({ min: 0, max: 0xffffff }),
        (a, b) => {
          const hexA = '#' + a.toString(16).padStart(6, '0');
          const hexB = '#' + b.toString(16).padStart(6, '0');
          expect(mezclar(hexA, hexB, 0)).toBe(hexA.toLowerCase());
          expect(mezclar(hexA, hexB, 1)).toBe(hexB.toLowerCase());
        }
      )
    );
  });

  it('propiedad: siempre devuelve un hex válido de 6 dígitos', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 0xffffff }),
        fc.integer({ min: 0, max: 0xffffff }),
        fc.double({ noNaN: true }),
        (a, b, t) => {
          const hexA = '#' + a.toString(16).padStart(6, '0');
          const hexB = '#' + b.toString(16).padStart(6, '0');
          expect(mezclar(hexA, hexB, t)).toMatch(/^#[0-9a-f]{6}$/);
        }
      )
    );
  });
});
