// Botones magnéticos: siguen ligeramente al cursor cuando está cerca.
// Solo con puntero fino y hover real (ratón), nunca en táctil.

const RADIO_EXTRA = 50;

/**
 * Aplica el efecto magnético a los botones que casen con `sel`.
 * @param {string} sel selector CSS (p. ej. '.hero .btn-solid')
 */
export function montarMagnetico(sel) {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  const botones = document.querySelectorAll(sel);
  if (botones.length === 0) return;

  const seguidores = Array.from(botones).map((btn) => ({
    btn,
    xTo: window.gsap.quickTo(btn, 'x', { duration: 0.28, ease: 'power2.out' }),
    yTo: window.gsap.quickTo(btn, 'y', { duration: 0.28, ease: 'power2.out' }),
  }));

  document.addEventListener('mousemove', (e) => {
    seguidores.forEach(({ btn, xTo, yTo }) => {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const radio = RADIO_EXTRA + Math.max(rect.width, rect.height) / 2;

      if (Math.hypot(dx, dy) < radio) {
        xTo(dx * 0.35);
        yTo(dy * 0.35);
      } else {
        xTo(0);
        yTo(0);
      }
    });
  });
}
