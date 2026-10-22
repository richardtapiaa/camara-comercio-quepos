import { getImage } from "astro:assets";
import type { ImageMetadata } from "astro";

// Devuelve la URL de una versión más liviana de la imagen (WebP, o AVIF si se pide), para los componentes que reciben
// solo la URL (componentes de React, <img> de fondo). No la agranda si el original es más angosto que `ancho`
export async function optimizarImagen(imagen: ImageMetadata, ancho: number, calidad = 75, formato: "webp" | "avif" = "webp") {
  const optimizada = await getImage({
    src: imagen,
    width: Math.min(ancho, imagen.width),
    format: formato,
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

// Para los heros en capas (foto + recorte del primer plano encima): la misma imagen en varios anchos (srcset), así el
// celular baja una versión chica y no la de 2560 px. Las dos capas usan los mismos anchos y el mismo `sizes`, por eso
// el navegador elige el mismo tamaño para las dos y siguen calzando. Ninguna se agranda
export async function variantesCapa(imagen: ImageMetadata, anchos: number[], calidad: number, formato: "webp" | "avif" = "webp") {
  const validos = [...new Set(anchos.map((ancho) => Math.min(ancho, imagen.width)))];
  const versiones = await Promise.all(
    validos.map(async (ancho) => ({ ancho, src: await optimizarImagen(imagen, ancho, calidad, formato) })),
  );
  return {
    src: versiones.at(-1)!.src,
    srcSet: versiones.map(({ ancho, src }) => `${src} ${ancho}w`).join(", "),
  };
}

// `sizes` de una foto que cubre toda la pantalla como object-cover: si la pantalla es más ancha (en proporción) que la
// foto, la foto mide el ancho de la pantalla; si no, se agranda hasta cubrir el alto (alto × proporción de la foto).
// En celular (pantalla angosta) la foto cubre el alto y queda mucho más ancha que la pantalla (los costados se
// recortan), y con la densidad de 3x el navegador pediría la versión más grande: ahí se declara la mitad, así baja
// una versión de ~1,5x, suficiente para un fondo
export const sizesCubrePantalla = (imagen: ImageMetadata) => {
  const proporcion = (imagen.width / imagen.height).toFixed(4);
  return `(max-width: 767px) calc(50vh * ${proporcion}), (min-aspect-ratio: ${imagen.width}/${imagen.height}) 100vw, calc(100vh * ${proporcion})`;
};
