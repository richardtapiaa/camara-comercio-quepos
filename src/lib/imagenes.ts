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

// Para la galería: una versión grande (para verla ampliada) y miniaturas en varios anchos (srcset) para el mosaico,
// más el ancho y alto originales para reservar el espacio con su proporción real. Ninguna se agranda
export async function variantesGaleria(imagen: ImageMetadata) {
  const anchosMiniatura = [360, 600, 900].filter((ancho) => ancho < imagen.width);
  const miniaturas = await Promise.all(
    anchosMiniatura.map(async (ancho) => ({ ancho, src: await optimizarImagen(imagen, ancho, 70) })),
  );
  return {
    src: await optimizarImagen(imagen, 1600),
    miniatura: miniaturas.at(-1)?.src ?? (await optimizarImagen(imagen, imagen.width, 70)),
    srcSet: miniaturas.map(({ ancho, src }) => `${src} ${ancho}w`).join(", "),
    ancho: imagen.width,
    alto: imagen.height,
  };
}
