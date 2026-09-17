#!/usr/bin/env node
// Genera las páginas de /casos/ y /guias/ a partir de contenido/**/*.md,
// escribe los dos índices y regenera sitemap.xml.
//
// Sin dependencias y sin build obligatorio: el sitio sigue siendo HTML
// estático que Vercel sirve tal cual. Esto solo se ejecuta cuando cambia el
// contenido, a mano o desde bin/publicar-guia.sh.
//
//   node bin/construir.mjs

import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { partirPortada, aHtml } from '../js/lib/marcado.js';
import { paginaContenido, paginaIndice, paginaDiagnostico, sitemap } from '../js/lib/plantilla.js';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const DOMINIO = 'vzstudio.dev';

const SECCIONES = [
  {
    id: 'casos',
    etiqueta: 'Casos',
    titulo: 'Casos: qué construí y qué cambió',
    descripcion:
      'Trabajos reales en producción: qué problema había, qué se construyó y qué pasó después. Webs, rediseños, bots y automatización.',
    entradilla:
      'Cada uno cuenta el problema de verdad y la solución que se entregó. Sin métricas infladas: si un dato no está medido, no está.',
    prioridad: '0.8',
  },
  {
    id: 'guias',
    etiqueta: 'Guías',
    titulo: 'Guías de automatización e IA para empresas',
    descripcion:
      'Respuestas concretas a lo que preguntan las empresas antes de automatizar: qué cuesta, qué herramienta, qué se puede y qué no.',
    entradilla:
      'Escritas desde lo que me encuentro trabajando, no desde el manual. Si algo no lo he montado, lo digo.',
    prioridad: '0.7',
  },
];

/** Lee una sección entera y devuelve sus entradas ordenadas de nueva a vieja. */
async function leerSeccion(id) {
  const dir = join(RAIZ, 'contenido', id);
  let ficheros = [];
  try {
    ficheros = (await readdir(dir)).filter((f) => f.endsWith('.md'));
  } catch {
    return [];
  }

  const entradas = [];
  for (const f of ficheros) {
    const crudo = await readFile(join(dir, f), 'utf8');
    const { datos, cuerpo } = partirPortada(crudo);
    const slug = datos.slug || f.replace(/\.md$/, '');

    if (!datos.titulo || !datos.descripcion || !datos.fecha) {
      throw new Error(
        `contenido/${id}/${f}: faltan campos obligatorios en la portada (titulo, descripcion, fecha)`
      );
    }

    entradas.push({
      ...datos,
      slug,
      seccion: id,
      html: aHtml(cuerpo, { dominio: DOMINIO }),
      palabras: cuerpo.split(/\s+/).filter(Boolean).length,
    });
  }

  return entradas.sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)));
}

async function escribir(ruta, contenido) {
  await mkdir(dirname(ruta), { recursive: true });
  await writeFile(ruta, contenido, 'utf8');
}

async function main() {
  const urlsSitemap = [];
  let total = 0;

  for (const seccion of SECCIONES) {
    const entradas = await leerSeccion(seccion.id);
    if (!entradas.length) {
      console.log(`· ${seccion.id}: sin contenido, salto`);
      continue;
    }

    for (const e of entradas) {
      const html = paginaContenido(e);
      await escribir(join(RAIZ, seccion.id, e.slug, 'index.html'), html);
      urlsSitemap.push({
        ruta: `/${seccion.id}/${e.slug}/`,
        prioridad: '0.6',
        frecuencia: 'yearly',
      });
      total++;
    }

    const indice = paginaIndice({
      seccion: seccion.id,
      etiqueta: seccion.etiqueta,
      titulo: seccion.titulo,
      descripcion: seccion.descripcion,
      entradilla: seccion.entradilla,
      entradas,
    });
    await escribir(join(RAIZ, seccion.id, 'index.html'), indice);
    urlsSitemap.push({
      ruta: `/${seccion.id}/`,
      prioridad: seccion.prioridad,
      frecuencia: 'weekly',
    });

    console.log(`· ${seccion.id}: ${entradas.length} página(s) + índice`);
  }

  await escribir(join(RAIZ, 'diagnostico', 'index.html'), paginaDiagnostico());
  urlsSitemap.push({ ruta: '/diagnostico/', prioridad: '0.9', frecuencia: 'monthly' });
  console.log('· diagnostico: 1 página');

  await escribir(join(RAIZ, 'sitemap.xml'), sitemap(urlsSitemap));
  console.log(`· sitemap.xml: ${urlsSitemap.length + 2} URLs`);
  console.log(`\nlisto: ${total} páginas de contenido`);
}

main().catch((e) => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
