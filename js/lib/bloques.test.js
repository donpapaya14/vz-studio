import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { TOKENS, parseBg, estadoBloques } from './bloques.js';

describe('TOKENS', () => {
  it('trae los 5 tokens del concepto', () => {
    expect(TOKENS).toEqual({
      gr: '#14161B',
      gr2: '#0A0B0E',
      humo: '#2A2D35',
      crema: '#E8E3D8',
      verde: '#C6FF3D',
    });
  });
});

describe('parseBg', () => {
  it('mapea nombre conocido a hex', () => {
    expect(parseBg('verde')).toBe(TOKENS.verde);
    expect(parseBg('crema')).toBe(TOKENS.crema);
  });

  it('nombre desconocido devuelve gr', () => {
    expect(parseBg('inventado')).toBe(TOKENS.gr);
  });

  it('undefined devuelve gr', () => {
    expect(parseBg(undefined)).toBe(TOKENS.gr);
  });
});

describe('estadoBloques', () => {
  it('lista vacía devuelve el estado por defecto', () => {
    expect(estadoBloques([], 800)).toEqual({
      bg: TOKENS.gr,
      ink: 'claro',
      t: 0,
      indice: -1,
    });
  });

  it('punto dentro del primer 70% del bloque activo → t=0', () => {
    const rects = [
      { top: 0, height: 1000, bg: 'gr', ink: 'claro' },
      { top: 1000, height: 1000, bg: 'verde', ink: 'oscuro' },
    ];
    // alturaViewport=800 → y=400, dentro de [0,1000)
    const r = estadoBloques(rects, 800);
    expect(r.indice).toBe(0);
    expect(r.t).toBe(0);
    expect(r.bg).toBe(TOKENS.gr.toLowerCase());
    expect(r.ink).toBe('claro');
  });

  it('punto en el último 30% interpola hacia el siguiente', () => {
    const rects = [
      { top: 0, height: 1000, bg: 'gr', ink: 'claro' },
      { top: 1000, height: 1000, bg: 'verde', ink: 'oscuro' },
    ];
    // alturaViewport=1700 → y=850; tramo activo empieza en 700 (0.7*1000)
    // t = (850-700)/(0.3*1000) = 0.5
    const r = estadoBloques(rects, 1700);
    expect(r.indice).toBe(0);
    expect(r.t).toBeCloseTo(0.5, 10);
    expect(r.ink).toBe('oscuro'); // t>=0.5 → ink del siguiente
  });

  it('sin siguiente bloque, t=0 y bg del activo', () => {
    const rects = [{ top: 0, height: 1000, bg: 'verde', ink: 'oscuro' }];
    const r = estadoBloques(rects, 1900); // y=950, dentro del último 30%
    expect(r.indice).toBe(0);
    expect(r.t).toBe(0);
    expect(r.bg).toBe(TOKENS.verde);
    expect(r.ink).toBe('oscuro');
  });

  it('si ningún bloque contiene el punto, usa el más cercano', () => {
    const rects = [
      { top: 0, height: 500, bg: 'gr', ink: 'claro' },
      { top: 2000, height: 500, bg: 'verde', ink: 'oscuro' },
    ];
    // alturaViewport*0.5 = 800, no cae en ningún bloque; el más cercano es el primero (dist 300 vs 1200)
    const r = estadoBloques(rects, 1600);
    expect(r.indice).toBe(0);
  });

  it('propiedad: t siempre en [0,1] e indice válido', () => {
    const nombres = ['gr', 'gr2', 'humo', 'crema', 'verde'];
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            height: fc.integer({ min: 50, max: 2000 }),
            bg: fc.constantFrom(...nombres),
            ink: fc.constantFrom('claro', 'oscuro'),
          }),
          { minLength: 1, maxLength: 8 }
        ),
        fc.integer({ min: 200, max: 3000 }),
        (bloquesSinTop, alturaViewport) => {
          let acumulado = 0;
          const rects = bloquesSinTop.map((b) => {
            const r = { top: acumulado, height: b.height, bg: b.bg, ink: b.ink };
            acumulado += b.height;
            return r;
          });
          const r = estadoBloques(rects, alturaViewport);
          expect(r.t).toBeGreaterThanOrEqual(0);
          expect(r.t).toBeLessThanOrEqual(1);
          expect(r.indice).toBeGreaterThanOrEqual(0);
          expect(r.indice).toBeLessThan(rects.length);
          expect(r.bg).toMatch(/^#[0-9A-Fa-f]{6}$/);
        }
      )
    );
  });
});
