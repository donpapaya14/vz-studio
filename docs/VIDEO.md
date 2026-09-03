# Vídeo del hero — receta (2026-09-03)

Origen: 2 clips Veo 3 (Gemini Pro, ya pagado) generados por Vladys con el prompt
*"Macro shot, slow motion, dark graphite liquid metal surface with thin bright acid-green light threads flowing like data through circuit channels, seamless slow drift, no text, no logos, cinematic, 4k, 8 seconds"*.
Horizontal 1280x720 y vertical 720x1280, 10 s, 24 fps, con la marca ✦ de Gemini abajo-derecha.

## Pasos aplicados (ffmpeg 8.1)
1. **Marca de agua**: `delogo` sobre la zona del ✦ (horizontal `x=1120:y=560:w=90:h=80`, vertical `x=560:y=1115:w=90:h=85`). Sobre textura oscura no se nota.
2. **Loop sin corte**: se descarta el primer segundo y se funde el último segundo con ese primer segundo:
   `split[a][b];[a]trim=1:10,setpts=PTS-STARTPTS[a1];[b]trim=0:1,setpts=PTS-STARTPTS[b1];[a1][b1]xfade=transition=fade:duration=1:offset=8` → 9 s que empiezan y acaban en el mismo fotograma.
3. **Encode**: `libx264 -crf 34 -preset slow -an -movflags +faststart`, `fps=24`, `yuv420p`. Vertical escalado a 540x960 (`crf 31`).
4. **Pósters**: primer fotograma → `cwebp -q 82`.
5. **Fotogramas para scrub** (sección Automatización): `fps=8` sobre el loop → 72 webp en `assets/scrub/1280/` (q78) y `assets/scrub/640/` (q76).

## Resultado
| Archivo | Peso |
|---|---|
| `assets/hero-loop.mp4` (1280x720, 9 s) | 708 KB |
| `assets/hero-loop-v.mp4` (540x960, 9 s) | 504 KB |
| `assets/hero-poster.webp` / `hero-poster-v.webp` | 36 / 20 KB |
| `assets/scrub/1280/f_001..f_072.webp` | 2,7 MB (perezoso) |
| `assets/scrub/640/f_001..f_072.webp` | 1,2 MB (perezoso) |

Originales quedan en `~/Downloads/` (no se commitean).
