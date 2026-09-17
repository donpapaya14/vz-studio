---
titulo: n8n o Make: cuál elegir para automatizar tu empresa
descripcion: Comparativa práctica entre n8n y Make desde la experiencia de montar decenas de automatizaciones en producción. Cuándo compensa cada uno y cuándo ninguno.
fecha: 2026-09-18
etiqueta: Automatización
lectura: 6 min
---

## La diferencia que de verdad importa

Las comparativas suelen enredarse con la lista de integraciones. Eso importa
poco: los dos conectan con casi todo, y lo que falte se resuelve con una
llamada HTTP.

La diferencia real es otra: **n8n puedes alojarlo tú, Make no.**

De ahí sale todo lo demás.

## Cómo cobran, que es donde duele

**Make cobra por operación.** Cada paso de cada ejecución cuenta. Un flujo de
diez pasos que corre mil veces al mes son diez mil operaciones. La factura
crece con el uso, y crece rápido cuando el sistema funciona bien y lo usas más.

**n8n autoalojado cobra por servidor.** Un VPS de 5-10 € al mes aguanta
muchísimo. Da igual si el flujo corre cien veces o cien mil: pagas lo mismo.

Esa diferencia no se nota el primer mes. Se nota al sexto, cuando ya tienes
quince automatizaciones corriendo.

## Cuándo elegir Make

Sin ironía: hay casos claros donde Make es la respuesta correcta.

- **No hay nadie técnico** en la empresa y no lo va a haber.
- Son **pocas automatizaciones** y de poco volumen.
- Quieres montarlo tú mismo sin tocar un servidor.
- Prefieres pagar más a cambio de que el mantenimiento no sea tu problema.

Make tiene mejor interfaz para alguien que empieza, y eso vale dinero.

## Cuándo elegir n8n

- **Volumen**: en cuanto las ejecuciones suben, el ahorro es grande.
- **Datos sensibles**: si mueves datos de clientes, tenerlos en tu servidor
  simplifica mucho la conversación de protección de datos.
- **Lógica complicada**: n8n deja escribir JavaScript dentro del flujo, y hay
  cosas que en bloques visuales son un infierno y en seis líneas de código son
  triviales.
- **Quieres que el sistema sea tuyo**: sin depender de que una empresa cambie
  precios o cierre.

## Lo que aprendí usando n8n en producción

**Las ejecuciones se borran solas.** Por defecto solo guarda unos días de
historial. Eso significa que "0 ejecuciones" en un flujo **no prueba que esté
muerto**: puede que simplemente haya pasado la poda. Me costó un susto
entenderlo.

**La zona horaria hay que fijarla.** Si la instancia corre en UTC y programas
algo "a las 9", puede dispararse con horas de desfase. Se configura por flujo,
y conviene hacerlo desde el principio.

**Un flujo sin vigilancia es un flujo que fallará en silencio.** Tengo siempre
un flujo que vigila a los demás cada pocos minutos y avisa por Telegram. Es lo
primero que monto en cualquier instancia nueva.

**Cuidado con reintentar errores de cuota.** Si un servicio te bloquea por
exceso de llamadas, reintentar automáticamente perpetúa el bloqueo. Hay que
distinguir el error que se arregla reintentando del que se empeora.

## La tercera opción: ninguno de los dos

A veces la respuesta correcta es **un script**.

Si lo que necesitas es una cosa concreta que corre una vez al día y nadie más
va a tocar, un programa de treinta líneas en el servidor es más fiable, más
barato y más fácil de entender que un flujo visual.

Las herramientas visuales brillan cuando hay **muchas integraciones** y alguien
no técnico tiene que ver qué está pasando. Para una tarea aislada, suelen ser
más complicación que ayuda.

## Resumen

| Situación | Elige |
|---|---|
| Sin perfil técnico, poco volumen | Make |
| Volumen alto o creciente | n8n autoalojado |
| Datos personales de clientes | n8n autoalojado |
| Lógica complicada | n8n |
| Una sola tarea, sin integraciones | Un script |
