// Prepara los logos de las instituciones colaboradoras (src/assets/inicio/*.png) para el carrusel del inicio:
// les quita el margen transparente (traen mucho y de distinto tamaño, así que se veían desparejos) y los guarda en
// WebP a 240 px de alto como máximo (se muestran a ~64 px: alcanza para pantallas de alta densidad).
// Los PNG originales no se tocan. Solo hay que volver a correrlo si se agrega o cambia un logo.
// Uso: node herramientas/logos-colaboradores.mjs
import { mkdir } from "node:fs/promises";
import sharp from "sharp";

const ENTRADA = "src/assets/inicio";
const SALIDA = "src/assets/inicio/colaboradores";
const logos = ["canatur-logo", "ict-logo", "ina-logo", "manuel-antonio-park"];

await mkdir(SALIDA, { recursive: true });
for (const nombre of logos) {
  const destino = `${SALIDA}/${nombre}.webp`;
  const { width, height } = await sharp(`${ENTRADA}/${nombre}.png`)
    .trim()
    .resize({ height: 240, withoutEnlargement: true })
    .webp({ quality: 85, alphaQuality: 90, effort: 6 })
    .toFile(destino);
  console.log(`${destino} (${width}×${height})`);
}
