# 3 conceptos para vzstudio.dev v3

Base común (innegociable, viene de SPEC): oscuro premium, tipografía gigante, Lenis + GSAP, secciones de colores distintos, hero animado propio, cuerpo ≥18px, efectos portados de web-aion (scrub, raíl, revelados, contador). Lo que cambia entre conceptos es la **idea**, la **paleta por sección** y el **hero**.

Referencias consultadas (banco `diseno-webs`): lenis.dev (bloques de color + wordmark canvas), darkroom.engineering (rojo/negro, texto gigante, manifiesto diccionario), basement.studio (scroll larguísimo con canvas fijo), raycast (grano real), web-aion (efectos y CTA magnético), vz-web v2 (canvas por escenas).

---

## 1. BLOQUES — "la web es un sistema, cada sección un módulo"  ← RECOMENDADO

**Posicionamiento:** estudio que monta sistemas. La web se ve como piezas ensambladas: cada sección es un bloque de color sólido, sin gradientes, con transición de fondo interpolada al hacer scroll (patrón lenis.dev). Directo a lo que pediste.

**Paleta por sección**
- Hero + Estudio: grafito `#14161B` (continuidad de marca)
- Automatización: acento **verde señal `#C6FF3D`** con tinta grafito (el bloque que "enciende")
- Rediseño: crema `#E8E3D8` con tinta `#16140F` (antes/después sobre claro, se ven mejor)
- Trabajo: negro puro `#0A0B0E`
- Servicios: gris humo `#2A2D35`
- Contacto: verde señal otra vez, cierre

**Tipografía:** display **Bricolage Grotesque** (opsz 96, pesos 700-800) para titulares de 120-180px que rompen la rejilla; **General Sans** (ya en casa) cuerpo 18-20px; **IBM Plex Mono** etiquetas ≥12px.

**Hero:** wordmark "VZ" gigante dibujado en canvas WebGL con distorsión líquida al mover el ratón (tipo lenis.dev), grano real encima; el h1 semántico vive aparte: "Sistemas que trabajan por ti." Al hacer scroll, el wordmark se encoge y se convierte en el logo del nav (Flip). Se recuerda por: **las letras VZ deformándose bajo el cursor y el fondo cambiando de color a saltos limpios**.

**Movimiento:** cambio de `--s-bg` por sección con ScrollTrigger; titulares por líneas con máscara (SplitText); raíl horizontal en Trabajo; scrub de fotogramas en Automatización (grabación del n8n real, invertida, troceada en webp); contador en Estudio.

**Pros:** literalmente lo que pediste; paleta clara → el detector no lo confunde con plantilla; muy contrastado en capturas para Malt/LinkedIn.
**Contras:** el verde ácido es tendencia (2024-26): en 2 años puede envejecer. Mitigación: el acento vive en 1 token, se cambia en 1 línea.

---

## 2. TALLER — "aquí se fabrica"

**Posicionamiento:** obrador digital. Tono darkroom.engineering: negro + un rojo/naranja industrial `#FF4D1F` + hueso `#EDE8DF`. Menos "diseño", más "ingeniería": manifiesto en formato diccionario ("[ vz ], sust.: 1. … 2. …"), etiquetas mono por todas partes, capturas de n8n como si fueran planos.

**Paleta por sección:** hero negro → Automatización naranja industrial (tinta negra) → Rediseño hueso → Trabajo negro → Servicios naranja → Estudio hueso → Contacto negro.

**Tipografía:** display **Anton** o **Archivo Black** (condensada, brutal, 160px+), cuerpo **General Sans**, mono Plex.

**Hero:** escena canvas propia de un flujo n8n abstracto: nodos que se conectan, paquetes que viajan por las líneas, y el flujo "cobra vida" cuando llega el cursor. Al hacer scroll se hace scrub: los nodos se ordenan hasta formar la palabra VZ. Se recuerda por: **el diagrama vivo que se convierte en el logo**.

**Pros:** el hero cuenta el negocio (automatización) sin decirlo; el rojo/naranja es atemporal.
**Contras:** el diagrama vivo cuesta más de programar (2-3 días de canvas); tono más frío, menos "premium Apple".

---

## 3. ÓRBITA — "el estudio como pieza 3D"

**Posicionamiento:** continuidad con lo que ya funciona en web-aion pero en clave VZ: dark premium, glow ambiental, marca 3D. Paleta: grafito `#14161B`, azul noche `#0B1020`, crema `#E8E3D8`, acento cobre `#D98C4A` (cálido, se separa del azul Aion).

**Paleta por sección:** hero grafito → Automatización azul noche → Rediseño crema → Trabajo grafito → Servicios cobre (tinta oscura) → Estudio azul noche → Contacto crema.

**Tipografía:** display **Instrument Serif itálica + Bricolage bold** en la misma línea (patrón unseen.co: "Sistemas que *trabajan* por ti"), cuerpo General Sans.

**Hero:** el isotipo VZ extruido en three.js desde el SVG del nav (mismo método que la Λ de AION, 0 KB de descarga, no es IA), material metálico cobre, gira con el cursor y se desmonta en piezas al hacer scroll. Glow de 2 orbes detrás (AmbientGlow portado). Se recuerda por: **el VZ metálico que se desarma al bajar**.

**Pros:** reutiliza el código 3D ya escrito (marca3d.ts); look más "caro".
**Contras:** three.js pesa (~150 KB gz) → móvil con fallback a imagen; el "objeto 3D flotando" ya es cliché en 2026 (lo dice STACK-MOTION); se parece demasiado a aionmkt.com, y VZ y AION deben verse como cosas distintas.

---

## Recomendación
**BLOQUES**, con hero de código (0 €). Es lo que has descrito con tus palabras, es el más diferenciado de Aion, y el más barato de mantener. Si quieres el hero más "narrativo", cruzar: BLOQUES con el hero de TALLER (diagrama vivo → VZ).

Decisión de color de acento: propongo verde señal `#C6FF3D`. Alternativas de un solo token: ámbar `#FFB020`, cobre `#D98C4A`, eléctrico `#5B6CFF` (descartado: azul = Aion).
