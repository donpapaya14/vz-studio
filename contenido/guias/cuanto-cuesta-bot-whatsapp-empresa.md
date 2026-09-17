---
titulo: Cuánto cuesta un bot de WhatsApp para una empresa
descripcion: Precios reales de montar un agente de IA en WhatsApp en España: desarrollo, coste por conversación de Meta, servidor y mantenimiento. Con los números desglosados.
fecha: 2026-09-18
etiqueta: Automatización
lectura: 7 min
---

## La respuesta corta

Montar un agente de IA en WhatsApp para una pyme en España sale, a fecha de
hoy, entre **1.000 y 2.500 €** de desarrollo según lo que tenga que hacer, más
**entre 20 y 80 € al mes** de funcionamiento.

Lo que casi nadie te cuenta cuando pides presupuesto es que esas dos cifras
son independientes, y que la segunda depende de cuánta gente te escriba.

## Las cuatro partidas

### 1. El desarrollo

Es el grueso y se paga una vez. El rango depende de una sola cosa: **cuántas
decisiones tiene que tomar el bot**.

| Qué hace | Rango orientativo |
|---|---|
| Contesta preguntas frecuentes y pasa el contacto | 800 – 1.200 € |
| Además cualifica: pregunta y decide si vale la pena | 1.200 – 1.800 € |
| Además agenda en calendario y escribe en tu CRM | 1.800 – 2.500 € |
| Varios números, varios idiomas o integración con ERP | desde 2.500 € |

Estos son mis rangos, no una media del mercado. Los pongo porque el sector es
muy opaco con los precios y eso solo beneficia a quien cobra de más.

### 2. Lo que cobra Meta

WhatsApp Business no es gratis a escala. Meta cobra **por conversación**, con
precio distinto según quién la inicia y de qué va.

Lo importante en la práctica:

- Las conversaciones que **inicia el cliente** escribiéndote son las más
  baratas, y hay un tramo mensual gratuito.
- Las que **inicias tú** (campañas, recordatorios) son bastante más caras.
- La tarifa cambia por país y Meta la ha revisado varias veces.

Para una pyme que recibe consultas y no hace envíos masivos, esto suele quedar
en unos pocos euros al mes o directamente en cero.

> Las tarifas exactas cambian con frecuencia. Antes de presupuestar, mira la
> tabla oficial de precios de Meta para España el mes en curso. Cualquiera que
> te dé una cifra cerrada a un año vista se la está inventando.

### 3. El modelo de IA

Cada conversación consume tokens. Con un modelo actual y respuestas de
longitud normal, **una conversación completa cuesta céntimos**.

Para 500 conversaciones al mes hablamos de un gasto de un dígito o dos en
euros. Es, casi siempre, la partida más pequeña, y por eso me sorprende cuánta
gente se preocupa por ella y no por la siguiente.

### 4. Dónde vive el bot

Aquí sí hay decisión de dinero:

- **n8n en la nube**: cómodo, desde unos 20-25 € al mes, y sube con el volumen
  de ejecuciones.
- **n8n en servidor propio**: un VPS de 5-10 € al mes aguanta de sobra a una
  pyme, pero alguien tiene que mantenerlo.

Yo trabajo con servidor propio casi siempre. A partir de cierto volumen la
diferencia de coste es grande, y los datos de tus clientes se quedan en tu
casa.

## El coste que nadie presupuesta

**Vigilar que siga vivo.**

Un bot es un sistema que corre solo. Cuando se rompe —y se rompe: caduca un
token, Meta cambia algo, el servidor se reinicia— no salta ninguna alarma. Te
enteras cuando un cliente te dice que no le contestaron.

Monto siempre un vigilante que comprueba cada pocos minutos que todo sigue en
pie y avisa por Telegram. Es media hora de trabajo y es lo que separa un
sistema profesional de una demo bonita.

## Cómo saber si te compensa

La cuenta es sencilla:

1. ¿Cuántas consultas recibes al mes fuera de horario?
2. ¿Cuántas de esas se pierden porque contestas tarde?
3. ¿Cuánto vale un cliente tuyo?

Si pierdes dos clientes al mes por contestar tarde y cada uno vale 300 €, el
bot se paga solo en dos meses. Si recibes cinco consultas al mes, no lo montes:
contéstalas tú.

Es la pregunta que hago siempre antes de aceptar el encargo, y a veces la
respuesta honesta es que no compensa.

## Lo que no te va a resolver

- **Vender por ti.** Cualifica y filtra; cerrar sigue siendo cosa de una
  persona.
- **Sustituir a nadie.** Quita trabajo repetitivo, no criterio.
- **Funcionar sin mantenimiento.** Meta cambia cosas varias veces al año.

Si alguien te lo vende como "lo montas y te olvidas", desconfía.
