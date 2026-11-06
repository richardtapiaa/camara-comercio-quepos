#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

ORIGEN=../videos-originales
HILOS=$(nproc)

generar() {
  local carpeta=public/$1 video=$2 filtro=$3 crf=$4 calidad=$5
  shift 5
  local tmp
  tmp=$(mktemp -d)

  ffmpeg -v error "$@" -i "$ORIGEN/$video" -vf "$filtro,format=rgb24" -start_number 1 "$tmp/frame_%03d.png"

  rm -rf "$carpeta"
  mkdir -p "$carpeta"
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

generar malecon NAHOMI-mejorado.webm "fps=12,scale=1440:810:flags=lanczos" 43 60
generar malecon-mobile NAHOMI-mejorado.webm "fps=12,crop=606:1080" 43 60

generar malecon-2 video-quepos-scroll.mp4 "fps=12" 38 70 -ss 5 -t 11.875
generar malecon-2-mobile video-quepos-scroll.mp4 "fps=12" 42 65 -ss 5 -t 11.875
