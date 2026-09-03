# CONCEPTO LOCKED — BLOQUES (2026-09-03, OK Vladys en GATE 1)

"La web es un sistema, cada sección un módulo." Bloques de color sólido, fondo que se interpola al hacer scroll, tipografía gigante, wordmark VZ vivo en el hero. Desde aquí no se rediseña.

## Tokens (`:root`)
```css
--gr:#14161B;        /* grafito, marca */
--gr2:#0A0B0E;       /* negro, Trabajo */
--humo:#2A2D35;      /* Servicios */
--crema:#E8E3D8;     /* Rediseño, Contacto */
--tinta:#16140F;     /* texto sobre claro */
--verde:#C6FF3D;     /* acento señal: Automatización, CTA, ::selection */
--ink:#ECEEF2; --ink2:#A8AEB9;
```
Cada `<section>` lleva `data-bg="gr|gr2|humo|crema|verde"` y `data-ink="claro|oscuro"`; el `body` interpola `--s-bg` con ScrollTrigger (`scrub:true`) entre bloques. Solo colores planos; ningún gradiente.

## Mapa de bloques
| Sección | Fondo | Tinta | Efecto principal |
|---|---|---|---|
| Hero | grafito | clara | wordmark VZ canvas WebGL + vídeo IA enmascarado, distorsión por cursor, grano |
| Automatización | verde | oscura | scrub de fotogramas (n8n real invertido) + 4 casos con contador |
| Rediseño | crema | oscura | 5 antes/después; vídeos perezosos; AION = captura actual |
| Trabajo | negro | clara | raíl horizontal de proyectos al scroll |
| Servicios | humo | clara | lista gigante con hover inversión |
| Estudio | grafito | clara | foto tratada (duotono grafito/verde) + contador de cifras reales |
| Contacto | verde | oscura | CTA magnético (quickTo), email/WhatsApp mono |

## Tipografía
- Display: **Bricolage Grotesque** (Google Fonts → descargar woff2 y auto-hospedar; opsz 96, wght 700-800). H1 `clamp(64px, 12vw, 180px)`, `letter-spacing:-.04em`, `line-height:.9`.
- Cuerpo: **General Sans** (ya en `fonts/`), 18-20px, `line-height 1.6`.
- Etiquetas: **IBM Plex Mono** 12-13px uppercase, `tracking .08em`. Nunca <12px.
- Sin antetítulos numerados. Titulares rompen la rejilla (sangran del `--w`).

## Hero al detalle
- `<canvas id="vz">` a pantalla completa: wordmark "VZ" rasterizado desde la fuente display a una textura; shader con desplazamiento tipo líquido según posición/velocidad del ratón (uniform `uMouse`, `uVel`); el vídeo IA (`assets/hero-loop.mp4`, <1,5 MB, 1080p→720p, loop con crossfade) se muestra **solo dentro de las letras** (máscara por alfa de la textura del texto); grano procedural encima.
- H1 semántico fuera del canvas: "Sistemas que trabajan por ti." + sub + 2 CTA. Entrada sin tocar `opacity` (solo `y`/`scale`) → LCP inmediato.
- Al hacer scroll el wordmark se encoge y aterriza en el logo del nav (GSAP Flip o escala manual ligada al progreso).
- `prefers-reduced-motion`: canvas fuera, póster estático `assets/hero-poster.webp` dentro de las letras vía `background-clip:text`.
- Móvil: sin WebGL si `devicePixelRatio*ancho` es alto; mismo póster.
- **Se recuerda por:** las letras VZ llenas de vídeo deformándose bajo el cursor, y el fondo cambiando de color en bloques limpios al bajar.

## Movimiento (todo con `gsap.matchMedia` + reduce)
Lenis (1.2 s) ↔ ScrollTrigger sincronizados · fondo interpolado · SplitText por líneas con máscara en h2 · scrub (`js/fx/scrub.js`) · raíl (`js/fx/rail.js`) · revelados (`js/fx/revelar.js`) · contador (`js/fx/contar.js`) · CTA magnético. Nada de "cada letra sube".

## Datos reales
Todos los del sitio actual (casos, proyectos, servicios, contacto). Cifras del bloque Estudio: solo las verificables (nº de casos publicados, años, stack); nada inventado. Caso AION: "después" = captura de aionmkt.com en producción el día del build.

## Vídeo IA (Veo 3 / Sora, ya pagados)
Abstracto, sin texto ni logos, grafito + hilos verde `#C6FF3D` o crema. 3-4 variantes; se elige 1 para el hero y 1 para Estudio/Contacto. Recortar marca de agua, loop por crossfade, `crf 30`, `scale=1280:-2`, `fps 24`.
