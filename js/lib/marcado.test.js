import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { aHtml, partirPortada, deslizar } from './marcado.js';

describe('partirPortada', () => {
  it('una frase con comas sigue siendo una cadena, no una lista', () => {
    const { datos } = partirPortada('---\ndescripcion: Uno, dos y tres.\n---\ncuerpo');
    expect(datos.descripcion).toBe('Uno, dos y tres.');
  });

  it('solo es lista lo que va entre corchetes', () => {
    const { datos } = partirPortada('---\netiquetas: [webs, seo]\n---\ncuerpo');
    expect(datos.etiquetas).toEqual(['webs', 'seo']);
  });

  it('separa la portada YAML del cuerpo', () => {
    const { datos, cuerpo } = partirPortada(
      '---\ntitulo: Hola\nfecha: 2026-09-18\n---\nTexto del cuerpo.'
    );
    expect(datos.titulo).toBe('Hola');
    expect(datos.fecha).toBe('2026-09-18');
    expect(cuerpo.trim()).toBe('Texto del cuerpo.');
  });

  it('no rompe si no hay portada', () => {
    const { datos, cuerpo } = partirPortada('Solo cuerpo');
    expect(datos).toEqual({});
    expect(cuerpo).toBe('Solo cuerpo');
  });

  it('respeta los dos puntos dentro del valor', () => {
    const { datos } = partirPortada('---\ntitulo: n8n: la guía\n---\n');
    expect(datos.titulo).toBe('n8n: la guía');
  });
});

describe('deslizar', () => {
  it('convierte a minúsculas y guiones', () => {
    expect(deslizar('Cómo automatizar leads')).toBe('como-automatizar-leads');
  });

  it('quita acentos y signos', () => {
    expect(deslizar('¿n8n o Make? — 2026')).toBe('n8n-o-make-2026');
  });

  it('propiedad: solo devuelve [a-z0-9-] y nunca empieza ni acaba en guion', () => {
    fc.assert(
      fc.property(fc.string(), (s) => {
        const r = deslizar(s);
        expect(r).toMatch(/^[a-z0-9-]*$/);
        if (r.length > 0) {
          expect(r.startsWith('-')).toBe(false);
          expect(r.endsWith('-')).toBe(false);
        }
      })
    );
  });
});

describe('aHtml', () => {
  it('convierte encabezados', () => {
    expect(aHtml('## Un título')).toContain('<h2 id="un-titulo">Un título</h2>');
  });

  it('convierte párrafos', () => {
    expect(aHtml('Una frase.')).toBe('<p>Una frase.</p>');
  });

  it('convierte negrita y cursiva', () => {
    expect(aHtml('**fuerte** y *suave*')).toContain('<strong>fuerte</strong>');
    expect(aHtml('**fuerte** y *suave*')).toContain('<em>suave</em>');
  });

  it('convierte código en línea', () => {
    expect(aHtml('usa `npm run build`')).toContain('<code>npm run build</code>');
  });

  it('convierte listas con guion', () => {
    const html = aHtml('- uno\n- dos');
    expect(html).toContain('<ul>');
    expect(html).toContain('<li>uno</li>');
    expect(html).toContain('<li>dos</li>');
  });

  it('convierte listas numeradas', () => {
    const html = aHtml('1. primero\n2. segundo');
    expect(html).toContain('<ol>');
    expect(html).toContain('<li>primero</li>');
  });

  it('convierte enlaces', () => {
    // sin `dominio` propio, toda URL absoluta cuenta como externa: es el
    // lado seguro, porque marcarla de más solo añade rel="noopener"
    expect(aHtml('[VZ](https://vzstudio.dev)')).toContain('href="https://vzstudio.dev"');
    expect(aHtml('[VZ](https://vzstudio.dev)')).toContain('>VZ</a>');
  });

  it('con dominio propio, el enlace a la propia web no lleva target', () => {
    const html = aHtml('[VZ](https://vzstudio.dev/guias/)', { dominio: 'vzstudio.dev' });
    expect(html).toContain('href="https://vzstudio.dev/guias/"');
    expect(html).not.toContain('target="_blank"');
  });

  it('marca los enlaces externos con rel y target', () => {
    const html = aHtml('[fuera](https://ejemplo.com)', { dominio: 'vzstudio.dev' });
    expect(html).toContain('rel="noopener"');
    expect(html).toContain('target="_blank"');
  });

  it('deja los enlaces internos sin target', () => {
    const html = aHtml('[dentro](/guias/)', { dominio: 'vzstudio.dev' });
    expect(html).not.toContain('target="_blank"');
  });

  it('convierte bloques de cita', () => {
    expect(aHtml('> una cita')).toContain('<blockquote><p>una cita</p></blockquote>');
  });

  it('convierte tablas', () => {
    const html = aHtml('| A | B |\n|---|---|\n| 1 | 2 |');
    expect(html).toContain('<table>');
    expect(html).toContain('<th>A</th>');
    expect(html).toContain('<td>1</td>');
  });

  it('escapa HTML para que el contenido no pueda inyectar scripts', () => {
    const html = aHtml('Texto <script>alert(1)</script> más');
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('escapa también dentro del código en línea', () => {
    expect(aHtml('`<b>x</b>`')).toContain('<code>&lt;b&gt;x&lt;/b&gt;</code>');
  });

  it('propiedad: nunca deja pasar un <script> literal', () => {
    fc.assert(
      fc.property(fc.string(), (s) => {
        expect(aHtml(s).toLowerCase()).not.toContain('<script');
      })
    );
  });

  it('propiedad: siempre devuelve una cadena', () => {
    fc.assert(
      fc.property(fc.string(), (s) => {
        expect(typeof aHtml(s)).toBe('string');
      })
    );
  });
});
