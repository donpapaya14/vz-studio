// Scrub de fotogramas: dibuja la secuencia assets/scrub/<res>/f_NNN.webp en
// un <canvas> según el progreso de scroll de su sección.

import { fotograma, elegirResolucion } from '../lib/scrub.js';

function numeroFotograma(i) {
  return String(i + 1).padStart(3, '0');
}

/**
 * Monta el scrub de fotogramas sobre un <canvas data-carpeta data-n data-res>.
 * @param {HTMLCanvasElement} canvas
 */
export function montarScrub(canvas) {
  const carpeta = canvas.dataset.carpeta;
  const n = Number(canvas.dataset.n);
  const resoluciones = String(canvas.dataset.res || '')
    .split(',')
    .map((v) => Number(v.trim()))
    .filter((v) => Number.isFinite(v) && v > 0);
  if (!carpeta || !Number.isInteger(n) || n < 1 || resoluciones.length === 0) return;

  const seccion = canvas.closest('section');
  if (!seccion) return;

  const ctx = canvas.getContext('2d');
  const imgs = new Array(n).fill(null);
  let cargando = false;
  let resActiva = resoluciones[0];

  function rutaFotograma(i) {
    return `${carpeta}/${resActiva}/f_${numeroFotograma(i)}.webp`;
  }

  function cargarFotograma(i) {
    if (imgs[i]) return;
    const img = new Image();
    img.decoding = 'async';
    img.src = rutaFotograma(i);
    imgs[i] = img;
  }

  // primero cada 6º fotograma (recorrido aproximado ya utilizable), luego el resto
  function precargar() {
    if (cargando) return;
    cargando = true;
    for (let i = 0; i < n; i += 6) cargarFotograma(i);
    for (let i = 0; i < n; i++) cargarFotograma(i);
  }

  function ajustarResolucion() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.6);
    resActiva = elegirResolucion(canvas.clientWidth * dpr, resoluciones);
  }

  function dibujarCover(img) {
    const cw = canvas.width;
    const ch = canvas.height;
    const escala = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
    const w = img.naturalWidth * escala;
    const h = img.naturalHeight * escala;
    ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
  }

  function pintar(i, frac) {
    if (canvas.width === 0 || canvas.height === 0) return;
    const actual = imgs[i];
    if (!actual || !actual.complete || actual.naturalWidth === 0) return;

    ctx.globalAlpha = 1;
    dibujarCover(actual);

    const siguiente = imgs[i + 1];
    if (frac > 0 && siguiente && siguiente.complete && siguiente.naturalWidth > 0) {
      ctx.globalAlpha = frac;
      dibujarCover(siguiente);
      ctx.globalAlpha = 1;
    }
  }

  let ultimoProgreso = 0;

  function redimensionar() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    ajustarResolucion();
    const { i, frac } = fotograma(ultimoProgreso, n);
    pintar(i, frac);
  }

  window.addEventListener('resize', redimensionar);
  redimensionar();

  const io = new IntersectionObserver(
    (entradas) => {
      if (entradas[0].isIntersecting) {
        precargar();
        io.disconnect();
      }
    },
    { rootMargin: '15%' }
  );
  io.observe(seccion);

  window.ScrollTrigger.create({
    trigger: seccion,
    start: 'top top',
    end: 'bottom bottom',
    scrub: true,
    onUpdate(st) {
      ultimoProgreso = st.progress;
      const { i, frac } = fotograma(st.progress, n);
      pintar(i, frac);
    },
  });
}
