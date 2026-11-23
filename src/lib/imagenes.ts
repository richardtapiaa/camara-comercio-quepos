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
  const anchosMiniatura = [360, 480, 600, 750, 900].filter((ancho) => ancho < imagen.width);
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

// Limita la resolución a unos 2x: en pantallas más densas la diferencia no se aprecia y la foto pesa mucho más.
export const sizesHasta2x = (ancho: string) =>
  `(min-resolution: 3dppx) calc((${ancho}) * 0.667), (min-resolution: 2.5dppx) calc((${ancho}) * 0.76), calc(${ancho})`;

// Recortes de herramientas/portadas-celular.mjs. Hasta 430px de ancho el recuadro siempre es más angosto que el
// recorte, así que la foto se ajusta por alto y el encuadre es el mismo de la foto completa. Anchos y sizes se
// escalan con el recorte: cada pantalla recibe el mismo alto en píxeles que con la foto completa, sin los lados.
export async function recorteCelular(
  recorte: ImageMetadata,
  original: ImageMetadata,
  anchosOriginal: number[],
  sizesOriginal: string,
  calidadAvif = 55,
  media = "(max-width: 430px)",
) {
  const escala = recorte.width / recorte.height / (original.width / original.height);
  const anchos = anchosOriginal.map((ancho) => Math.round(ancho * escala));
  const [webp, avif] = await Promise.all([variantesCapa(recorte, anchos, 80), variantesCapa(recorte, anchos, calidadAvif, "avif")]);
  return { webp: webp.srcSet, avif: avif.srcSet, media, sizes: `calc(${sizesOriginal} * ${escala.toFixed(4)})` };
}

// Portadas que usan sizesCubrePantalla: en celular esa fórmula vale 50vh por la proporción de la foto.
export const portadaCelular = (recorte: ImageMetadata, original: ImageMetadata, anchos: number[], calidadAvif = 55) =>
  recorteCelular(recorte, original, anchos, `50vh * ${(original.width / original.height).toFixed(4)}`, calidadAvif);
