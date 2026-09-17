// Arma el HTML completo de una página de contenido (guía o caso) y de los
// índices. Función pura: recibe datos, devuelve una cadena. Así se testea sin
// tocar disco y `bin/construir.mjs` solo se ocupa de leer y escribir.
//
// Todo lo que sale de aquí respeta la CSP del sitio: sin <script> en línea,
// sin estilos en línea, sin recursos de terceros.

import { escapar } from './marcado.js';

const SITIO = 'https://vzstudio.dev';

/** Cabecera común: nav coherente con el de la home. */
function nav(raiz) {
  return `<nav class="nav" id="nav">
  <div class="row">
    <a class="brand" href="${raiz}"><svg viewBox="0 0 120 124" fill="none" aria-label="VZ"><path d="M22 26 L58 96 L94 26" stroke="currentColor" stroke-width="7" stroke-linejoin="miter"/><path d="M72 70 L98 70 L74 90 L98 90" stroke="currentColor" stroke-width="5.5" stroke-linejoin="miter"/></svg><span class="bn">VZ Studio</span></a>
    <div class="nlinks">
      <a href="${raiz}#automatizacion">Automatización</a>
      <a href="${raiz}#rediseno">Rediseño</a>
      <a href="${raiz}casos/">Casos</a>
      <a href="${raiz}guias/">Guías</a>
      <a href="${raiz}diagnostico/">Diagnóstico</a>
      <a class="cta" href="${raiz}#contacto">Hablemos</a>
    </div>
  </div>
</nav>`;
}

function pie(raiz) {
  return `<footer class="footer">
  <div class="cols">
    <div>
      <span class="fh">VZ Studio</span>
      <p class="colofon">Automatizaciones con n8n, agentes de IA y webs a medida. Murcia y Alicante, en remoto para toda España.</p>
    </div>
    <div>
      <span class="fh">Contacto</span>
      <ul>
        <li><a href="mailto:vladys@vzstudio.dev">vladys@vzstudio.dev</a></li>
        <li><a href="https://wa.me/34722736832">WhatsApp</a></li>
        <li><a href="https://linkedin.com/in/vzstudio" target="_blank" rel="noopener">LinkedIn</a></li>
      </ul>
    </div>
    <div>
      <span class="fh">Secciones</span>
      <ul>
        <li><a href="${raiz}">Inicio</a></li>
        <li><a href="${raiz}casos/">Casos</a></li>
        <li><a href="${raiz}guias/">Guías</a></li>
        <li><a href="${raiz}diagnostico/">Diagnóstico</a></li>
      </ul>
    </div>
  </div>
  <div class="legalrow"><span>© 2026 VZ Studio · Vladys Z.</span><span>Murcia / Alicante, España</span></div>
</footer>`;
}

/**
 * JSON-LD seguro dentro de <script>: JSON.stringify no escapa `<`, así que un
 * título con `</script>` cerraría el bloque y el resto se ejecutaría como HTML.
 * Escapamos los tres caracteres que pueden romper el contexto de script.
 */
function jsonLdSeguro(datos) {
  return JSON.stringify(datos, null, 2)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
}

/** 2026-09-18 → "18 de septiembre de 2026". */
export function fechaLarga(iso) {
  const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso));
  if (!m) return String(iso);
  return `${Number(m[3])} de ${meses[Number(m[2]) - 1]} de ${m[1]}`;
}

/**
 * Página de contenido (guía o caso).
 * @param {{seccion:string,slug:string,titulo:string,descripcion:string,fecha:string,html:string,etiqueta?:string,lectura?:string,cliente?:string,actualizado?:string}} p
 * @returns {string}
 */
export function paginaContenido(p) {
  const raiz = '../../';
  const url = `${SITIO}/${p.seccion}/${p.slug}/`;
  const esCaso = p.seccion === 'casos';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': esCaso ? 'Article' : 'TechArticle',
        headline: p.titulo,
        description: p.descripcion,
        datePublished: p.fecha,
        dateModified: p.actualizado || p.fecha,
        inLanguage: 'es-ES',
        mainEntityOfPage: url,
        author: { '@type': 'Person', name: 'Vladyslav Zinkevych', url: `${SITIO}/` },
        publisher: { '@type': 'Organization', name: 'VZ Studio', url: `${SITIO}/` },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${SITIO}/` },
          {
            '@type': 'ListItem',
            position: 2,
            name: esCaso ? 'Casos' : 'Guías',
            item: `${SITIO}/${p.seccion}/`,
          },
          { '@type': 'ListItem', position: 3, name: p.titulo, item: url },
        ],
      },
    ],
  };

  const meta = [
    p.fecha ? `<time datetime="${p.fecha}">${fechaLarga(p.fecha)}</time>` : '',
    p.lectura ? `<span>${escapar(p.lectura)} de lectura</span>` : '',
    p.cliente ? `<span>${escapar(p.cliente)}</span>` : '',
  ].filter(Boolean).join('<span class="sep">·</span>');

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapar(p.titulo)} · VZ Studio</title>
<meta name="description" content="${escapar(p.descripcion)}">
<link rel="canonical" href="${url}">
<meta property="og:title" content="${escapar(p.titulo)}">
<meta property="og:description" content="${escapar(p.descripcion)}">
<meta property="og:type" content="article">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITIO}/assets/og.jpg">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#14161B">
<link rel="icon" href="${raiz}favicon.svg" type="image/svg+xml">
<link rel="preload" href="${raiz}fonts/generalsans-400.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${raiz}fonts/bricolage-var.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${raiz}css/style.css">
<script type="application/ld+json">
${jsonLdSeguro(jsonLd)}
</script>
</head>
<body class="doc">

${nav(raiz)}

<main>
<article class="prosa-wrap">
  <header class="prosa-head">
    <a class="volver" href="${raiz}${p.seccion}/">← ${esCaso ? 'Todos los casos' : 'Todas las guías'}</a>
    <span class="tag">${escapar(p.etiqueta || (esCaso ? 'Caso' : 'Guía'))}</span>
    <h1>${escapar(p.titulo)}</h1>
    <p class="entradilla">${escapar(p.descripcion)}</p>
    ${meta ? `<p class="prosa-meta">${meta}</p>` : ''}
  </header>
  <div class="prosa">
${p.html}
  </div>
  <aside class="prosa-cta">
    <h2>¿Te pasa algo parecido?</h2>
    <p>Cuéntamelo en dos líneas y te digo si tiene arreglo y cuánto cuesta. Sin compromiso.</p>
    <div class="acciones">
      <a class="btn btn-solid" href="https://wa.me/34722736832">Escríbeme por WhatsApp</a>
      <a class="btn btn-ghost" href="${raiz}diagnostico/">Calcular lo que pierdo</a>
    </div>
  </aside>
</article>
</main>

${pie(raiz)}

</body>
</html>`;
}

/**
 * Índice de una sección: lista completa, sin paginación.
 * @param {{seccion:string,titulo:string,descripcion:string,entradilla:string,etiqueta:string,entradas:object[]}} p
 * @returns {string}
 */
export function paginaIndice(p) {
  const raiz = '../';
  const url = `${SITIO}/${p.seccion}/`;

  const items = p.entradas
    .map(
      (e) => `    <article class="item">
      <a href="${e.slug}/">
        <span class="tag">${escapar(e.etiqueta || '')}</span>
        <h2>${escapar(e.titulo)}</h2>
        <p>${escapar(e.descripcion)}</p>
        ${e.fecha ? `<time datetime="${e.fecha}">${fechaLarga(e.fecha)}</time>` : ''}
      </a>
    </article>`
    )
    .join('\n');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: p.titulo,
    description: p.descripcion,
    url,
    inLanguage: 'es-ES',
    hasPart: p.entradas.map((e) => ({
      '@type': 'Article',
      headline: e.titulo,
      url: `${url}${e.slug}/`,
    })),
  };

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapar(p.titulo)} · VZ Studio</title>
<meta name="description" content="${escapar(p.descripcion)}">
<link rel="canonical" href="${url}">
<meta property="og:title" content="${escapar(p.titulo)}">
<meta property="og:description" content="${escapar(p.descripcion)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITIO}/assets/og.jpg">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#14161B">
<link rel="icon" href="${raiz}favicon.svg" type="image/svg+xml">
<link rel="preload" href="${raiz}fonts/generalsans-400.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${raiz}fonts/bricolage-var.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${raiz}css/style.css">
<script type="application/ld+json">
${jsonLdSeguro(jsonLd)}
</script>
</head>
<body class="doc">

${nav(raiz)}

<main>
<section class="listado-wrap">
  <header class="prosa-head">
    <span class="tag">${escapar(p.etiqueta)}</span>
    <h1>${escapar(p.titulo)}</h1>
    <p class="entradilla">${escapar(p.entradilla)}</p>
  </header>
  <div class="listado">
${items}
  </div>
</section>
</main>

${pie(raiz)}

</body>
</html>`;
}

/**
 * sitemap.xml con las dos URLs fijas más las de contenido.
 * @param {{ruta:string, prioridad:string, frecuencia:string}[]} urls
 * @returns {string}
 */
export function sitemap(urls) {
  const cuerpo = urls
    .map(
      (u) => `  <url>
    <loc>${SITIO}${u.ruta}</loc>
    <changefreq>${u.frecuencia}</changefreq><priority>${u.prioridad}</priority>
  </url>`
    )
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>${SITIO}/</loc>
    <xhtml:link rel="alternate" hreflang="es" href="${SITIO}/"/>
    <xhtml:link rel="alternate" hreflang="en" href="${SITIO}/en/"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITIO}/"/>
    <changefreq>monthly</changefreq><priority>1.0</priority>
  </url>
  <url>
    <loc>${SITIO}/en/</loc>
    <xhtml:link rel="alternate" hreflang="es" href="${SITIO}/"/>
    <xhtml:link rel="alternate" hreflang="en" href="${SITIO}/en/"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITIO}/"/>
    <changefreq>monthly</changefreq><priority>0.8</priority>
  </url>
${cuerpo}
</urlset>
`;
}

/**
 * Página del diagnóstico. El cálculo lo hace js/fx/diagnostico.js en el
 * navegador; aquí solo va el armazón y el aviso de que no se guarda nada.
 * @returns {string}
 */
export function paginaDiagnostico() {
  const raiz = '../';
  const url = `${SITIO}/diagnostico/`;
  const titulo = 'Diagnóstico: cuánto te cuesta el trabajo repetitivo';
  const descripcion =
    'Cinco preguntas y una estimación de las horas y los euros que se te van al año en tareas que se repiten, y cuánto de eso es automatizable.';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        name: 'Diagnóstico de trabajo repetitivo',
        description: descripcion,
        url,
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        inLanguage: 'es-ES',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
        publisher: { '@type': 'Organization', name: 'VZ Studio', url: `${SITIO}/` },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${SITIO}/` },
          { '@type': 'ListItem', position: 2, name: 'Diagnóstico', item: url },
        ],
      },
    ],
  };

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapar(titulo)} · VZ Studio</title>
<meta name="description" content="${escapar(descripcion)}">
<link rel="canonical" href="${url}">
<meta property="og:title" content="${escapar(titulo)}">
<meta property="og:description" content="${escapar(descripcion)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITIO}/assets/og.jpg">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#14161B">
<link rel="icon" href="${raiz}favicon.svg" type="image/svg+xml">
<link rel="preload" href="${raiz}fonts/generalsans-400.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${raiz}fonts/bricolage-var.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${raiz}css/style.css">
<script type="application/ld+json">
${jsonLdSeguro(jsonLd)}
</script>
</head>
<body class="doc">

${nav(raiz)}

<main>
<section class="diag" id="diag">
  <header class="prosa-head">
    <span class="tag">Diagnóstico</span>
    <h1>${escapar(titulo)}</h1>
    <p class="entradilla">Cinco preguntas, un minuto. Te digo cuántas horas y cuántos euros se te van al año en tareas que se repiten, y qué parte se puede recuperar.</p>
    <p class="prosa-meta">Sin registro · No se guarda nada · El cálculo se hace en tu navegador</p>
  </header>
  <p class="diag-progreso">Pregunta 1 de 5</p>
  <div class="diag-barra"><i></i></div>
  <div class="diag-zona" aria-live="polite">
    <noscript>
      <p class="ayuda">El diagnóstico necesita JavaScript. Si lo tienes desactivado, escríbeme por <a href="https://wa.me/34722736832">WhatsApp</a> y lo calculamos juntos.</p>
    </noscript>
  </div>
</section>
</main>

${pie(raiz)}

<script type="module" src="${raiz}js/fx/diagnostico.js"></script>
</body>
</html>`;
}
