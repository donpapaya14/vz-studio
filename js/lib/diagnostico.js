// Calculadora del diagnóstico de /diagnostico/.
//
// Cinco preguntas → horas y euros que se van al año en trabajo repetitivo, y
// cuánto de eso es automatizable. Todo el cálculo es local: no hay backend,
// no se guarda nada y el único envío es el enlace de WhatsApp que abre el
// propio visitante. Por eso no hay datos personales en juego.
//
// Las cifras son una ESTIMACIÓN declarada como tal en la página. El objetivo
// es que el visitante vea el orden de magnitud de su problema, no dar un
// presupuesto.

const SEMANAS_LABORABLES = 52;
const WHATSAPP = '34722736832';

/** Tope de lo automatizable: ni el mejor sistema se lleva el 100 % del trabajo. */
const TECHO_AUTOMATIZABLE = 0.85;

export const PREGUNTAS = [
  {
    id: 'personas',
    enunciado: '¿Cuántas personas hacen tareas repetitivas en tu empresa?',
    ayuda: 'Cuenta a quien copia datos, contesta lo mismo o pasa información de un sitio a otro.',
    opciones: [
      { texto: 'Solo yo', valor: 1 },
      { texto: '2 o 3', valor: 3 },
      { texto: 'De 4 a 10', valor: 7 },
      { texto: 'Más de 10', valor: 15 },
    ],
  },
  {
    id: 'horas',
    enunciado: '¿Cuántas horas a la semana le dedica cada una?',
    ayuda: 'Solo el tiempo en tareas que se repiten igual cada vez.',
    opciones: [
      { texto: 'Menos de 2', valor: 1.5 },
      { texto: 'Entre 2 y 5', valor: 3.5 },
      { texto: 'Entre 5 y 10', valor: 7.5 },
      { texto: 'Más de 10', valor: 12 },
    ],
  },
  {
    id: 'coste',
    enunciado: '¿Cuánto cuesta una hora de esa persona, aproximadamente?',
    ayuda: 'Coste para la empresa, con seguros sociales incluidos.',
    opciones: [
      { texto: 'Unos 12 €', valor: 12 },
      { texto: 'Unos 20 €', valor: 20 },
      { texto: 'Unos 35 €', valor: 35 },
      { texto: 'Más de 50 €', valor: 55 },
    ],
  },
  {
    id: 'repetitividad',
    enunciado: '¿Qué parte de ese trabajo sigue siempre los mismos pasos?',
    ayuda: 'Si alguien pudiera escribir las instrucciones exactas, cuenta como repetitivo.',
    opciones: [
      { texto: 'Poco: casi todo son casos distintos', valor: 0.25 },
      { texto: 'Como la mitad', valor: 0.5 },
      { texto: 'La mayoría', valor: 0.75 },
      { texto: 'Casi todo', valor: 0.9 },
    ],
  },
  {
    id: 'canales',
    enunciado: '¿Por cuántos sitios distintos os entran clientes o datos?',
    ayuda: 'WhatsApp, formulario de la web, Instagram, correo, Excel, el CRM…',
    opciones: [
      { texto: 'Uno o dos', valor: 1.5 },
      { texto: 'Tres o cuatro', valor: 3.5 },
      { texto: 'Cinco o más', valor: 6 },
    ],
  },
];

/** Convierte a número finito y no negativo; lo que no lo sea, cae al valor por defecto. */
function num(v, porDefecto = 0) {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : porDefecto;
}

/**
 * Estima el coste anual del trabajo repetitivo y cuánto se puede recuperar.
 *
 * El factor de canales modela algo real: cuanta más información entra por
 * sitios sueltos, más se pierde en copiar y pegar entre ellos, y más gana
 * automatizar. Va acotado para que nunca supere el techo automatizable.
 *
 * @param {{personas?:number,horas?:number,coste?:number,repetitividad?:number,canales?:number}} r
 * @returns {{horasAno:number,eurosAno:number,horasRecuperables:number,eurosRecuperables:number}}
 */
export function calcular(r = {}) {
  const personas = num(r.personas, 1);
  const horas = num(r.horas, 0);
  const coste = num(r.coste, 0);
  const repetitividad = Math.min(num(r.repetitividad, 0), 1);
  const canales = num(r.canales, 1);

  const horasAno = personas * horas * SEMANAS_LABORABLES;
  const eurosAno = horasAno * coste;

  // 1 canal no penaliza; a partir de ahí suma hasta un 30 % más de margen
  const factorCanales = 1 + Math.min(Math.max(canales - 1, 0) * 0.06, 0.3);
  const fraccion = Math.min(repetitividad * factorCanales, TECHO_AUTOMATIZABLE);

  const horasRecuperables = horasAno * fraccion;

  return {
    horasAno,
    eurosAno,
    horasRecuperables,
    eurosRecuperables: horasRecuperables * coste,
  };
}

/**
 * Enlace de WhatsApp con el resultado ya escrito. No lleva ningún dato
 * personal: solo las cifras que el propio visitante acaba de elegir.
 * @param {ReturnType<typeof calcular>} resultado
 * @returns {string}
 */
export function enlaceWhatsApp(resultado) {
  const horas = Math.round(num(resultado?.horasRecuperables));
  const euros = Math.round(num(resultado?.eurosRecuperables));
  const texto =
    `Hola Vladys, he hecho el diagnóstico en vzstudio.dev. ` +
    `Me sale que puedo recuperar unas ${horas} horas al año, ` +
    `unos ${euros} €. ¿Lo vemos?`;
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(texto)}`;
}

/**
 * Formatea una cifra grande en español (punto de millar, sin decimales).
 * @param {number} v
 * @returns {string}
 */
export function cifra(v) {
  return Math.round(num(v)).toLocaleString('es-ES');
}
