#!/usr/bin/env bash
# Genera los cuadros de las animaciones del malecón (NahomiScroll y MaleconScroll) a partir de los videos originales,
# que están fuera del repositorio, en ../videos-originales. Los cuadros tampoco se suben a git (ver .gitignore), así
# que hay que correr esto antes de publicar el sitio. Necesita ffmpeg con libaom-av1 y libwebp.
#
# Uso (desde la carpeta frontend): bash herramientas/cuadros-malecon.sh
#
# Cada cuadro queda en AVIF, que es lo que descargan casi todos los navegadores, y en WebP como respaldo para los que
# no leen AVIF (Safari antes de 16.4); scripts/quepos/malecon-scroll.ts elige uno de los dos.
# Con los WebP de calidad alta que había antes la página de Quepos descargaba 107 MB en escritorio y 44 MB en celular.
set -euo pipefail
cd "$(dirname "$0")/.."

ORIGEN=../videos-originales
HILOS=$(nproc)

# carpeta: nombre dentro de public/ · video: archivo en ../videos-originales · filtro: cuadros por segundo, recorte y
# tamaño · crf: calidad del AVIF (más alto = más liviano) · calidad: la del WebP de respaldo · después, opciones de
# ffmpeg para elegir el tramo del video
generar() {
  local carpeta=public/$1 video=$2 filtro=$3 crf=$4 calidad=$5
  shift 5
  local tmp
  tmp=$(mktemp -d)

  # Los cuadros se sacan primero en PNG (sin pérdida) y se pasan a RGB con la misma conversión de color que se usó
  # siempre, para que los colores no cambien
  ffmpeg -v error "$@" -i "$ORIGEN/$video" -vf "$filtro,format=rgb24" -start_number 1 "$tmp/frame_%03d.png"

  rm -rf "$carpeta"
  mkdir -p "$carpeta"
  # El AVIF se etiqueta como sRGB: con la curva BT.709 del video, el navegador le aplicaría gestión de color de imagen
  export carpeta crf calidad
  find "$tmp" -name '*.png' -print0 | xargs -0 -P "$HILOS" -I{} sh -c '
    nombre=$(basename "{}" .png)
    ffmpeg -v error -y -i "{}" -vf "scale=out_color_matrix=bt709:out_range=tv,format=yuv420p" \
      -color_primaries bt709 -color_trc iec61966-2-1 -colorspace bt709 -color_range tv \
      -c:v libaom-av1 -still-picture 1 -crf "$crf" -cpu-used 4 -f avif "$carpeta/$nombre.avif"
    ffmpeg -v error -y -i "{}" -c:v libwebp -quality "$calidad" -compression_level 6 "$carpeta/$nombre.webp"
  '
  rm -rf "$tmp"
  echo "$carpeta:$(find "$carpeta" -name '*.avif' | wc -l) cuadros," \
    "AVIF $(du -ch "$carpeta"/*.avif | tail -1 | cut -f1), WebP $(du -ch "$carpeta"/*.webp | tail -1 | cut -f1)"
}

# NahomiScroll: el video completo (12 s) a 12 cuadros por segundo. En escritorio 1440×810: el lienzo lo estira a la
# pantalla y como fondo en movimiento casi no se nota la diferencia con 1920, pero pesa la mitad.
# En celular, recorte vertical 9:16 del centro.
generar malecon NAHOMI-mejorado.webm "fps=12,scale=1440:810:flags=lanczos" 43 60
generar malecon-mobile NAHOMI-mejorado.webm "fps=12,crop=606:1080" 43 60

# MaleconScroll: el tramo de 5 s a 16,875 s, a 12 cuadros por segundo (720×900, el tamaño del video)
generar malecon-2 video-quepos-scroll.mp4 "fps=12" 38 70 -ss 5 -t 11.875
generar malecon-2-mobile video-quepos-scroll.mp4 "fps=12" 42 65 -ss 5 -t 11.875
