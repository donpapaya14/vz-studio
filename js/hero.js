// Hero WebGL — wordmark "VZ" como máscara de un vídeo, con distorsión
// líquida por cursor. Port literal del shader aprobado en
// docs/hero-prototipo.html (Fase 2b, OK de Vladys), como módulo.
//
// Diferencias respecto al prototipo:
//  - cyNorm en móvil es 0.30 (no 0.36): a partir de 700px de ancho la copy
//    y el wordmark se pisaban con el valor original.
//  - móvil / sin WebGL: ruta sin shader (ver usarMovil), vídeo real recortado
//    con una máscara SVG del texto "VZ" — quita canvas y vídeo del shader.
//  - uScale por scroll se mantiene igual que en el prototipo.

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main(){
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

// simplex 2D (Ashima Arts), dominio público — ruido para el desplazamiento líquido
const FRAG = `
precision mediump float;
varying vec2 vUv;
uniform float uTime;
uniform vec2  uMouse;
uniform float uVel;
uniform float uScale;
uniform float uCenterY;
uniform float uAspectVideo;
uniform float uAspectCanvas;
uniform sampler2D uMask;
uniform sampler2D uVideo;

vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec2 mod289(vec2 x){return x-floor(x*(1.0/289.0))*289.0;}
vec3 permute(vec3 x){return mod289(((x*34.0)+1.0)*x);}
float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                      -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
         + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy),
                            dot(x12.zw, x12.zw)), 0.0);
  m = m * m; m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

// ajuste 'cover' del uv del vídeo según relación de aspecto
vec2 cubrir(vec2 uv, float aspectCanvas, float aspectVideo){
  vec2 r = uv;
  if (aspectCanvas > aspectVideo) {
    float s = aspectVideo / aspectCanvas;
    r.y = (r.y - 0.5) * s + 0.5;
  } else {
    float s = aspectCanvas / aspectVideo;
    r.x = (r.x - 0.5) * s + 0.5;
  }
  return r;
}

void main(){
  vec2 centro = vec2(0.5, uCenterY);
  // uScale < 1 al bajar el scroll: dividir agranda el área muestreada = las letras encogen
  vec2 uvEscalada = centro + (vUv - centro) / uScale;

  float d = smoothstep(0.35, 0.0, distance(vUv, uMouse));
  vec2 desp = vec2(
    snoise(vUv * 3.0 + uTime * 0.15),
    snoise(vUv * 3.0 - uTime * 0.12)
  ) * (0.006 + 0.03 * d * uVel);

  vec2 maskUv = uvEscalada + desp;
  vec2 uvVideo = cubrir(vUv, uAspectCanvas, uAspectVideo) + desp * 0.5;

  float m = texture2D(uMask, maskUv).a;

  vec3 fondo = vec3(0.078, 0.086, 0.106);
  vec3 vid = texture2D(uVideo, uvVideo).rgb;
  vid = mix(vid, vid * vec3(0.85, 1.0, 0.8), 0.25);

  vec3 col = mix(fondo, vid, m);

  float borde = smoothstep(0.0, 0.02, m) - smoothstep(0.02, 0.06, m);
  col += vec3(0.776, 1.0, 0.239) * borde * 0.35;

  col += (fract(sin(dot(gl_FragCoord.xy + uTime * 60.0, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) * 0.045;
  col *= 1.0 - 0.35 * smoothstep(0.55, 1.0, distance(vUv, vec2(0.5)));

  gl_FragColor = vec4(col, 1.0);
}
`;

/**
 * Monta el hero WebGL sobre una sección con #vz / #vz-src dentro.
 * @param {HTMLElement} hero sección .hero con id="top"
 */
export function montarHero(hero) {
  const canvas = hero.querySelector('#vz');
  const video = hero.querySelector('#vz-src');
  const vzStatic = hero.querySelector('.vz-static');
  const heroCopy = hero.querySelector('.hero-copy');
  const vzMovil = hero.querySelector('.vz-movil');
  const vzMovilVideo = vzMovil ? vzMovil.querySelector('.vz-movil-video') : null;
  if (!canvas || !video || !vzStatic || !heroCopy) return;

  const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // sin gancho de ratón real (táctil/trackpad sin hover): el shader "respira" solo
  const conHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  // móvil o sin puntero fino: ruta sin WebGL (más ligera, y evita el shader que
  // Chrome Android no arranca bien con un <video> 1px/opacity:0 como textura)
  const esMovil = window.matchMedia('(max-width: 700px)').matches
    || window.matchMedia('(hover: none)').matches;

  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const lerp = (a, b, t) => a + (b - a) * t;

  // reduced-motion o markup incompleto: nada de canvas/vídeo, solo el póster recortado en texto
  function usarFallback() {
    canvas.remove();
    video.remove();
    if (vzMovil) vzMovil.remove();
    vzStatic.style.display = 'block';
  }

  // ruta móvil: vídeo real dentro de las letras "VZ" recortadas con una máscara SVG
  function usarMovil() {
    canvas.remove();
    video.remove();
    if (!vzMovil || !vzMovilVideo) { usarFallback(); return; }

    const activar = () => document.documentElement.classList.add('hero-movil');
    // espera la fuente real: si no, el SVG mediría/pintaría con la fallback y saldría mal
    document.fonts.load('800 100px "Bricolage Grotesque"').then(activar).catch(activar);

    const asignarSrc = () => {
      vzMovilVideo.src = new URL('../assets/hero-loop-v.mp4', import.meta.url).href;
      vzMovilVideo.play().catch(() => {});
    };
    if (document.readyState === 'complete') asignarSrc();
    else window.addEventListener('load', asignarSrc, { once: true });
    vzMovilVideo.addEventListener('canplay', () => vzMovilVideo.play().catch(() => {}), { once: true });
    window.addEventListener('touchstart', () => vzMovilVideo.play().catch(() => {}), { once: true, passive: true });
  }

  if (reducido) { usarFallback(); return; }
  if (esMovil) { usarMovil(); return; }

  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) {
    usarMovil();
    return;
  }

  function compilar(tipo, fuente) {
    const s = gl.createShader(tipo);
    gl.shaderSource(s, fuente);
    gl.compileShader(s);
    return s;
  }

  const vs = compilar(gl.VERTEX_SHADER, VERT);
  const fs = compilar(gl.FRAGMENT_SHADER, FRAG);
  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);

  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { usarFallback(); return; }
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, 'aPos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const uTime = gl.getUniformLocation(prog, 'uTime');
  const uMouse = gl.getUniformLocation(prog, 'uMouse');
  const uVel = gl.getUniformLocation(prog, 'uVel');
  const uScale = gl.getUniformLocation(prog, 'uScale');
  const uCenterY = gl.getUniformLocation(prog, 'uCenterY');
  const uAspectVideo = gl.getUniformLocation(prog, 'uAspectVideo');
  const uAspectCanvas = gl.getUniformLocation(prog, 'uAspectCanvas');
  const uMask = gl.getUniformLocation(prog, 'uMask');
  const uVideo = gl.getUniformLocation(prog, 'uVideo');

  // ---------- texturas ----------
  const texMask = gl.createTexture();
  const texVideo = gl.createTexture();

  function prepararTextura(tex) {
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  }
  prepararTextura(texMask);
  prepararTextura(texVideo);

  // póster como textura de vídeo hasta que el vídeo tenga datos reales
  let aspectVideo = 16 / 9;
  const poster = new Image();
  poster.src = new URL('../assets/hero-poster.webp', import.meta.url).href;
  poster.onload = function () {
    aspectVideo = poster.naturalWidth / poster.naturalHeight;
    gl.bindTexture(gl.TEXTURE_2D, texVideo);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, poster);
  };

  // vertical en móvil apaisado-no: el clip 9:16 pesa la mitad y cubre sin recortar
  // El vídeo (~700 KB) se pide cuando la página ya ha pintado: si compite con
  // fuentes y CSS en una conexión lenta retrasa el LCP del texto del hero.
  // Mientras tanto el shader muestra el póster.
  const cargarVideo = () => {
    video.src = window.matchMedia('(orientation: portrait)').matches
      ? new URL('../assets/hero-loop-v.mp4', import.meta.url).href
      : new URL('../assets/hero-loop.mp4', import.meta.url).href;
    // Chrome Android no arranca autoplay de un <video> 1px/opacity:0 sin un play() explícito
    video.play().catch(() => {});
  };
  if (document.readyState === 'complete') cargarVideo();
  else window.addEventListener('load', cargarVideo, { once: true });
  video.addEventListener('canplay', () => video.play().catch(() => {}), { once: true });
  window.addEventListener('touchstart', () => video.play().catch(() => {}), { once: true, passive: true });
  video.addEventListener('loadedmetadata', function () {
    if (video.videoWidth && video.videoHeight) {
      aspectVideo = video.videoWidth / video.videoHeight;
    }
  });

  // ---------- máscara del wordmark (rasterizada en canvas 2D offscreen) ----------
  const cyNorm = esMovil ? 0.30 : 0.53; // medido desde arriba; en desktop baja para no pisar el nav
  const centerYUv = 1 - cyNorm; // convertido a espacio vUv (origen abajo, por el flip_y)
  const maskCanvas = document.createElement('canvas');
  const maskCtx = maskCanvas.getContext('2d');
  let fuenteLista = false;

  function rasterizarMascara() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.6);
    const w = Math.round(canvas.clientWidth * dpr);
    const h = Math.round(canvas.clientHeight * dpr);
    maskCanvas.width = w;
    maskCanvas.height = h;

    const ratioObjetivo = esMovil ? 0.92 : 0.70;
    maskCtx.clearRect(0, 0, w, h);
    // desenfoque de 1px: suaviza el borde de la máscara (sin él las letras salen dentadas)
    maskCtx.filter = `blur(${(1.1 * dpr).toFixed(1)}px)`;
    maskCtx.fillStyle = '#fff';
    maskCtx.textAlign = 'center';
    maskCtx.textBaseline = 'middle';

    // tamaño de fuente calculado a partir de una medida de referencia,
    // para que measureText('VZ') ocupe el ratio de ancho objetivo
    const refPx = 100;
    maskCtx.font = `800 ${refPx}px "Bricolage Grotesque"`;
    const anchoRef = maskCtx.measureText('VZ').width || refPx;
    const fontPx = (refPx * (w * ratioObjetivo)) / anchoRef;
    maskCtx.font = `800 ${fontPx}px "Bricolage Grotesque"`;

    const cy = h * cyNorm;
    maskCtx.fillText('VZ', w / 2, cy);

    gl.bindTexture(gl.TEXTURE_2D, texMask);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, maskCanvas);
  }

  // esperar la fuente real antes de rasterizar: si no, se mide con la fallback y sale mal
  document.fonts.load('800 100px "Bricolage Grotesque"').then(function () {
    fuenteLista = true;
    ajustarTamano();
  }).catch(function () {
    fuenteLista = true; // seguimos igual: mejor una máscara aproximada que ninguna
    ajustarTamano();
  });

  // ---------- tamaño / resize ----------
  let aspectCanvas = 1;
  function ajustarTamano() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.6);
    const w = Math.round(canvas.clientWidth * dpr);
    const h = Math.round(canvas.clientHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
    aspectCanvas = w / h;
    if (fuenteLista) rasterizarMascara();
  }
  window.addEventListener('resize', ajustarTamano);
  ajustarTamano();

  // ---------- ratón: posición + velocidad, con inercia ----------
  const mouseObjetivo = { x: 0.5, y: centerYUv };
  const mouseActual = { x: 0.5, y: centerYUv };
  let velObjetivo = 0;
  let velActual = 0;
  let ultimoMouse = null;
  let ultimoTiempo = 0;

  if (conHover) {
    canvas.parentElement.addEventListener('pointermove', function (e) {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1 - (e.clientY - rect.top) / rect.height; // a espacio vUv (origen abajo)
      mouseObjetivo.x = x;
      mouseObjetivo.y = y;

      const ahora = performance.now();
      if (ultimoMouse) {
        const dt = Math.max(ahora - ultimoTiempo, 1);
        const dist = Math.hypot(x - ultimoMouse.x, y - ultimoMouse.y);
        velObjetivo = clamp((dist / dt) * 1000 * 4, 0, 1);
      }
      ultimoMouse = { x, y };
      ultimoTiempo = ahora;
    });
  }

  // ---------- scroll: encoge el wordmark y sube la copy ----------
  let escala = 1;
  function alScroll() {
    const rect = hero.getBoundingClientRect();
    const alturaHero = hero.offsetHeight;
    const avanzado = clamp(-rect.top, 0, alturaHero);
    const progreso = alturaHero > 0 ? avanzado / alturaHero : 0;
    escala = 1 - 0.35 * progreso;
    heroCopy.style.transform = `translateY(${-avanzado * 0.15}px)`;
  }
  window.addEventListener('scroll', alScroll, { passive: true });

  // ---------- bucle ----------
  let corriendo = true; // pestaña visible
  let enViewport = true; // hero visible
  let rafId = null;

  const io = new IntersectionObserver(function (entradas) {
    enViewport = entradas[0].isIntersecting;
    sincronizarBucle();
  });
  io.observe(hero);

  document.addEventListener('visibilitychange', function () {
    corriendo = document.visibilityState === 'visible';
    sincronizarBucle();
  });

  function sincronizarBucle() {
    const debeCorrer = corriendo && enViewport;
    if (debeCorrer && rafId === null) {
      rafId = requestAnimationFrame(dibujar);
    } else if (!debeCorrer && rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  function dibujar(ahoraMs) {
    rafId = requestAnimationFrame(dibujar);
    const t = ahoraMs / 1000;

    if (video.readyState >= 2) {
      gl.bindTexture(gl.TEXTURE_2D, texVideo);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
    }

    if (conHover) {
      mouseActual.x = lerp(mouseActual.x, mouseObjetivo.x, 0.08);
      mouseActual.y = lerp(mouseActual.y, mouseObjetivo.y, 0.08);
      velObjetivo *= 0.94; // decae solo si el ratón deja de moverse
      velActual = lerp(velActual, velObjetivo, 0.08);
    } else {
      // sin puntero fino (táctil): el hero "respira" solo, centrado
      mouseActual.x = 0.5;
      mouseActual.y = centerYUv;
      velActual = 0.35 + 0.25 * Math.sin(t * 0.6);
    }

    gl.uniform1f(uTime, t);
    gl.uniform2f(uMouse, mouseActual.x, mouseActual.y);
    gl.uniform1f(uVel, velActual);
    gl.uniform1f(uScale, escala);
    gl.uniform1f(uCenterY, centerYUv);
    gl.uniform1f(uAspectVideo, aspectVideo);
    gl.uniform1f(uAspectCanvas, aspectCanvas);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texMask);
    gl.uniform1i(uMask, 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, texVideo);
    gl.uniform1i(uVideo, 1);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  sincronizarBucle();
}

const heroAuto = document.getElementById('top');
if (heroAuto && heroAuto.querySelector('#vz')) {
  montarHero(heroAuto);
}
