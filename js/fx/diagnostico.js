// Pegamento de DOM para /diagnostico/. Todo el cálculo vive en js/lib/diagnostico.js
// (puro y testeado); aquí solo se pintan preguntas y se lee lo que elige el
// visitante. Sin peticiones de red, sin almacenamiento: al recargar, se empieza
// de cero. La CSP del sitio no permite scripts en línea, por eso esto es un
// módulo externo y los manejadores se enganchan con addEventListener.

import { PREGUNTAS, calcular, enlaceWhatsApp, cifra } from '../lib/diagnostico.js';

const app = document.getElementById('diag');
if (app) arrancar(app);

function arrancar(raiz) {
  const respuestas = {};
  let paso = 0;

  const barra = raiz.querySelector('.diag-barra i');
  const progreso = raiz.querySelector('.diag-progreso');
  const zona = raiz.querySelector('.diag-zona');

  pintar();

  function pintar() {
    if (paso >= PREGUNTAS.length) return pintarResultado();

    const p = PREGUNTAS[paso];
    progreso.textContent = `Pregunta ${paso + 1} de ${PREGUNTAS.length}`;
    barra.style.width = `${(paso / PREGUNTAS.length) * 100}%`;

    zona.textContent = '';
    const bloque = elem('div', 'diag-paso activo');
    bloque.append(texto('h2', '', p.enunciado), texto('p', 'ayuda', p.ayuda));

    const opciones = elem('div', 'diag-opciones');
    for (const o of p.opciones) {
      const b = texto('button', 'diag-op', o.texto);
      b.type = 'button';
      b.addEventListener('click', () => {
        respuestas[p.id] = o.valor;
        paso += 1;
        pintar();
      });
      opciones.append(b);
    }
    bloque.append(opciones);

    if (paso > 0) {
      const atras = texto('button', 'diag-atras', '← Volver a la anterior');
      atras.type = 'button';
      atras.addEventListener('click', () => {
        paso -= 1;
        pintar();
      });
      bloque.append(atras);
    }

    zona.append(bloque);
    // El foco vuelve al titular para que un lector de pantalla anuncie la
    // pregunta nueva: sin esto, el cambio de paso pasa desapercibido.
    const h = bloque.querySelector('h2');
    h.tabIndex = -1;
    h.focus({ preventScroll: true });
  }

  function pintarResultado() {
    const r = calcular(respuestas);
    progreso.textContent = 'Tu estimación';
    barra.style.width = '100%';

    zona.textContent = '';
    const bloque = elem('div', 'diag-paso diag-res activo');
    bloque.append(texto('h2', '', 'Esto es lo que te cuesta al año el trabajo repetitivo'));

    const cifras = elem('div', 'cifras');
    cifras.append(
      tarjeta(`${cifra(r.horasAno)} h`, 'Horas al año en tareas repetitivas'),
      tarjeta(`${cifra(r.eurosAno)} €`, 'Coste anual de esas horas'),
      tarjeta(`${cifra(r.horasRecuperables)} h`, 'Horas recuperables automatizando'),
      tarjeta(`${cifra(r.eurosRecuperables)} €`, 'Ahorro anual estimado')
    );
    bloque.append(cifras);

    bloque.append(
      texto(
        'p',
        'nota',
        'Es una estimación a partir de lo que has elegido, no un presupuesto. ' +
          'Sirve para ver el orden de magnitud: si la cifra te sorprende, merece la pena mirarlo con calma.'
      )
    );

    const acciones = elem('div', 'acciones');
    const wa = texto('a', 'btn btn-solid', 'Comentar el resultado por WhatsApp');
    wa.href = enlaceWhatsApp(r);
    wa.rel = 'noopener';

    const repetir = texto('button', 'btn btn-ghost', 'Volver a empezar');
    repetir.type = 'button';
    repetir.addEventListener('click', () => {
      for (const k of Object.keys(respuestas)) delete respuestas[k];
      paso = 0;
      pintar();
    });

    acciones.append(wa, repetir);
    bloque.append(acciones);
    zona.append(bloque);

    const h = bloque.querySelector('h2');
    h.tabIndex = -1;
    h.focus({ preventScroll: true });
  }
}

function elem(tag, clase) {
  const n = document.createElement(tag);
  if (clase) n.className = clase;
  return n;
}

function texto(tag, clase, contenido) {
  const n = elem(tag, clase);
  n.textContent = contenido;
  return n;
}

function tarjeta(valor, clave) {
  const n = elem('div', 'cifra');
  n.append(texto('span', 'v', valor), texto('span', 'k', clave));
  return n;
}
