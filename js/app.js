// VZ Studio — orquestador de Lenis + GSAP/ScrollTrigger y los efectos de
// js/fx/*. Vendor (gsap, ScrollTrigger, SplitText, Flip, Lenis) se carga
// como scripts clásicos antes de este módulo y queda expuesto en window.

import { montarBloques } from './fx/bloques.js';
import { montarScrub } from './fx/scrub.js';
import { montarRail } from './fx/rail.js';
import { montarRevelados } from './fx/revelar.js';
import { montarMagnetico } from './fx/magnetico.js';

const { gsap, ScrollTrigger, SplitText, Flip, Lenis } = window;

gsap.registerPlugin(ScrollTrigger, SplitText, Flip);

const lenis = new Lenis({ duration: 1.2, smoothWheel: true });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);
window.__lenis = lenis;

// anclas del nav/CTA: scroll suave con Lenis, con hueco para el nav sticky
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const destino = document.querySelector(a.getAttribute('href'));
    if (!destino) return;
    e.preventDefault();
    lenis.scrollTo(destino, { offset: -80 });
  });
});

// nav: sombra al hacer scroll
const nav = document.getElementById('nav');
if (nav) {
  addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', scrollY > 10);
  }, { passive: true });
}

// vídeos: se descargan solo cuando se acercan a la pantalla (el póster va antes)
const lazyVideos = document.querySelectorAll('video[data-src]');
function cargarVideo(v) {
  if (v.src) return;
  // el póster también va perezoso: 4 pósters eran 380 KB en la primera carga
  const poster = v.getAttribute('data-poster');
  if (poster) { v.poster = poster; v.removeAttribute('data-poster'); }
  v.src = v.getAttribute('data-src');
  v.removeAttribute('data-src');
}
if ('IntersectionObserver' in window) {
  const vio = new IntersectionObserver((entradas) => {
    entradas.forEach((e) => {
      if (e.isIntersecting) { cargarVideo(e.target); vio.unobserve(e.target); }
    });
  }, { rootMargin: '300px 0px' });
  lazyVideos.forEach((v) => vio.observe(v));
} else {
  lazyVideos.forEach(cargarVideo);
}

const mm = gsap.matchMedia();

mm.add(
  { reduce: '(prefers-reduced-motion: reduce)', normal: '(prefers-reduced-motion: no-preference)' },
  (ctx) => {
    if (ctx.conditions.reduce) {
      // estados finales, sin animación: todo visible y el último bloque de color fijo
      document.querySelectorAll('.rv').forEach((el) => el.classList.add('in'));
      const secciones = document.querySelectorAll('section[data-bg]');
      const ultima = secciones[secciones.length - 1];
      if (ultima) {
        document.documentElement.style.setProperty(
          '--s-bg',
          getComputedStyle(document.documentElement).getPropertyValue(`--${ultima.dataset.bg}`)
        );
        document.documentElement.style.setProperty(
          '--s-ink',
          ultima.dataset.ink === 'oscuro' ? '#16140F' : '#ECEEF2'
        );
      }
      return;
    }

    montarBloques(lenis);
    document.querySelectorAll('.scrub').forEach((canvas) => montarScrub(canvas));

    // por clase, no por id: la sección se llama #trabajo en ES y #work en EN
    const rail = document.querySelector('.rail');
    const trabajo = rail ? rail.closest('section') : null;
    if (trabajo && rail) montarRail(trabajo, rail);

    montarRevelados();
    montarMagnetico('.hero .btn-solid');
    montarMagnetico('.contact .btn-solid');
  }
);
