---
titulo: Rediseño y catálogo sincronizado para una inmobiliaria
descripcion: Tienda con miles de propiedades desincronizadas, web anticuada y ventas que se enfriaban el fin de semana. Rediseño, sincronización y bot de ventas.
fecha: 2026-08-10
etiqueta: Inmobiliaria
cliente: Comaskeys
lectura: 5 min
---

## El problema

Comaskeys vende en un mercado donde el comprador es internacional y compara
media docena de webs antes de escribir a ninguna. Tenían tres problemas a la
vez:

**La web no acompañaba.** Diseño antiguo para un producto que se vende por
imagen.

**El catálogo no cuadraba.** Miles de propiedades en el sistema, con fichas
duplicadas, propiedades que ya no existían y precios que no coincidían con lo
publicado. Un comprador que pregunta por algo que ya está vendido es una
conversación que empieza mal.

**Las consultas se enfriaban.** Lo que entraba un sábado por la tarde se
contestaba el lunes.

## Qué se construyó

**Rediseño del tema**, multi-idioma, sobre su plataforma existente. No se
migró: se reconstruyó encima de lo que ya tenían, porque migrar una tienda con
miles de referencias es un proyecto aparte y mucho más caro.

**Sincronización del catálogo.** Se hizo un espejo real de lo publicado:
alrededor de 6.000 propiedades, con **más de 3.400 fichas nuevas dadas de
alta**, casi 140 purgadas (con copia de seguridad antes) y 88 precios
corregidos. El objetivo no era tener más fichas, era que las que hay sean
ciertas.

**Bot de ventas.** Un agente atiende las consultas cuando no hay nadie,
cualifica y deja el contacto listo para el comercial. Incluye una lista de
no-contactar que se respeta en campañas y reenganches: si alguien pide la
baja, queda marcada antes de confirmársela.

## Los tropiezos que valen para cualquiera

**El constructor de la plataforma escapa los ampersands.** Un `&&` dentro de
un bloque de código se convierte en entidad HTML y tumba la página con un
error de sintaxis. Se pierde una tarde buscándolo si no lo sabes.

**Las plantillas de esa plataforma no admiten ciertos comentarios dentro de
formularios**, y algunas clases de maquetación no funcionan en línea.
Documentado para no volver a tropezar.

## Qué cambió

El rediseño está **en producción**. La sincronización se ejecutó completa y el
bot lleva desde julio de 2026 funcionando.

Queda pendiente, y lo digo porque es real: el relleno automático de
descripciones para las fichas que no la tienen, bloqueado porque la IP del
servidor de automatización está vetada en el origen. Es trabajo abierto, no
terminado.

## Lo que me llevo

Que **un catálogo con datos falsos hace más daño que una web fea**. Se puede
tener el mejor diseño del mundo: si el cliente pregunta por un piso vendido
hace seis meses, ya has perdido.
