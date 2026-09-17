import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { calcular, enlaceWhatsApp, PREGUNTAS } from './diagnostico.js';

const RESPUESTAS_VALIDAS = {
  personas: 3,
  horas: 5,
  coste: 20,
  repetitividad: 0.7,
  canales: 2,
};

describe('PREGUNTAS', () => {
  it('son cinco', () => {
    expect(PREGUNTAS).toHaveLength(5);
  });

  it('cada una tiene id, enunciado y opciones con valor numérico', () => {
    for (const p of PREGUNTAS) {
      expect(p.id).toBeTruthy();
      expect(p.enunciado).toBeTruthy();
      expect(p.opciones.length).toBeGreaterThanOrEqual(2);
      for (const o of p.opciones) {
        expect(typeof o.valor).toBe('number');
        expect(o.texto).toBeTruthy();
      }
    }
  });

  it('los ids no se repiten', () => {
    const ids = PREGUNTAS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('calcular', () => {
  it('devuelve horas al año, euros al año y horas recuperables', () => {
    const r = calcular(RESPUESTAS_VALIDAS);
    expect(r).toHaveProperty('horasAno');
    expect(r).toHaveProperty('eurosAno');
    expect(r).toHaveProperty('horasRecuperables');
    expect(r).toHaveProperty('eurosRecuperables');
  });

  it('3 personas × 5 h/semana = 15 h/semana = 780 h/año', () => {
    const r = calcular({ ...RESPUESTAS_VALIDAS, personas: 3, horas: 5 });
    expect(r.horasAno).toBe(780);
  });

  it('780 h/año a 20 €/h son 15.600 € al año', () => {
    const r = calcular({ ...RESPUESTAS_VALIDAS, personas: 3, horas: 5, coste: 20 });
    expect(r.eurosAno).toBe(15600);
  });

  it('lo recuperable es la parte repetitiva, no el total', () => {
    // con 1 canal el factor de dispersión es neutro (1.0), así que la
    // fracción recuperable es exactamente la repetitividad
    const r = calcular({ ...RESPUESTAS_VALIDAS, repetitividad: 0.5, canales: 1 });
    expect(r.horasRecuperables).toBeCloseTo(r.horasAno * 0.5, 6);
    expect(r.horasRecuperables).toBeLessThan(r.horasAno);
  });

  it('con repetitividad 0 no hay nada que recuperar', () => {
    const r = calcular({ ...RESPUESTAS_VALIDAS, repetitividad: 0 });
    expect(r.horasRecuperables).toBe(0);
    expect(r.eurosRecuperables).toBe(0);
  });

  it('más canales sueltos aumentan el desperdicio estimado', () => {
    const pocos = calcular({ ...RESPUESTAS_VALIDAS, canales: 1 });
    const muchos = calcular({ ...RESPUESTAS_VALIDAS, canales: 5 });
    expect(muchos.horasRecuperables).toBeGreaterThan(pocos.horasRecuperables);
  });

  it('nunca estima recuperar más horas de las que se pierden', () => {
    const r = calcular({ ...RESPUESTAS_VALIDAS, repetitividad: 1, canales: 9 });
    expect(r.horasRecuperables).toBeLessThanOrEqual(r.horasAno);
  });

  it('tolera entradas ausentes sin reventar', () => {
    const r = calcular({});
    expect(Number.isFinite(r.horasAno)).toBe(true);
    expect(r.horasAno).toBeGreaterThanOrEqual(0);
  });

  it('propiedad: ningún resultado es negativo ni NaN', () => {
    fc.assert(
      fc.property(
        fc.record({
          personas: fc.double({ min: 0, max: 500, noNaN: true }),
          horas: fc.double({ min: 0, max: 80, noNaN: true }),
          coste: fc.double({ min: 0, max: 500, noNaN: true }),
          repetitividad: fc.double({ min: 0, max: 1, noNaN: true }),
          canales: fc.double({ min: 0, max: 20, noNaN: true }),
        }),
        (r) => {
          const res = calcular(r);
          for (const v of Object.values(res)) {
            expect(Number.isFinite(v)).toBe(true);
            expect(v).toBeGreaterThanOrEqual(0);
          }
          expect(res.horasRecuperables).toBeLessThanOrEqual(res.horasAno + 1e-9);
        }
      )
    );
  });
});

describe('enlaceWhatsApp', () => {
  const resultado = calcular(RESPUESTAS_VALIDAS);

  it('apunta al número de Vladys', () => {
    expect(enlaceWhatsApp(resultado)).toContain('wa.me/34722736832');
  });

  it('lleva las cifras en el texto', () => {
    const url = decodeURIComponent(enlaceWhatsApp(resultado));
    expect(url).toContain(String(Math.round(resultado.horasRecuperables)));
  });

  it('no incluye ningún dato personal, solo cifras que ha metido el visitante', () => {
    const url = enlaceWhatsApp(resultado).toLowerCase();
    for (const prohibido of ['@', 'nombre=', 'email', 'telefono=', 'ip=']) {
      expect(url).not.toContain(prohibido);
    }
  });

  it('propiedad: siempre es una URL https de wa.me bien formada', () => {
    fc.assert(
      fc.property(
        fc.record({
          personas: fc.double({ min: 0, max: 500, noNaN: true }),
          horas: fc.double({ min: 0, max: 80, noNaN: true }),
          coste: fc.double({ min: 0, max: 500, noNaN: true }),
          repetitividad: fc.double({ min: 0, max: 1, noNaN: true }),
          canales: fc.double({ min: 0, max: 20, noNaN: true }),
        }),
        (r) => {
          const url = enlaceWhatsApp(calcular(r));
          expect(url.startsWith('https://wa.me/')).toBe(true);
          expect(() => new URL(url)).not.toThrow();
        }
      )
    );
  });
});
