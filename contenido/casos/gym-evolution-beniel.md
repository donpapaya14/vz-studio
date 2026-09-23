---
titulo: Web para un gimnasio y club de combate de pueblo
descripcion: Un gimnasio con años de historia y club de combate propio. Web a medida con el carácter de su marca, vídeos grabados en el club y un panel para publicar sin tocar código.
fecha: 2026-09-23
etiqueta: Gimnasio · Club de combate
cliente: Gym Evolution Beniel
lectura: 4 min
---

## El problema

Gym Evolution es el gimnasio grande de Beniel, en Murcia: sala de
musculación, clases dirigidas y un club de combate con boxeo, grappling y
judo. Lleva años funcionando por el boca a boca y por Instagram.

Lo que no tenía era un sitio al que mandar a alguien. Quien buscaba gimnasio
en la zona encontraba una ficha de Google y poco más: ni horarios claros, ni
qué incluye la cuota, ni cómo es por dentro.

Y su marca no es la de una cadena. Es negro, blanco y rojo sangre, una
calavera con katanas en el logo y un cartel en la entrada que dice que si no
vienes a dejarte el alma, ese no es tu sitio. Una plantilla de gimnasio
genérica lo habría borrado todo.

## Qué se construyó

**Una web con su carácter, no con el de una plantilla.** La paleta y el tono
salen de su logo y de sus carteles. Los titulares entran golpeando al hacer
scroll, con animación hecha a mano en GSAP.

**Vídeos del club real.** El dueño grabó con el móvil la sala, el tatami, el
ring y la zona de piernas, y se montaron en piezas cortas y ligeras para la
web. Quien entra ve el sitio tal como es antes de ir.

**Lo que el socio pregunta, a la vista.** Horarios reales —incluido el fin de
semana, cuando otros gimnasios de la zona cierran—, clases incluidas en la cuota y el club de
combate con su metodología explicada.

**Un panel para el dueño.** Desde un enlace privado publica fotos, eventos y
ofertas con fecha de caducidad; salen en la web solas y desaparecen cuando
vencen. El panel además le genera la imagen para el post y la historia de
Instagram, sin hacer capturas.

## Cómo se entregó

HTML, CSS y JavaScript a mano, alojado en Cloudflare Pages con su propio
dominio, `gymevolution.es`. Coste de hosting: cero. Las fuentes y librerías
van servidas desde la propia web, así que no hace falta banner de cookies.

El panel tiene tests automáticos de principio a fin en cuatro navegadores,
porque lo va a usar alguien que no es técnico, desde el móvil, entre clase y
clase.

## Qué cambió

Está **en producción** en `gymevolution.es`.

No voy a inventar métricas: la web es nueva y todavía no hay datos
suficientes de tráfico ni de altas que atribuirle. Lo verificable es que el
gimnasio tiene por fin una web propia, rápida, con su identidad y que el
dueño actualiza él solo.

## Lo que me llevo

Que en un negocio local **lo que más vende es enseñar el sitio de verdad**.
Los vídeos grabados con el móvil del dueño funcionan mejor que cualquier
imagen de banco, porque son la sala en la que vas a entrenar mañana.
