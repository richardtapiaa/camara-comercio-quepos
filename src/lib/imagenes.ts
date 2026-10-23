import { getImage } from "astro:assets";
import type { ImageMetadata } from "astro";

export async function optimizarImagen(imagen: ImageMetadata, ancho: number, calidad = 75, formato: "webp" | "avif" = "webp") {
  const optimizada = await getImage({
    src: imagen,
    width: Math.min(ancho, imagen.width),
    format: formato,
    quality: calidad,
  });
  return optimizada.src;
}

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

export const sizesCubrePantalla = (imagen: ImageMetadata) => {
  const proporcion = (imagen.width / imagen.height).toFixed(4);
  return `(max-width: 767px) calc(50vh * ${proporcion}), (min-aspect-ratio: ${imagen.width}/${imagen.height}) 100vw, calc(100vh * ${proporcion})`;
};
