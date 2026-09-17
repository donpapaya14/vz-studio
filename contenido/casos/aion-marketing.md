---
titulo: Web y sistemas internos para una agencia de marketing
descripcion: Web multipágina en Next.js con hero WebGL propio, más la infraestructura de automatización que mueve los datos de la agencia por dentro.
fecha: 2026-09-04
etiqueta: Agencia digital
cliente: AION Marketing & IA
lectura: 5 min
---

## El problema

AION vende marketing, paid media e IA. Una agencia que vende IA tiene un
problema particular: **su propia web es el primer examen**. Si el sitio de
quien te va a montar el sistema parece una plantilla, la conversación empieza
cuesta arriba.

Además tenían el problema clásico de agencia por dentro: los datos de campañas
en una herramienta, los leads en otra, los informes a mano cada mes.

## Qué se construyó

**La web.** Plataforma multipágina en Next.js con página de producto propia
para su sistema de IA y casos de éxito con métricas reales. La home lleva una
firma visual programada: la **Λ de la marca como máscara WebGL** sobre vídeo,
un shader escrito a medida. No es un efecto de librería: es el logotipo
convertido en el propio elemento gráfico.

Ese mismo motor se reutilizó después en las fotos del equipo, así que la firma
visual es coherente en todo el sitio y no costó volver a programarla.

**Los sistemas internos.** Por debajo, más de 50 flujos de automatización en
n8n sobre servidor propio:

- Datos de campañas de Meta Ads sincronizados a Notion todos los días, para 13
  cuentas de cliente.
- Leads de los formularios llegando al sitio correcto sin intermediarios de
  pago.
- Un vigilante que revisa cada cinco minutos que los flujos sigan vivos y
  avisa por Telegram si algo se cae.

Ese último punto es el que más veces ha salvado la semana. Un sistema
automático sin vigilancia no falla menos: falla igual, pero te enteras cuando
te lo dice el cliente.

## Cómo se entregó

La web en Next.js sobre Vercel. La automatización en n8n autoalojado, que a
este volumen sale mucho más barato que la versión en la nube y deja los datos
de cliente en casa.

## Qué cambió

La web está **en producción** en `aionmkt.com`. La infraestructura de
automatización lleva meses funcionando y es hoy la que mueve el reporting
interno de la agencia.

Sobre cifras: los volúmenes de campaña son datos de sus clientes y no los voy a
publicar. Lo que sí es comprobable es el número de flujos en producción y que
el sistema de vigilancia avisa, porque ha avisado.

## Lo que me llevo

Que el trabajo que más valor da a una agencia **no es el que se ve**. La web
abre puertas, pero lo que les cambió el día a día fue dejar de hacer informes
a mano.
