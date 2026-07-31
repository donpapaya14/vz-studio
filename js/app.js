/* VZ Studio — JS mínimo: sombra de nav + reveals al hacer scroll */
(function () {
  'use strict';

  // nav: sombra al hacer scroll
  var nav = document.getElementById('nav');
  if (nav) {
    addEventListener('scroll', function () {
      nav.classList.toggle('scrolled', scrollY > 10);
    }, { passive: true });
  }

  // vídeos: se descargan solo cuando se acercan a la pantalla (el póster va antes)
  var lazyVideos = document.querySelectorAll('video[data-src]');
  function loadVideo(v) {
    if (v.src) return;
    v.src = v.getAttribute('data-src');
    v.removeAttribute('data-src');
  }
  if ('IntersectionObserver' in window) {
    var vio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { loadVideo(e.target); vio.unobserve(e.target); }
      });
    }, { rootMargin: '300px 0px' });
    lazyVideos.forEach(function (v) { vio.observe(v); });
  } else {
    lazyVideos.forEach(loadVideo);
  }

  // reveals con IntersectionObserver (respeta reduced-motion vía CSS)
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    document.querySelectorAll('.rv').forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll('.rv').forEach(function (el) { el.classList.add('in'); });
  }
})();
