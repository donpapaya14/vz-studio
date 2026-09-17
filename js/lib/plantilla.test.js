import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { paginaContenido, paginaIndice, paginaDiagnostico, sitemap, fechaLarga } from './plantilla.js';

const base = {
  seccion: 'guias',
  slug: 'ejemplo',
  titulo: 'Título de prueba',
  descripcion: 'Descripción de prueba',
  fecha: '2026-09-18',
  html: '<h2 id="uno">Uno</h2>\n<p>Cuerpo.</p>',
  etiqueta: 'Automatización',
  lectura: '6 min',
};

describe('fechaLarga', () => {
  it('convierte ISO a texto en español', () => {
    expect(fechaLarga('2026-09-18')).toBe('18 de septiembre de 2026');
  });

  it('quita el cero inicial del día', () => {
    expect(fechaLarga('2026-01-05')).toBe('5 de enero de 2026');
  });

  it('devuelve tal cual lo que no sea una fecha ISO', () => {
    expect(fechaLarga('mañana')).toBe('mañana');
  });
});

describe('paginaContenido', () => {
  it('tiene un único h1 y es el título', () => {
    const html = paginaContenido(base);
    expect(html.match(/<h1>/g)).toHaveLength(1);
    expect(html).toContain('<h1>Título de prueba</h1>');
  });

  it('lleva canonical absoluto con la sección y el slug', () => {
    expect(paginaContenido(base)).toContain(
      '<link rel="canonical" href="https://vzstudio.dev/guias/ejemplo/">'
    );
  });

  it('lleva meta description', () => {
    expect(paginaContenido(base)).toContain('<meta name="description" content="Descripción de prueba">');
  });

  it('inserta el cuerpo ya convertido sin tocarlo', () => {
    expect(paginaContenido(base)).toContain('<h2 id="uno">Uno</h2>');
  });

  it('marca las guías como TechArticle y los casos como Article', () => {
    expect(paginaContenido(base)).toContain('"@type": "TechArticle"');
    expect(paginaContenido({ ...base, seccion: 'casos' })).toContain('"@type": "Article"');
  });

  it('el JSON-LD es JSON válido', () => {
    const html = paginaContenido(base);
    const bloque = /<script type="application\/ld\+json">\n([\s\S]*?)\n<\/script>/.exec(html);
    expect(bloque).not.toBeNull();
    expect(() => JSON.parse(bloque[1])).not.toThrow();
  });

  it('incluye migas con las tres posiciones', () => {
    const html = paginaContenido(base);
    expect(html).toContain('"@type": "BreadcrumbList"');
    expect(html).toContain('"position": 3');
  });

  it('el enlace de volver apunta al índice de su sección', () => {
    expect(paginaContenido(base)).toContain('href="../../guias/"');
    expect(paginaContenido({ ...base, seccion: 'casos' })).toContain('href="../../casos/"');
  });

  it('muestra el cliente solo si viene', () => {
    expect(paginaContenido(base)).not.toContain('Loyal Capital');
    expect(paginaContenido({ ...base, cliente: 'Loyal Capital' })).toContain('Loyal Capital');
  });

  it('usa dateModified cuando hay actualización', () => {
    expect(paginaContenido({ ...base, actualizado: '2026-10-01' })).toContain('"dateModified": "2026-10-01"');
  });

  it('no mete scripts ejecutables: solo el JSON-LD', () => {
    const html = paginaContenido(base);
    const scripts = html.match(/<script[^>]*>/g) || [];
    expect(scripts).toHaveLength(1);
    expect(scripts[0]).toContain('application/ld+json');
  });

  it('escapa el título en el HTML aunque traiga marcas', () => {
    const html = paginaContenido({ ...base, titulo: '<img src=x onerror=alert(1)>' });
    expect(html).not.toContain('<img src=x');
    expect(html).toContain('&lt;img');
  });

  it('nunca inyecta una etiqueta script desde los metadatos', () => {
    fc.assert(
      fc.property(fc.string(), fc.string(), (titulo, descripcion) => {
        const html = paginaContenido({ ...base, titulo, descripcion, html: '' });
        const scripts = html.match(/<script/g) || [];
        return scripts.length === 1;
      }),
      { numRuns: 200 }
    );
  });
});

describe('paginaIndice', () => {
  const indice = {
    seccion: 'guias',
    titulo: 'Guías',
    descripcion: 'Guías prácticas',
    entradilla: 'Lo que he aprendido montando esto.',
    etiqueta: 'Guías',
    entradas: [
      { slug: 'a', titulo: 'Guía A', descripcion: 'Desc A', fecha: '2026-09-18', etiqueta: 'Webs' },
      { slug: 'b', titulo: 'Guía B', descripcion: 'Desc B', fecha: '2026-09-17', etiqueta: 'Webs' },
    ],
  };

  it('lista todas las entradas, sin paginación', () => {
    const html = paginaIndice(indice);
    expect(html.match(/class="item"/g)).toHaveLength(2);
    expect(html).not.toMatch(/siguiente|página 2/i);
  });

  it('enlaza cada entrada por su slug relativo', () => {
    expect(paginaIndice(indice)).toContain('href="a/"');
  });

  it('tiene un único h1', () => {
    expect(paginaIndice(indice).match(/<h1>/g)).toHaveLength(1);
  });

  it('lleva canonical de la sección', () => {
    expect(paginaIndice(indice)).toContain('<link rel="canonical" href="https://vzstudio.dev/guias/">');
  });

  it('declara CollectionPage con una parte por entrada', () => {
    const html = paginaIndice(indice);
    const bloque = /<script type="application\/ld\+json">\n([\s\S]*?)\n<\/script>/.exec(html);
    const datos = JSON.parse(bloque[1]);
    expect(datos['@type']).toBe('CollectionPage');
    expect(datos.hasPart).toHaveLength(2);
    expect(datos.hasPart[0].url).toBe('https://vzstudio.dev/guias/a/');
  });

  it('aguanta un índice vacío', () => {
    const html = paginaIndice({ ...indice, entradas: [] });
    expect(html).toContain('class="listado"');
    expect(html).not.toContain('class="item"');
  });
});

describe('sitemap', () => {
  it('incluye siempre la home en español e inglés', () => {
    const xml = sitemap([]);
    expect(xml).toContain('<loc>https://vzstudio.dev/</loc>');
    expect(xml).toContain('<loc>https://vzstudio.dev/en/</loc>');
  });

  it('añade una entrada por URL recibida', () => {
    const xml = sitemap([{ ruta: '/guias/', prioridad: '0.9', frecuencia: 'weekly' }]);
    expect(xml.match(/<url>/g)).toHaveLength(3);
    expect(xml).toContain('<loc>https://vzstudio.dev/guias/</loc>');
    expect(xml).toContain('<priority>0.9</priority>');
  });

  it('empieza por la declaración XML', () => {
    expect(sitemap([]).startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
  });

  it('cada URL generada cuelga del dominio', () => {
    fc.assert(
      fc.property(
        fc.array(fc.stringMatching(/^[a-z-]{1,12}$/), { maxLength: 6 }),
        (slugs) => {
          const xml = sitemap(slugs.map((s) => ({ ruta: `/${s}/`, prioridad: '0.7', frecuencia: 'monthly' })));
          const locs = xml.match(/<loc>([^<]+)<\/loc>/g) || [];
          return locs.every((l) => l.includes('<loc>https://vzstudio.dev/'));
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('paginaDiagnostico', () => {
  it('tiene un único h1 y canonical propio', () => {
    const html = paginaDiagnostico();
    expect(html.match(/<h1>/g)).toHaveLength(1);
    expect(html).toContain('<link rel="canonical" href="https://vzstudio.dev/diagnostico/">');
  });

  it('carga su módulo como script externo, nunca en línea', () => {
    const html = paginaDiagnostico();
    expect(html).toContain('src="../js/fx/diagnostico.js"');
    const scripts = html.match(/<script[^>]*>/g) || [];
    expect(scripts.every((s) => /\ssrc=/.test(s) || /ld\+json/.test(s))).toBe(true);
  });

  it('avisa de que no se guarda nada', () => {
    expect(paginaDiagnostico()).toContain('No se guarda nada');
  });

  it('deja una alternativa si no hay JavaScript', () => {
    expect(paginaDiagnostico()).toContain('<noscript>');
  });

  it('su JSON-LD parsea y declara WebApplication', () => {
    const bloque = /<script type="application\/ld\+json">\n([\s\S]*?)\n<\/script>/.exec(paginaDiagnostico());
    const datos = JSON.parse(bloque[1]);
    expect(datos['@graph'][0]['@type']).toBe('WebApplication');
  });
});
