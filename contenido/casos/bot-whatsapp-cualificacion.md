---
titulo: Un agente de IA que atiende WhatsApp y cualifica solo
descripcion: Bot de ventas en producción sobre WhatsApp Cloud API: entiende audios, cualifica, agenda y registra la baja. Lo que aprendí montándolo para varios clientes.
fecha: 2026-07-30
etiqueta: Agentes de IA
cliente: Varios clientes, sector inmobiliario y servicios
lectura: 6 min
---

## El problema

Una empresa con captación activa recibe mensajes a cualquier hora. El patrón
se repite en todos los sectores que he tocado:

- El 70 % de lo que entra son las mismas cinco preguntas.
- Lo que llega fuera de horario se contesta al día siguiente, si alguien se
  acuerda.
- Nadie sabe cuántos contactos se perdieron, porque no se registran los que no
  se contestaron.

Y la consecuencia menos obvia: el comercial gasta su mejor tiempo filtrando
gente que nunca iba a comprar, en vez de hablando con quien sí.

## Qué se construyó

Un agente sobre **WhatsApp Cloud API** con n8n en servidor propio. No es un
árbol de botones: entiende lenguaje normal, y también audios, que es como
escribe media España.

**Cualifica antes de pasar el contacto.** Pregunta lo que el comercial
preguntaría —presupuesto, zona, plazo— y solo escala cuando hay algo real.

**Agenda solo.** Si el contacto encaja, propone hueco y lo escribe en el
calendario.

**Registra la baja antes de prometerla.** Este detalle costó una iteración:
si alguien dice que no le escriban, el sistema marca la baja en base de datos
**antes** de contestar "listo, no te escribo más". Al revés, si algo falla
entre medias, prometes una cosa y haces la contraria.

**Se le nota humano.** Burbujas separadas en vez de un ladrillo, confirmación
de lectura, escribiendo… y emoji con sentido. La diferencia en respuesta entre
un bot que parece formulario y uno que parece persona es grande.

## Los tropiezos que valen para cualquiera

**Una app de Meta = un solo webhook.** Si tienes varios números de WhatsApp
conviviendo, no puedes darle a cada uno su destino: hay que enrutar por
`phone_number_id` dentro del flujo. Se descubre tarde y duele.

**Los audios llegan de otro dominio.** Meta sirve los ficheros desde
`lookaside.fbsbx.com`, no desde `graph.facebook.com`, y si la credencial solo
permite el segundo, el audio falla con un "Domain not allowed" que no explica
nada.

**Reintentar un error de cuota lo empeora.** Cuando Meta devuelve el error de
límite de aplicación, volver a intentarlo perpetúa el bloqueo en vez de
arreglarlo.

**Un debounce mal hecho deja al modelo sin la pregunta.** Si agrupas mensajes
"desde la última respuesta", en una carrera puedes perder justo el mensaje que
disparó la ejecución: al modelo le llega vacío y vuelve al guion desde el
principio. Cuando un bot repite preguntas, mira primero **qué entró al
modelo**, no el prompt.

## Qué cambió

El bot está **vivo en producción** desde julio de 2026 y sigue funcionando.
Hay un segundo sistema encima que audita las conversaciones y avisa por
Telegram cuando algo se sale de lo esperado, porque un bot sin vigilancia es
un bot que se rompe en silencio un domingo.

No publico volúmenes de conversación ni tasas de conversión: son datos de
clientes y no me corresponde enseñarlos.

## Lo que me llevo

Que la parte difícil de un agente **no es la IA**. Es la fontanería: qué pasa
cuando el audio no baja, cuando Meta devuelve un error raro, cuando dos
mensajes llegan a la vez. El modelo funciona a la primera; lo demás es lo que
te tiene una semana.
