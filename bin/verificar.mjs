#!/usr/bin/env node
// Puerta de calidad del contenido generado. Comprueba sobre el HTML ya escrito
// en disco lo que de verdad rompe el SEO si se cuela: h1 duplicado, canonical
// ausente o incoherente, description vacía, JSON-LD inválido, índice que no
// lista todo lo que hay, enlaces internos rotos y scripts en línea (que la CSP
// bloquearía en producción sin avisar en local).
//
//   node bin/verificar.mjs
//
// Sale con código 1 si algo falla, para poder encadenarlo en la automatización.

import { readdir, readFile, stat } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITIO = 'https://vzstudio.dev';
const SECCIONES = ['casos', 'guias'];

const fallos = [];
const avisos = [];

function fallo(donde, que) {
  fallos.push(`${donde}: ${que}`);
}

async function existe(ruta) {
  try {
    await stat(ruta);
    return true;
  } catch {
    return false;
  }
}

/** Comprobaciones comunes a cualquier página generada. */
function revisarPagina(nombre, html, urlEsperada) {
  const h1 = html.match(/<h1[\s>]/g) || [];
  if (h1.length !== 1) fallo(nombre, `${h1.length} etiquetas h1, debe haber exactamente 1`);

  const canonical = /<link rel="canonical" href="([^"]+)">/.exec(html);
  if (!canonical) fallo(nombre, 'sin canonical');
  else if (canonical[1] !== urlEsperada)
    fallo(nombre, `canonical ${canonical[1]} ≠ esperado ${urlEsperada}`);

  const desc = /<meta name="description" content="([^"]*)">/.exec(html);
  if (!desc) fallo(nombre, 'sin meta description');
  else if (desc[1].trim().length < 50)
    fallo(nombre, `description de ${desc[1].trim().length} caracteres, mínimo 50`);
  else if (desc[1].length > 175) avisos.push(`${nombre}: description de ${desc[1].length} caracteres (Google corta ~160)`);

  const titulo = /<title>([^<]*)<\/title>/.exec(html);
  if (!titulo || !titulo[1].trim()) fallo(nombre, 'sin title');
  else if (titulo[1].length > 70) avisos.push(`${nombre}: title de ${titulo[1].length} caracteres`);

  // JSON-LD: tiene que parsear. Un bloque roto lo ignora Google en silencio.
  const bloques = [...html.matchAll(/<script type="application\/ld\+json">\n([\s\S]*?)\n<\/script>/g)];
  if (!bloques.length) fallo(nombre, 'sin JSON-LD');
  for (const b of bloques) {
    try {
      JSON.parse(b[1]);
    } catch (e) {
      fallo(nombre, `JSON-LD inválido: ${e.message}`);
    }
  }

  // La CSP del sitio es script-src 'self': un script en línea no se ejecuta
  // en producción aunque funcione al abrir el archivo en local.
  for (const s of html.matchAll(/<script([^>]*)>/g)) {
    const attrs = s[1];
    const esExterno = /\ssrc=/.test(attrs);
    const esDatos = /type="application\/ld\+json"/.test(attrs);
    if (!esExterno && !esDatos) fallo(nombre, 'script en línea: la CSP lo bloquearía');
  }

  if (/style="/.test(html)) avisos.push(`${nombre}: estilos en línea`);
}

/** Enlaces relativos internos que apuntan a un archivo que no existe. */
async function revisarEnlaces(nombre, html, dirPagina) {
  const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
  for (const h of hrefs) {
    if (/^(https?:|mailto:|tel:|#|\/)/.test(h)) continue;
    const limpio = h.split('#')[0].split('?')[0]; // ?v= es versionado de caché, no ruta
    if (!limpio) continue;
    const destino = limpio.endsWith('/') ? join(dirPagina, limpio, 'index.html') : join(dirPagina, limpio);
    if (!(await existe(destino))) fallo(nombre, `enlace roto → ${h}`);
  }
}

async function main() {
  for (const seccion of SECCIONES) {
    const dirSeccion = join(RAIZ, seccion);
    const dirFuente = join(RAIZ, 'contenido', seccion);

    const fuentes = (await readdir(dirFuente)).filter((f) => f.endsWith('.md'));
    const generadas = (await readdir(dirSeccion, { withFileTypes: true }))
      .filter((d) => d.isDirectory())
      .map((d) => d.name);

    if (generadas.length !== fuentes.length) {
      fallo(
        seccion,
        `${fuentes.length} ficheros en contenido/ pero ${generadas.length} páginas generadas: falta ejecutar bin/construir.mjs`
      );
    }

    // índice
    const indice = await readFile(join(dirSeccion, 'index.html'), 'utf8');
    revisarPagina(`${seccion}/index.html`, indice, `${SITIO}/${seccion}/`);
    await revisarEnlaces(`${seccion}/index.html`, indice, dirSeccion);

    const listados = (indice.match(/class="item"/g) || []).length;
    if (listados !== generadas.length)
      fallo(`${seccion}/index.html`, `lista ${listados} entradas pero hay ${generadas.length} páginas`);

    for (const slug of generadas) {
      const ruta = join(dirSeccion, slug, 'index.html');
      if (!(await existe(ruta))) {
        fallo(`${seccion}/${slug}`, 'sin index.html');
        continue;
      }
      const html = await readFile(ruta, 'utf8');
      const nombre = `${seccion}/${slug}/index.html`;
      revisarPagina(nombre, html, `${SITIO}/${seccion}/${slug}/`);
      await revisarEnlaces(nombre, html, join(dirSeccion, slug));

      // un artículo demasiado corto no posiciona; mejor saberlo antes de publicar
      const palabras = html.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
      if (palabras < 400) avisos.push(`${nombre}: solo ~${palabras} palabras`);
    }
  }

  // diagnóstico
  const diag = join(RAIZ, 'diagnostico', 'index.html');
  if (!(await existe(diag))) fallo('diagnostico', 'sin index.html');
  else {
    const html = await readFile(diag, 'utf8');
    revisarPagina('diagnostico/index.html', html, `${SITIO}/diagnostico/`);
    await revisarEnlaces('diagnostico/index.html', html, join(RAIZ, 'diagnostico'));
    if (!/js\/fx\/diagnostico\.js/.test(html)) fallo('diagnostico/index.html', 'no carga su módulo');
  }

  // sitemap: toda página generada tiene que estar dentro
  const sitemap = await readFile(join(RAIZ, 'sitemap.xml'), 'utf8');
  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  for (const seccion of SECCIONES) {
    const generadas = (await readdir(join(RAIZ, seccion), { withFileTypes: true }))
      .filter((d) => d.isDirectory())
      .map((d) => d.name);
    for (const slug of generadas) {
      const url = `${SITIO}/${seccion}/${slug}/`;
      if (!locs.includes(url)) fallo('sitemap.xml', `falta ${url}`);
    }
    if (!locs.includes(`${SITIO}/${seccion}/`)) fallo('sitemap.xml', `falta ${SITIO}/${seccion}/`);
  }
  if (!locs.includes(`${SITIO}/diagnostico/`)) fallo('sitemap.xml', `falta ${SITIO}/diagnostico/`);
  if (new Set(locs).size !== locs.length) fallo('sitemap.xml', 'hay URLs duplicadas');

  console.log(`URLs en sitemap: ${locs.length}`);
  for (const a of avisos) console.log(`  aviso · ${a}`);

  if (fallos.length) {
    console.error(`\n${fallos.length} FALLO(S):`);
    for (const f of fallos) console.error(`  ✗ ${f}`);
    process.exit(1);
  }
  console.log('\n✓ verificación correcta');
}

main().catch((e) => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
