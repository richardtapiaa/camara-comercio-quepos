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
