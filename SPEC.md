# SPEC — Rediseño vzstudio.dev v3 ("web de estudio nivel lenis")

Fecha: 2026-09-03 · Estado: GATE 1 OK (2026-09-03) — concepto BLOQUES, hero canvas + vídeo IA enmascarado, acento #C6FF3D

## Objetivo
Convertir vzstudio.dev en la carta de presentación del estudio: web oscura premium, tipografía gigante, scroll con tacto (Lenis), secciones de colores distintos, hero con animación fuerte y los efectos ya validados en web-aion (scrub de fotogramas, raíl horizontal, revelados, contador, marca 3D). Es el escaparate que ve un cliente cuando Vladys manda su URL desde Malt/Upwork/LinkedIn.

## Usuario y contexto
- Quien entra: dueño de negocio / responsable de marketing que llega desde perfil freelance o LinkedIn. Decide en 20 segundos si la web "está a otro nivel".
- Web actual: HTML estático, grafito+crema, canvas propio por secciones, sin Lenis/GSAP. Correcta pero quieta. 5 casos de rediseño (Costa, Loyal, Comaskeys, Luxury, AION — AION sin commit).
- Bilingüe ES + `/en/` [asumido: se mantiene].

## Fuera de alcance
- Cambiar los servicios ni la estrategia (automatización primero, webs después).
- Blog, CMS, formulario con backend (contacto sigue por enlace directo).
- Páginas nuevas (aviso legal y cookies se retematizan, no se reescriben).
- Vídeos IA generados con créditos, salvo OK explícito en GATE 1.

## Criterios de aceptación

| ID | Criterio | Verificación exacta |
|---|---|---|
| C-1 | Hero con animación propia a pantalla completa (canvas/WebGL, no gif ni vídeo stock), con fallback estático con `prefers-reduced-motion` | Captura 1440x900 + 390x844 con extensión Chrome; `grep -n "prefers-reduced-motion" css/style.css js/*.js` ≥ 1 |
| C-2 | Scroll suave con Lenis sincronizado con GSAP ScrollTrigger, sin doble rAF | `grep -n "lenis.on('scroll', ScrollTrigger.update)" js/app.js`; en consola `window.__lenis` definido; scroll sin tartamudeo en captura de GIF |
| C-3 | ≥4 secciones con color de fondo distinto (bloques sólidos con corte limpio, tokens por `data-bg`); el body interpola `--s-bg` por debajo para nav/overscroll | `grep -c "data-bg=" index.html` ≥ 4; capturas de cada corte con texto legible a ambos lados |
| C-4 | Efectos portados de web-aion: scrub de fotogramas, raíl horizontal, revelados por línea (SplitText), contador de cifras | `ls js/fx/` muestra `scrub.js rail.js revelar.js contar.js`; cada uno usado en index.html (`grep -c`) |
| C-5 | Caso AION completo: antes (póster viejo) + **después = captura de aionmkt.com tal como está hoy en producción** (no prototipo) | `ls assets/aion-new*`; fecha del archivo ≥ 2026-09-03; comparación visual con `https://www.aionmkt.com` en Chrome |
| C-6 | Los 5 casos de rediseño y los proyectos de Trabajo conservan sus assets, vídeos perezosos (`data-src` + IO) | `grep -c 'data-src=' index.html` = nº de `<video>`; Network de Chrome: 0 mp4 descargados en primera pantalla |
| C-7 | Cuerpo de texto ≥18px, ningún `font-size` < 12px en CSS | `grep -nE "font-size:\s*(9|10|11)px" css/style.css` → 0 líneas; `body{font-size:18px}` |
| C-8 | Detector anti-genérico PASA y rúbrica ≥13/16 sin ceros | `bash ~/.claude/skills/diseno-webs/scripts/detector-generico.sh ~/Proyectos/vz-web --bilingue` → PASA; tabla de rúbrica pegada |
| C-9 | CSP estricta se mantiene (`script-src 'self'`): librerías auto-hospedadas en `js/vendor/`, cero CDN, cero inline | `grep -c "cdn\|unpkg\|jsdelivr" index.html` = 0; consola Chrome sin errores CSP |
| C-10 | Rendimiento: Lighthouse móvil Performance ≥ 85, LCP < 2,5 s; peso primera pantalla < 1,5 MB | Lighthouse en Chrome (DevTools panel) sobre `vercel dev` o preview; captura del informe |
| C-11 | Versión `/en/` con la misma estructura y efectos | `diff <(grep -o 'id="[^"]*"' index.html) <(grep -o 'id="[^"]*"' en/index.html)` → solo ids traducidos previstos |
| C-12 | Lógica pura testeada (N2): mapeo scroll→peso de escena, interpolación de colores, cálculo de fotograma del scrub, parser de `data-bg` | `npx vitest run --coverage` verde, cobertura ≥80% líneas / ≥75% ramas en `js/lib/`, con propiedades `fast-check` en `mezclar`, `fotograma` y `elegirResolucion` |

## Criterios de proceso
| ID | Criterio | Verificación |
|---|---|---|
| P-1 | Captura de la web vieja guardada antes de tocar nada | `ls docs/antes/vz-v2-*.png` (desktop + móvil) |
| P-2 | Hero aprobado (Fase 2b) antes de construir el resto | mensaje de OK de Vladys en el hilo; `hero-prototipo.html` en `docs/` |
| P-3 | Concepto LOCKED en `CONCEPTO-<NOMBRE>.md` | archivo existe con paleta/tipo/movimiento cerrados |

## Amenazas (modo arranque `seguridad`)
Sin activos sensibles: solo email/WhatsApp públicos ya presentes en la web actual. No hay backend, formularios ni keys. Riesgo real: relajar la CSP para meter librerías por CDN → mitigación C-9 (vendor local). Segundo riesgo: `three.js` o shaders pesados que hundan LCP en móvil → C-10 y carga diferida en desktop.

## Escalado
- **Carga hoy:** decenas de visitas/día. Estático en Vercel.
- **Límite:** ninguno práctico (CDN). Rompe primero el peso de vídeos si se suben más casos → mantener mp4 < 1,7 MB cada uno y perezosos.
- **Plan a 10x / coste:** nada que hacer. 0 €.

## Nivel de riesgo: N2
Hay JS con lógica (escenas, interpolación, scrub) pero sin dinero, datos personales ni auth. Puertas: TDD en `js/lib/` (funciones puras) con vitest + cobertura ≥80% que rompe el build; el pegamento DOM/canvas (`js/fx/`, `js/bg.js`) se verifica con capturas y consola, excluido de cobertura y anotado en DECISIONES.md.

## Stack (tech-architect, 1 línea por pieza)
- **HTML/CSS/JS vanilla** — landing de marca, sin framework: carga instantánea y control total del CSP (tabla de STACK-MOTION).
- **Lenis 1.x** (self-hosted) — scroll con tacto, es lo que Vladys pide literalmente.
- **GSAP 3.13 + ScrollTrigger + SplitText** (gratis, self-hosted) — scrub, pin, revelados por línea, cambio de fondo por sección.
- **Canvas 2D propio / WebGL mínimo** — hero y atmósfera de marca; `three` solo si el concepto elegido lleva marca 3D (concepto ÓRBITA), cargado diferido en desktop.
- **vitest** — tests de la lógica pura (dev-dependency, no se sirve).
- **Vercel** (cuenta Vladys) — mismo hosting; deploy solo tras GATE 3.

## Supuestos
- [asumido] Se mantienen todas las secciones y el copy actual (retocado, no reescrito): Hero → Automatización → Rediseño → Trabajo → Servicios → Estudio → Contacto.
- [asumido] Bilingüe se mantiene.
- [asumido] Hero animado por código (0 €). Si Vladys quiere vídeo IA, se aprueba gasto en GATE 1.

## Decisiones abiertas (GATE 1)
1. Concepto: BLOQUES / TALLER / ÓRBITA (ver `CONCEPTOS.md`).
2. Hero: código puro (0 €) o vídeo IA Magnific (créditos).
3. Color de acento del estudio (VZ hoy no tiene tercer color).
