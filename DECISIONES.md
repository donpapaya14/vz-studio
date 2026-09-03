# DECISIONES — vzstudio.dev v3

| Fecha | Decisión | Por qué | Reversible |
|---|---|---|---|
| 2026-09-03 | Stack vanilla + Lenis + GSAP self-hosted, sin framework | Landing de marca; CSP `script-src 'self'` se mantiene; tabla STACK-MOTION | sí |
| 2026-09-03 | Nivel N2: TDD solo en `js/lib/` (funciones puras); `js/fx/` y `js/bg.js` se verifican con capturas + consola | El pegamento canvas/DOM no se testea con jsdom sin fingir; la lógica que puede fallar (interpolación, escenas, frame del scrub) sí | sí |
| 2026-09-03 | Se mantienen secciones, copy base y `/en/` | Nadie ha pedido cambiar la oferta; el rediseño es visual y de motion | sí |
| 2026-09-03 | "Después" del caso AION = captura de aionmkt.com en producción hoy, no el prototipo SEÑAL | Vladys: "falta el después del diseño de aion, la imagen actual"; el mp4 actual sale del prototipo, no de lo publicado | sí |
| 2026-09-03 | Hero por código (0 €) salvo OK de gasto en GATE 1 | Regla coste cero | sí |
| 2026-09-03 | GATE 1 OK: concepto BLOQUES, acento verde señal `#C6FF3D`, hero = wordmark canvas + vídeo IA (Veo 3 / Sora, suscripciones ya pagadas) enmascarado dentro de las letras | Elección de Vladys; vídeo IA solo como textura, nunca hero a pantalla completa (LCP + look stock) | sí |
| 2026-09-03 | Bricolage Grotesque como archivo variable único `fonts/bricolage-var.woff2` (`font-weight:700 800`) | Google sirvió la misma URL para 700 y 800; un archivo menos | sí |
| 2026-09-03 | Marca de agua de Veo eliminada con `delogo` (no con `crop`) | Mantiene 16:9 y 9:16 exactos; sobre textura oscura no se nota | sí |
| 2026-09-03 | Fotogramas del scrub salen del mismo clip horizontal del hero (72 frames a 8 fps) | Un solo clip aprobado; el segundo clip es la versión vertical, no otro motivo | sí |
| 2026-09-03 | Hero: `<source media>` sustituido por elección de src en JS; wordmark al 70% y `cy 0.53` en desktop; máscara con blur 1px | `<source media>` no se respeta en `<video>`; el VZ al 78% pisaba el nav; el borde de la máscara salía dentado | sí |
| 2026-09-03 | "Después" AION = secuencia de 11 capturas reales de aionmkt.com (1440px) con fundidos xfade, 11,5 s, 768 KB | aionmkt.com en producción ya es el rediseño SEÑAL; el GIF de la extensión da 12 frames (a tirones) y el mp4 anterior era del prototipo | sí |
| 2026-09-03 | Verde `#C6FF3D` solo como acento (CTA, `.hl`, etiquetas), nunca como fondo de bloque; Automatización → negro, Contacto → crema; `.hl` sobre claro = verde oscuro `#4E6B00` | Vladys: "sobre todo el color ese amarillo saturado"; el verde de fondo mataba la legibilidad | sí |
| 2026-09-03 | Cada sección pinta su propio fondo (corte limpio tipo lenis.dev); la interpolación del body queda solo bajo el nav | Con el fondo interpolado la cabecera de cada sección se leía sobre el color de la anterior con la tinta equivocada | sí |
