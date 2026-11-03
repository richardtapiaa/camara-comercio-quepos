// Foto de la lapa roja en vuelo, con el mismo srcset y sizes en todas las lapas de la página (LapasJS y LapaArrastre):
// así el navegador descarga un solo archivo aunque la lapa aparezca varias veces
import { getImage } from "astro:assets";
import lapa from "../../assets/quepos/lapa-sin-fondo.webp";

// Versiones más chicas para pantallas angostas; la más grande es el archivo original
const chicas = await Promise.all(
  [320, 480].map(async (ancho) => `${(await getImage({ src: lapa, width: ancho, format: "webp", quality: 85 })).src} ${ancho}w`),
);

export const lapaImagen = {
  src: lapa.src,
  srcset: [...chicas, `${lapa.src} ${lapa.width}w`].join(", "),
  // w-[50%] en celular y md:w-[30%], con max-w-md (448 px)
  sizes: "(min-width: 768px) min(30vw, 448px), min(50vw, 448px)",
  width: lapa.width,
  height: lapa.height,
};
