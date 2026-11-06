import { getImage } from "astro:assets";
import lapa from "../../assets/quepos/lapa-sin-fondo.webp";

const chicas = await Promise.all(
  [320, 480].map(async (ancho) => `${(await getImage({ src: lapa, width: ancho, format: "webp", quality: 85 })).src} ${ancho}w`),
);

export const lapaImagen = {
  src: lapa.src,
  srcset: [...chicas, `${lapa.src} ${lapa.width}w`].join(", "),
  sizes: "(min-width: 768px) min(30vw, 448px), min(50vw, 448px)",
  width: lapa.width,
  height: lapa.height,
};
