// Efecto "hoja": cada sección se queda pegada por abajo mientras la
// siguiente sube y la tapa, encogiéndose y oscureciéndose. #trabajo/#work no
// participa (manda su propio pin del raíl), pero la sección de después sigue
// subiendo con radius encima (eso ya lo resuelve el CSS sin condición).

/** Monta el efecto en todas las `section[data-hoja]` de `<main>`. */
export function montarHoja() {
  const main = document.querySelector('main');
  if (!main) return;

  const secciones = Array.from(main.children).filter((el) => el.tagName === 'SECTION');
  // orden de apilado explícito: la que viene después siempre tapa a la anterior
  secciones.forEach((sec, i) => { sec.style.zIndex = String(i + 1); });

  const conHoja = secciones.filter((sec) => sec.hasAttribute('data-hoja'));

  function medir(sec) {
    // más alta que el viewport → top negativo → se queda pegada por abajo
    sec.style.top = `${Math.min(0, window.innerHeight - sec.offsetHeight)}px`;
  }
  function medirTodas() { conHoja.forEach(medir); }

  medirTodas();
  window.addEventListener('resize', medirTodas);
  window.ScrollTrigger.addEventListener('refreshInit', medirTodas);

  conHoja.forEach((sec) => {
    const siguiente = sec.nextElementSibling;
    if (!siguiente || siguiente.tagName !== 'SECTION') return; // última sección: nadie la tapa
    window.gsap.to(sec, {
      scale: 0.96,
      filter: 'brightness(.72)',
      ease: 'none',
      scrollTrigger: {
        trigger: siguiente,
        start: 'top bottom',
        end: 'top top',
        scrub: true,
      },
    });
  });
}
