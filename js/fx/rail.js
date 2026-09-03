// Raíl horizontal de proyectos: la sección se fija (pin) y el raíl se
// desplaza en horizontal según el progreso de scroll vertical.

/**
 * Monta el raíl horizontal. Solo en pantallas ≥701px (en móvil el CSS
 * apila el raíl en columna, sin pin).
 * @param {HTMLElement} seccion
 * @param {HTMLElement} rail
 */
export function montarRail(seccion, rail) {
  if (window.matchMedia('(max-width: 700px)').matches) return;

  const pad = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--pad')) || 0;

  window.gsap.to(rail, {
    x: () => -(rail.scrollWidth - window.innerWidth + 2 * pad),
    ease: 'none',
    scrollTrigger: {
      trigger: seccion,
      start: 'top top',
      end: () => '+=' + (rail.scrollWidth - window.innerWidth),
      pin: true,
      scrub: 1,
      invalidateOnRefresh: true,
    },
  });
}
