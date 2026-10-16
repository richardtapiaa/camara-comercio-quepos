import { getImage } from "astro:assets";
import type { ImageMetadata } from "astro";

// Devuelve la URL de una versión WebP más liviana de la imagen, para los componentes que reciben solo la URL
// (componentes de React, <img> de fondo). No la agranda si el original es más angosto que `ancho`
export async function optimizarImagen(imagen: ImageMetadata, ancho: number, calidad = 75) {
  const optimizada = await getImage({
    src: imagen,
    width: Math.min(ancho, imagen.width),
    format: "webp",
    quality: calidad,
  });
  return optimizada.src;
}
