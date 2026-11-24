import sharp from "sharp";

const PORTADAS = [
  {
    foto: "src/assets/savegre/catarata-savegre.webp",
    proporcion: 5 / 6,
    izquierda: (ancho, _alto, anchoCorte) => (ancho - anchoCorte) * 0.25,
  },
  {
    foto: "src/assets/naranjito/naranjito-hero.webp",
    proporcion: 0.95,
    izquierda: (_ancho, alto) => alto * 0.25,
  },
  {
    foto: "src/assets/bolsa-empleo/cocineros-parrilla.webp",
    proporcion: 5 / 6,
    izquierda: (ancho, _alto, anchoCorte) => (ancho - anchoCorte) * 0.6,
  },
  {
    foto: "src/assets/bolsa-empleo/artesano-trabajando.webp",
    proporcion: 1.1,
    izquierda: (ancho, _alto, anchoCorte) => (ancho - anchoCorte) * 0.62,
    altoFinal: 704,
  },
  {
    foto: "src/assets/bolsa-empleo/vendedor-sandias.webp",
    proporcion: 1.1,
    izquierda: (ancho, _alto, anchoCorte) => (ancho - anchoCorte) * 0.4,
    altoFinal: 704,
  },
  {
    foto: "src/assets/hospitalidad/vista-hotel-manuel-antonio.webp",
    proporcion: 5 / 6,
    izquierda: (ancho, _alto, anchoCorte) => (ancho - anchoCorte) * 0.5,
    altoFinal: 1440,
  },
  {
    foto: "src/assets/actividades/hero-visitanos.webp",
    proporcion: 5 / 6,
    izquierda: (ancho, _alto, anchoCorte) => (ancho - anchoCorte) * 0.5,
  },
  {
    foto: "src/assets/noticias/hero-noticias.webp",
    proporcion: 5 / 6,
    izquierda: (ancho, _alto, anchoCorte) => (ancho - anchoCorte) * 0.5,
  },
  {
    foto: "src/assets/unete/quepos-aerea.webp",
    proporcion: 5 / 6,
    izquierda: (ancho, _alto, anchoCorte) => (ancho - anchoCorte) * 0.5,
  },
  {
    foto: "src/assets/inicio/hero-quepos-inicio-poster.webp",
    proporcion: 4 / 5,
    izquierda: (ancho, _alto, anchoCorte) => ancho - anchoCorte,
  },
];

for (const { foto, proporcion, izquierda, altoFinal } of PORTADAS) {
  const imagen = sharp(foto);
  const { width, height } = await imagen.metadata();
  const anchoCorte = Math.round(height * proporcion);
  await imagen
    .extract({ left: Math.round(izquierda(width, height, anchoCorte)), top: 0, width: anchoCorte, height })
    .resize({ height: Math.min(altoFinal ?? height, height) })
    .webp({ quality: 92, smartSubsample: true, effort: 6 })
    .toFile(foto.replace(/\.\w+$/, "-celular.webp"));
}
