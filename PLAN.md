# PLAN — vzstudio.dev v3 (BLOQUES)

Contra `SPEC.md` (GATE 1 OK) y `CONCEPTO-BLOQUES.md`. Estado: pendiente GATE 2.

## Objetivo
Rehacer capa visual y de motion de vzstudio.dev (ES + EN) con bloques de color, Lenis + GSAP, hero WebGL con vídeo IA enmascarado y los efectos de web-aion, sin tocar oferta ni copy base, con CSP intacta y coste 0.

## Fuera de alcance
Copy nuevo, secciones nuevas, backend/formularios, páginas legales más allá de heredar tokens, three.js, cualquier CDN, deploy (GATE 3).

## Versiones verificadas (npm view, 2026-09-03)
lenis 1.3.26 · gsap 3.15.0 (ScrollTrigger, SplitText, Flip incluidos) · vitest **4.1.11** (pineado: la 5.0.0 rompe herramientas en silencio, ver memoria) · fast-check última · node 24.12 · ffmpeg 8.1 en `/opt/homebrew/bin`.

## Quién ejecuta
- **Yo (fable)**: pasos con Chrome (0, 3b, 7, 9), procesado de vídeo (4), gates.
- **Ejecutores `model: sonnet`** con CONTRATO-EJECUTOR: pasos 1, 2, 3a, 5, 6, 8.
- Paralelizable: 0 ∥ 1; tras 1: 2 ∥ 3a; tras hero OK: 5 → 6 → 8; 7 en cualquier momento tras 0.

---

## Pasos

### Paso 0: Captura de la web vieja (P-1)
- **Archivo:** `docs/antes/vz-v2-desktop.png`, `docs/antes/vz-v2-mobile.png`, `docs/antes/bg.js` (copia del canvas viejo, vale para el caso de estudio).
- **Cambio:** extensión Chrome sobre `https://vzstudio.dev` a 1440x900 y 390x844 con `save_to_disk`; `cp js/bg.js docs/antes/`.
- **Verificación:** `ls docs/antes/` muestra 3 archivos.
- **Cierra:** P-1.

### Paso 1: Esqueleto de herramientas y vendor
- **Archivos:** `package.json`, `vitest.config.js`, `.gitignore` (+`node_modules`), `js/vendor/{lenis.min.js,gsap.min.js,ScrollTrigger.min.js,SplitText.min.js,Flip.min.js}`, `fonts/bricolage-{700,800}.woff2`, `css/style.css` (solo `@font-face` nuevos).
- **Cambio:** `npm init -y`; `npm i -D vitest@4.1.11 @vitest/coverage-v8@4.1.11 fast-check`; `npm i lenis@1.3.26 gsap@3.15.0`; copiar `node_modules/lenis/dist/lenis.min.js` y `node_modules/gsap/dist/{gsap,ScrollTrigger,SplitText,Flip}.min.js` a `js/vendor/` (sin modificar). `vitest.config.js`: `test.include ['js/lib/**/*.test.js']`, `coverage.include ['js/lib/**']`, `thresholds {lines:80, branches:75}` (rompe el run). Scripts: `"test":"vitest run --coverage"`, `"vendor":"cp ..."`. Bricolage: descargar CSS de `https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&display=swap` con UA de Chrome, extraer URLs woff2 latin, `curl` a `fonts/`, declarar `@font-face` con `font-display:swap`.
- **Verificación:** `ls js/vendor | wc -l` = 5; `npx vitest run` → "no test files" sin error de config; `ls fonts/bricolage-*` = 2; `grep -c "Bricolage" css/style.css` ≥ 2.
- **Cierra:** C-9 (vendor local), base de C-12.

### Paso 2: Lógica pura con TDD (`js/lib/`)
- **Archivos:** `js/lib/color.js` (+`.test.js`), `js/lib/bloques.js`, `js/lib/scrub.js`, `js/lib/util.js` y sus tests.
- **Cambio (API exacta, ESM):**
  - `color.js`: `hexARgb('#C6FF3D')→[198,255,61]`, `rgbAHex`, `mezclar(hexA, hexB, t)` con `t` clampeado 0-1.
  - `bloques.js`: `estadoBloques(rects, alturaViewport)` donde `rects=[{top,height,bg,ink}]` en coordenadas de viewport → `{bg:'#hex', ink:'claro|oscuro', t, siguiente}`; regla: el bloque activo es el que cubre el punto `alturaViewport*0.5`; `t` = progreso del cambio en los últimos 30% del bloque; `parseBg('verde')` mapea nombre→hex desde una tabla exportada `TOKENS`; nombre desconocido → grafito.
  - `scrub.js`: `fotograma(progreso, n)` → `{i, frac}` con `i∈[0,n-1]`, `frac∈[0,1)`; `elegirResolucion(pxReales, lista)` → el menor ≥ px, si ninguno el mayor; `tramo(progreso, inicio, fin)` reescala.
  - `util.js`: `clamp`, `lerp`, `easeOutCubic`, `cifraTexto(v, {prefijo,sufijo,decimales})` (port de `contarCifra` de web-aion, solo el formateo).
  - TDD: test ROJO → código → VERDE por función. Property-based con fast-check: `mezclar(a,b,0)=a`, `mezclar(a,b,1)=b`, `fotograma` siempre en rango para cualquier `progreso∈ℝ` y `n≥1`, `elegirResolucion` devuelve elemento de la lista.
- **Verificación:** `npx vitest run --coverage` → todo verde, líneas ≥80 / ramas ≥75 en `js/lib/`. Pegar ROJA y VERDE en el reporte.
- **Cierra:** C-12.

### Paso 3a: Prototipo del hero (autocontenido)
- **Archivo:** `docs/hero-prototipo.html` (un solo archivo, fuentes por ruta relativa `../fonts/`, sin vendor: WebGL puro).
- **Cambio:** `<canvas id="vz">` full-viewport. Programa WebGL: quad; textura A = wordmark "VZ" rasterizado con `Bricolage 800` en un canvas 2D offscreen (alfa = máscara); textura B = `<video>` (`assets/hero-loop.mp4` si existe, si no `assets/costa-new.mp4` como **placeholder marcado**); fragment shader: `uv` desplazado por `uMouse`/`uVel` con ruido simplex 2D (inline, ~40 líneas) para el efecto líquido (amplitud ≤ 0.03), `color = mix(fondo, video, mascara)`, grano `fract(sin(dot(uv*t)))` al 4%. DPR ≤ 1.6, pausa con `visibilitychange`, `pointer-events:none`. `prefers-reduced-motion` o sin WebGL → `<h1 class="vz-static">VZ</h1>` con `background:url(poster) center/cover; -webkit-background-clip:text`. Encima: `.tag` mono, `h1` "Sistemas que trabajan por ti.", sub 20px, 2 CTA (`.btn` verde sólido + fantasma), `.meta` mono. Tokens de `CONCEPTO-BLOQUES.md` en `:root`.
- **Verificación:** abre en Chrome sin errores de consola; FPS ≥ 50 en desktop (`requestAnimationFrame` contador en consola durante 3 s); con `Emulate prefers-reduced-motion` se ve el fallback.
- **Cierra:** C-1 (parte), P-2 (prepara).

### Paso 3b: Gate de hero (yo)
- Captura 1440x900 + 390x844 del prototipo, rúbrica sobre el hero, mensaje a Vladys → **OK explícito** o iteración.
- **Cierra:** P-2.

### Paso 4: Vídeo IA → assets (yo, tras recibir clips de Vladys)
- **Archivos:** `assets/hero-loop.mp4`, `assets/hero-poster.webp`, `assets/scrub/1280/f_001..f_NNN.webp` (+ `640/`), `docs/VIDEO.md` (receta).
- **Cambio:** por clip: `ffprobe`; `crop` si hay marca de agua; loop: `ffmpeg -i a.mp4 -filter_complex "[0]split[a][b];[a]trim=0:7,setpts=PTS-STARTPTS[a1];[b]trim=7:8,setpts=PTS-STARTPTS[b1];[a1][b1]xfade=transition=fade:duration=1:offset=6"` (ajustar a duración real); encode `-vf scale=1280:-2,fps=24 -c:v libx264 -crf 30 -an -movflags +faststart`; póster `-frames:v 1` → `cwebp -q 82`. Scrub: clip 2 → `fps=12,scale=1280:-2` → webp q80 numerados; misma pasada a 640.
- **Verificación:** `du -h assets/hero-loop.mp4` < 1,5 MB; `ls assets/scrub/1280 | wc -l` = N documentado; reproducción en Chrome sin corte visible en el loop.
- **Cierra:** C-1 (textura real), C-4 (fotogramas para scrub), C-10 (peso).

### Paso 5: CSS de bloques y tipografía
- **Archivo:** `css/style.css` (reescritura por secciones, se conservan `.frame`, `.bview`, `.phone`, `.case`, `.case.wide`, `.flowshot`, `.btn`, `.tag`, `.nav`, `.masthead`, `.footer`).
- **Cambio:** tokens del concepto en `:root` + `--s-bg`/`--s-ink` (los pone JS); `body{background:var(--s-bg);color:var(--s-ink);font-size:18px;transition:none}`; `section[data-ink="oscuro"]` cambia `--ink/--ink2/--line` a valores sobre claro; quitar `.opaque`, `.veil` y `#bg`; `h1{font-size:clamp(64px,12vw,180px);line-height:.9;letter-spacing:-.04em;font-family:var(--display)}`, `h2{clamp(40px,7vw,112px)}`, h3 28px; `.tag` 12.5px mono; `.rail` (Trabajo): `section{height:auto}` + `.rail{display:flex;gap:32px;will-change:transform}`; `.scrub-wrap{position:sticky;top:0;height:100vh}` en Automatización; `::selection{background:var(--verde);color:var(--tinta)}`; `@media(prefers-reduced-motion)` fija estados finales. Borrar todo `font-size` < 12px.
- **Verificación:** `grep -nE "font-size:\s*(9|10|11)(\.[0-9])?px" css/style.css` → 0; `grep -c "data-bg" index.html` (tras paso 6) ≥ 4; `bash ~/.claude/skills/diseno-webs/scripts/detector-generico.sh . --bilingue` → sin hallazgos en CSS.
- **Cierra:** C-3 (tokens), C-7.

### Paso 6: HTML + `js/app.js` + `js/fx/*`
- **Archivos:** `index.html`, `js/app.js` (reescrito), `js/fx/{bloques,hero,scrub,rail,revelar,contar,magnetico}.js`, `js/hero.js` (del prototipo, sin tocar shader), borrar `js/bg.js` (queda en `docs/antes/`).
- **Cambio:**
  - `index.html`: cada `<section>` recibe `data-bg` y `data-ink` según la tabla del concepto; hero = markup del prototipo; Automatización: `<div class="scrub-wrap"><canvas class="scrub" data-carpeta="assets/scrub" data-n="N" data-res="640,1280"></canvas></div>` + los 4 casos con `data-hasta` en cifras reales existentes; Trabajo: proyectos dentro de `<div class="rail">`; Estudio: cifras reales (`5` casos de rediseño, `7` proyectos, `2` idiomas — comprobar contra el HTML); scripts al final en orden: vendor (5) → `js/hero.js` → `js/app.js` (`type="module"` para importar `js/lib` y `js/fx`). Vídeos conservan `data-src`.
  - `js/app.js`: `gsap.registerPlugin(ScrollTrigger, SplitText, Flip)`; Lenis `{duration:1.2, smoothWheel:true}`; `lenis.on('scroll', ScrollTrigger.update)`; `gsap.ticker.add(t=>lenis.raf(t*1000))`; `gsap.ticker.lagSmoothing(0)`; `window.__lenis = lenis`; `gsap.matchMedia()` con `reduce` → estados finales y `return`; monta cada fx; nav `scrolled`; lazy vídeos (se conserva).
  - `js/fx/bloques.js`: lee `section[data-bg]`, en cada `ScrollTrigger` con `scrub:true` interpola `--s-bg`/`--s-ink` con `mezclar` de `js/lib/color.js` y `estadoBloques`.
  - `js/fx/scrub.js`: port literal de `montarScrub` (web-aion) a JS vanilla usando `fotograma`/`elegirResolucion` de `js/lib/scrub.js`, `mezcla:true`.
  - `js/fx/rail.js`: port de `montarRail` con ScrollTrigger `pin:true, scrub:1, end: () => '+=' + (rail.scrollWidth - innerWidth)`.
  - `js/fx/revelar.js`: `SplitText` por `lines` con máscara (`mask:'lines'`) en `h2`, `y:'100%'` → 0, `stagger:.08`; `.rv` con `ScrollTrigger` `once:true`.
  - `js/fx/contar.js`: port de `contarCifra` usando `cifraTexto`.
  - `js/fx/magnetico.js`: `gsap.quickTo` x/y en `.btn-solid` del hero y Contacto, radio 50px, solo `(hover:hover)`.
- **Verificación:** consola Chrome sin errores ni avisos CSP; `window.__lenis` definido; `grep -c 'data-src=' index.html` = `grep -c '<video' index.html`; `ls js/fx | wc -l` = 7; captura a mitad de scroll con color intermedio; GIF de 5 s de scroll con `gif_creator`.
- **Cierra:** C-2, C-3, C-4, C-6, C-9.

### Paso 7: Caso AION — "después" real (yo)
- **Archivos:** `assets/aion-new.mp4`, `assets/aion-new-poster.{webp,jpg}` (sobrescribe los del prototipo), `assets/aion-old.*` se mantienen.
- **Cambio:** extensión Chrome sobre `https://www.aionmkt.com` a 1440x900: `gif_creator` grabando ~12 s de scroll suave (start → 6 scrolls → stop) → `ffmpeg -i aion.gif -vf "scale=1152:-2,fps=24" -c:v libx264 -crf 30 -pix_fmt yuv420p -movflags +faststart assets/aion-new.mp4`; póster = screenshot a 1440 → `cwebp -q 82` + jpg. Si el GIF sale a tirones: 8 screenshots a distintos `scrollY` + `ffmpeg -framerate` con `zoompan` (scroll simulado). Copy de la tarjeta AION en Trabajo se ajusta a lo que se vea en producción hoy (sin inventar).
- **Verificación:** `stat -f %Sm assets/aion-new.mp4` fecha de hoy; abrir la web local y comparar con aionmkt.com en dos pestañas.
- **Cierra:** C-5.

### Paso 8: Versión `/en/`
- **Archivo:** `en/index.html`.
- **Cambio:** misma estructura/atributos/scripts que `index.html` (rutas `../`), copy inglés existente + hero nuevo traducido ("Systems that work for you."), `hreflang` intactos.
- **Verificación:** `diff <(grep -o 'id="[^"]*"' index.html) <(grep -o 'id="[^"]*"' en/index.html)` → solo los ids traducidos ya previstos (`#redesign`, `#work`, `#services`, `#about`, `#contact`, `#automation`); `diff <(grep -o 'data-bg="[^"]*"' index.html) <(grep -o 'data-bg="[^"]*"' en/index.html)` vacío.
- **Cierra:** C-11.

### Paso 9: QA y verificación final (yo)
- Detector (`--bilingue`) → PASA; rúbrica ≥13/16 sin ceros con capturas desktop+móvil de la web entera; Lighthouse móvil en Chrome sobre `npx serve .` (o `vercel dev`) → Performance ≥85, LCP <2,5 s; Network: 0 mp4 en primera pantalla; `npx vitest run --coverage` verde; `vercel.json` sin cambios (`git diff vercel.json` vacío). Reporte VERIFICADO / ABIERTO / SIN COMPROBAR criterio a criterio.
- **Cierra:** C-8, C-10 y revalida C-1..C-12.

### Paso 10: GATE 3
- Commit local con mensaje, `vercel --prebuilt`/push **solo tras OK de Vladys**. Actualizar memoria `project_vz_web` y ficha `referencias/fichas/vz-web.md`.

---

## Riesgos
- **SplitText/`mask:'lines'` con `Bricolage` variable**: si las líneas se recalculan mal al redimensionar → `SplitText.create(..., {autoSplit:true})`; detección: titular cortado en la captura móvil.
- **Vídeo enmascarado en iOS**: `<video>` como textura WebGL exige `playsinline muted autoplay`; si Safari bloquea → fallback póster (ya previsto). Detección: probar en simulador iOS o con UA de Safari.
- **Lenis + `position:sticky`** (scrub-wrap): funciona; con `pin` de ScrollTrigger usar `pinType:'transform'` no hace falta porque Lenis no transforma el body. Detección: salto al entrar en Trabajo.
- **Marca de agua de Veo/Sora**: recorte deja aspecto distinto de 16:9 → `scale`+`crop` a 16:9 exacto. Detección: `ffprobe`.
- **LCP con vídeo en hero**: el vídeo NO es el LCP (h1 sí); `preload="metadata"`. Detección: Lighthouse.
- **Detector marca `.card`**: el HTML actual no usa `.card`; mantenerlo así.

## Verificación final
Paso 9 completo + tabla de rúbrica + capturas + salida de `vitest` y del detector pegadas en el mensaje de GATE 3.

## Cobertura de criterios
| Criterio | Paso(s) |
|---|---|
| C-1 | 3a, 3b, 4 |
| C-2 | 6 |
| C-3 | 5, 6 |
| C-4 | 4, 6 |
| C-5 | 7 |
| C-6 | 6 |
| C-7 | 5 |
| C-8 | 9 |
| C-9 | 1, 6 |
| C-10 | 4, 9 |
| C-11 | 8 |
| C-12 | 1, 2 |
| P-1 | 0 |
| P-2 | 3a, 3b |
| P-3 | hecho (`CONCEPTO-BLOQUES.md`) |
