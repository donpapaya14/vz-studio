# SPEC — SEO: casos, guías, diagnóstico y publicación automática (2026-09-18)

Ampliación de `vzstudio.dev`. Nivel **N2** (hay lógica pura en `js/lib/`: parser de
marcado y calculadora → TDD obligatorio; el pegamento DOM se verifica con capturas,
igual que en `DECISIONES.md` 2026-09-03).

## Por qué

Medido el 17-sep en Search Console, 3 meses: **3 clics, 51 impresiones, 2 consultas**
(`vz studio` y `loyalcapitaladvisors.es` — la segunda ni siquiera es suya, es gente
buscando a su cliente). Lighthouse ya da 97/100/100/100: **lo técnico está en tope y
no es el problema**. El problema es que el sitio son 2 URLs.

Contraste medido el mismo día en `catbrothers.uk`, del mismo dueño: **405 URLs →
18.300 impresiones y 1.000+ consultas** en el mismo periodo. La variable es el número
de páginas que responden a una búsqueda, no la optimización.

Vladys descarta blog personal al uso. Se construye lo que sí acepta: páginas de caso
(portfolio que además posiciona), guías acotadas, y una herramienta que capte.

## Qué se construye

1. **Analítica** — Vercel Analytics. Hoy no hay ninguna medición: no se sabe si las
   visitas de la prospección por correo llegan.
2. **5 páginas de caso** en `/casos/<slug>/` + índice `/casos/`.
3. **8 guías** en `/guias/<slug>/` + índice `/guias/`. Sección **acotada**: índice
   con lista completa, sin paginación ni scroll infinito.
4. **Diagnóstico** en `/diagnostico/`: 5 preguntas → horas/año y € que se pierden →
   CTA a WhatsApp con el resultado.
5. **Publicación automática**: 1 guía/semana con `claude -p` por launchd local, mismo
   patrón que `coach-vladys`. Sin n8n, sin servicios de pago.

## Fuera de alcance

- Chatbot de demo (descartado por Vladys: gasto por uso).
- Blog con feed infinito, paginación, categorías o comentarios.
- Traducir casos y guías a `/en/` (la home en inglés se mantiene como está).
- CMS, framework o build step obligatorio para desplegar.
- Cambiar el copy, la paleta o la estructura de la home.

## Criterios de aceptación

| ID | Criterio | Verificación exacta |
|---|---|---|
| C-1 | Vercel Analytics carga y registra. El script es **same-origin** (`/_vercel/insights/script.js`), así no rompe `script-src 'self'` | `grep -c '_vercel/insights' index.html` = 1; tras desplegar, panel de Vercel con ≥1 visita |
| C-2 | La CSP permite la baliza: `connect-src 'self'` presente. **Sin esto `default-src 'none'` la bloquea** y la analítica no envía nada | `python3 -c "import json;print(json.load(open('vercel.json')))" \| grep -c "connect-src 'self'"` = 1 |
| C-3 | 5 páginas de caso generadas, cada una con `<h1>` único, canonical propio, meta description y JSON-LD `Article`+`BreadcrumbList` | `node bin/verificar.mjs` → 0 errores en bloque CASOS |
| C-4 | 8 guías generadas, mismas garantías que C-3 | `node bin/verificar.mjs` → 0 errores en bloque GUIAS |
| C-5 | Índices `/casos/` y `/guias/` listan **todas** las entradas, sin paginación | `node bin/verificar.mjs` compara nº de `<article>` del índice con nº de ficheros en `contenido/` |
| C-6 | `sitemap.xml` regenerado incluye las 2 URLs actuales + 2 índices + 13 páginas = **17 URLs**, todas con http 200 tras desplegar | `grep -c '<loc>' sitemap.xml` = 17; `node bin/verificar.mjs --http` tras deploy |
| C-7 | Parser de marcado (`js/lib/marcado.js`) con TDD: test rojo antes que código, y cobertura por encima del umbral del repo | `npx vitest run --coverage` verde, líneas ≥80 / ramas ≥75 |
| C-8 | Calculadora del diagnóstico (`js/lib/diagnostico.js`) con TDD + property-based: el resultado nunca es negativo ni NaN para cualquier entrada válida | `npx vitest run` verde con el caso `fc.assert` |
| C-9 | El diagnóstico genera un enlace `wa.me` con el resultado y **sin datos personales en la URL** (solo cifras que el propio visitante ha metido) | Test unitario del generador de enlace + captura del flujo completo |
| C-10 | Publicación automática: `bin/publicar-guia.sh` escribe una guía nueva, la genera y commitea. Idempotente: dos pasadas el mismo día no duplican | Ejecución en seco `DRY_RUN=1 bash bin/publicar-guia.sh` con salida pegada; segunda pasada dice "ya publicada" |
| C-11 | launchd cargado y programado los lunes, con espera de red como el coach | `launchctl list \| grep vz-guias`; `plutil -lint` del plist OK |
| C-12 | Nada roto: consola limpia, Lighthouse móvil ≥90, `/en/` intacta, tests verdes | PageSpeed móvil tras deploy; `npx vitest run`; captura de la home |
| P-1 | Todo el contenido nuevo usa los tokens y clases existentes (`--gr`, `--crema`, `.wrap`, `.shead`, `.tag`) sin CSS duplicado | Revisión del diff de `css/style.css`: solo reglas nuevas para `.prosa`, `.listado` y `.diag` |

## Amenazas

- **Gasto**: cero. Analítica de Vercel en plan gratuito (límite del plan Hobby), sin
  APIs de pago. La publicación semanal usa el plan de Claude de Vladys, ya pagado.
- **Datos personales**: el diagnóstico **no guarda nada**. No hay backend, no hay
  formulario, no hay cookies. El resultado viaja en el enlace `wa.me` que abre el
  propio visitante con su cliente de WhatsApp. Sin RGPD que gestionar.
- **CSP**: se abre `connect-src 'self'`. Es el mínimo para la baliza de analítica;
  no se permite ningún origen externo.
- **Automatización desatendida** (esto la sube de facto a N3 en riesgo operativo):
  un script que commitea y pushea solo puede meter basura en producción. Mitigación:
  la guía se genera en una **rama** `guias/AAAA-MM-DD`, nunca en `master`, y no se
  despliega hasta que Vladys la fusione. Regla no-push respetada.
- **Contenido inventado**: una guía con datos falsos daña más que no publicar. El
  prompt prohíbe cifras sin fuente y obliga a marcar `[PENDIENTE VERIFICAR]`.

## Escalado

Hoy: 17 URLs, sitio estático en CDN de Vercel. A 1 guía/semana son ~70 URLs/año.
Lo primero que rompe: el índice `/guias/` como lista única deja de leerse pasadas
~40 entradas. Plan: agrupar por tema cuando se superen 40, sin paginación. Coste a
10x: **0 €**, sigue siendo estático.

## Stack

| Pieza | Elección | Por qué |
|---|---|---|
| Generación | Node ESM sin dependencias (`bin/construir.mjs`) | El repo ya es vanilla; añadir un SSG obliga a build en Vercel y rompe "editar y desplegar" |
| Marcado | Parser propio mínimo en `js/lib/marcado.js` | 60 líneas cubren lo que se usa; evita meter `marked` y su superficie de ataque en un sitio con CSP estricta |
| Plantilla | Función JS que devuelve el HTML | Sin motor de plantillas; una función pura se testea |
| Automatización | launchd + `claude -p` | Copia exacta del patrón de `coach-vladys`, ya probado en producción |
| Analítica | Vercel Analytics | Ya está en Vercel; script same-origin que no rompe la CSP |
