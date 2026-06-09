/* ============================================================
   VZ Studio — fondo generativo propio (sin librerías)
   Un único sistema de partículas que se REORGANIZA según la
   sección visible al hacer scroll:
     flow      → campo de flujo orgánico (hero)
     grid      → retícula blueprint (método / rediseño)
     streams   → corrientes de datos en carriles (trabajo)
     orbits    → sistemas en órbita (servicios / incluido)
     converge  → convergencia y pulso central (sobre / contacto)
   Las fuerzas de cada escena se mezclan por el peso de cada
   sección en el viewport → transiciones continuas, sin cortes.
   ============================================================ */
(function () {
  'use strict';

  var canvas = document.getElementById('bg');
  if (!canvas || !canvas.getContext) return;
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) { canvas.remove(); return; } // CSS pone fallback estático

  var ctx = canvas.getContext('2d', { alpha: false });
  var DPR = Math.min(devicePixelRatio || 1, 1.6);
  var W = 0, H = 0, t = 0;
  var particles = [];
  var mouse = { x: -9999, y: -9999 };
  var fine = matchMedia('(hover:hover) and (pointer:fine)').matches;

  var BG = '#14161b';
  var CREAM = '232,227,216';

  /* secciones con data-scene */
  var sections = [];
  function collectSections() {
    sections = [].slice.call(document.querySelectorAll('[data-scene]')).map(function (el) {
      return { el: el, scene: el.getAttribute('data-scene') };
    });
  }

  function resize() {
    W = innerWidth; H = innerHeight;
    canvas.width = W * DPR; canvas.height = H * DPR;
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    var target = Math.min(260, Math.max(70, Math.round((W * H) / 6500)));
    while (particles.length < target) particles.push(spawn());
    particles.length = target;
    ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
  }

  function spawn() {
    return {
      x: Math.random() * W, y: Math.random() * H,
      vx: 0, vy: 0,
      s: Math.random(),            // semilla estable por partícula
      r: 0.8 + Math.random() * 1.4 // radio
    };
  }

  /* ---------- pesos de escena según scroll ---------- */
  var weights = { flow: 1, grid: 0, streams: 0, orbits: 0, converge: 0 };
  function updateWeights() {
    var acc = { flow: 0, grid: 0, streams: 0, orbits: 0, converge: 0 };
    var total = 0;
    for (var i = 0; i < sections.length; i++) {
      var r = sections[i].el.getBoundingClientRect();
      var visible = Math.min(r.bottom, H) - Math.max(r.top, 0);
      if (visible <= 0) continue;
      var w = visible / H;
      acc[sections[i].scene] += w; total += w;
    }
    if (total <= 0) { acc.flow = 1; total = 1; }
    // suavizado temporal para que el cambio sea un fundido
    for (var k in weights) {
      var targetW = acc[k] / total;
      weights[k] += (targetW - weights[k]) * 0.045;
    }
  }

  /* ---------- fuerzas por escena ---------- */
  function fFlow(p, f, w) {
    var a = Math.sin(p.x * 0.0016 + t * 0.25) + Math.cos(p.y * 0.0014 - t * 0.2)
          + Math.sin((p.x + p.y) * 0.0007 + t * 0.07);
    var ang = a * 1.7;
    f.x += Math.cos(ang) * 0.035 * w;
    f.y += Math.sin(ang) * 0.035 * w;
  }

  var GRID = 96;
  function fGrid(p, f, w) {
    var gx = Math.round(p.x / GRID) * GRID;
    var gy = Math.round(p.y / GRID) * GRID;
    f.x += (gx - p.x) * 0.012 * w;
    f.y += (gy - p.y) * 0.012 * w;
  }

  function fStreams(p, f, w) {
    var laneH = 70;
    var lane = Math.floor(p.y / laneH);
    var dir = (lane % 2 === 0) ? 1 : -1;
    var speed = (0.5 + ((lane * 37) % 5) * 0.22) * dir;
    var cy = lane * laneH + laneH / 2;
    f.x += (speed - p.vx) * 0.06 * w;
    f.y += (cy - p.y) * 0.01 * w;
  }

  function fOrbits(p, f, w) {
    var ci = Math.floor(p.s * 3);
    var cx = W * (0.22 + ci * 0.28);
    var cy = H * (ci === 1 ? 0.62 : 0.42);
    var dx = p.x - cx, dy = p.y - cy;
    var d = Math.sqrt(dx * dx + dy * dy) || 1;
    var ring = 70 + p.s * 150;
    // radial hacia el anillo + tangencial para orbitar
    f.x += (-dx / d) * (d - ring) * 0.004 * w + (-dy / d) * 0.55 * w * 0.12;
    f.y += (-dy / d) * (d - ring) * 0.004 * w + (dx / d) * 0.55 * w * 0.12;
  }

  function fConverge(p, f, w) {
    var cx = W / 2, cy = H / 2;
    var dx = p.x - cx, dy = p.y - cy;
    var d = Math.sqrt(dx * dx + dy * dy) || 1;
    var ring = 130 + p.s * 170 + Math.sin(t * 0.8 + p.s * 6.28) * 18; // respira
    f.x += (-dx / d) * (d - ring) * 0.005 * w + (-dy / d) * 0.4 * w * 0.1;
    f.y += (-dy / d) * (d - ring) * 0.005 * w + (dx / d) * 0.4 * w * 0.1;
  }

  /* ---------- bucle ---------- */
  var running = true;
  document.addEventListener('visibilitychange', function () {
    running = !document.hidden;
    if (running) requestAnimationFrame(frame);
  });

  if (fine) {
    addEventListener('mousemove', function (e) { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
    addEventListener('mouseleave', function () { mouse.x = -9999; }, { passive: true });
  }

  function frame() {
    if (!running) return;
    t += 0.016;
    updateWeights();

    // estela: fundido parcial hacia el fondo
    ctx.fillStyle = 'rgba(20,22,27,0.30)';
    ctx.fillRect(0, 0, W, H);

    var i, p;
    for (i = 0; i < particles.length; i++) {
      p = particles[i];
      var f = { x: 0, y: 0 };
      if (weights.flow > 0.01) fFlow(p, f, weights.flow);
      if (weights.grid > 0.01) fGrid(p, f, weights.grid);
      if (weights.streams > 0.01) fStreams(p, f, weights.streams);
      if (weights.orbits > 0.01) fOrbits(p, f, weights.orbits);
      if (weights.converge > 0.01) fConverge(p, f, weights.converge);

      // ratón: repulsión suave
      var mdx = p.x - mouse.x, mdy = p.y - mouse.y;
      var md2 = mdx * mdx + mdy * mdy;
      if (md2 < 16900) { // 130px
        var md = Math.sqrt(md2) || 1;
        var push = (130 - md) / 130 * 0.4;
        f.x += (mdx / md) * push; f.y += (mdy / md) * push;
      }

      p.vx = (p.vx + f.x) * 0.94;
      p.vy = (p.vy + f.y) * 0.94;
      p.x += p.vx; p.y += p.vy;

      // envolver bordes
      if (p.x < -20) p.x = W + 20; else if (p.x > W + 20) p.x = -20;
      if (p.y < -20) p.y = H + 20; else if (p.y > H + 20) p.y = -20;

      var alpha = 0.28 + p.s * 0.38;
      ctx.fillStyle = 'rgba(' + CREAM + ',' + alpha + ')';
      ctx.fillRect(p.x, p.y, p.r, p.r);
    }

    // conexiones: solo con peso de retícula u órbitas (look blueprint/sistema)
    var linkW = weights.grid * 0.9 + weights.orbits * 0.5 + weights.converge * 0.45;
    if (linkW > 0.05) {
      ctx.lineWidth = 1;
      var maxD = 92, maxD2 = maxD * maxD;
      for (i = 0; i < particles.length; i++) {
        p = particles[i];
        // saltos de 2 para mantener coste bajo
        for (var j = i + 2; j < particles.length; j += 2) {
          var q = particles[j];
          var dx = p.x - q.x, dy = p.y - q.y;
          var d2 = dx * dx + dy * dy;
          if (d2 < maxD2) {
            var a = (1 - d2 / maxD2) * 0.16 * linkW;
            ctx.strokeStyle = 'rgba(' + CREAM + ',' + a + ')';
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
          }
        }
      }
    }

    requestAnimationFrame(frame);
  }

  addEventListener('resize', resize, { passive: true });
  collectSections();
  resize();
  requestAnimationFrame(frame);
})();
