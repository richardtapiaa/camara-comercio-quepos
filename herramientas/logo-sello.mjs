import sharp from "sharp";

const ENTRADA = "src/assets/compartido/logo-camara.webp";
const SALIDA = "src/assets/compartido/logo-camara-sello.webp";
const COLOR = "#2b4a5c";
const ESCALA = 2;

const logo = sharp(ENTRADA);
const { width, height } = await logo.metadata();

const { data } = await logo.clone().ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const alfa = Buffer.alloc(width * height);
for (let i = 0; i < alfa.length; i++) {
  const [r, g, b, a] = data.subarray(i * 4, i * 4 + 4);
  const blanco = Math.min(r, g, b) > 225;
  alfa[i] = blanco ? 0 : a;
}
const silueta = await sharp({ create: { width, height, channels: 3, background: COLOR } })
  .joinChannel(alfa, { raw: { width, height, channels: 1 } })
  .png()
  .toBuffer();

const relleno = 34;
const grosorFuera = 8;
const grosorDentro = 2.5;
const separacion = 9;
const ancho = width + relleno * 2;
const alto = height + relleno * 2;
const total = separacion + grosorFuera;
const margen = total + 6;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${(ancho + margen * 2) * ESCALA}" height="${(alto + margen * 2) * ESCALA}"
  viewBox="${-margen} ${-margen} ${ancho + margen * 2} ${alto + margen * 2}">
  <defs>
    <filter id="tinta" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="3" seed="7" result="ruido"/>
      <feColorMatrix in="ruido" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1.2 0 0 0 0.45" result="presion"/>
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" seed="3" result="grano"/>
      <feColorMatrix in="grano" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0.6 0 0 0 0.75" result="granoAlfa"/>
      <feComposite in="presion" in2="granoAlfa" operator="arithmetic" k1="1" result="textura"/>
      <feComposite in="SourceGraphic" in2="textura" operator="in"/>
    </filter>
  </defs>
  <g filter="url(#tinta)" fill="none" stroke="${COLOR}">
    <rect x="${-total + grosorFuera / 2}" y="${-total + grosorFuera / 2}" width="${ancho + (total - grosorFuera / 2) * 2}"
      height="${alto + (total - grosorFuera / 2) * 2}" rx="34" stroke-width="${grosorFuera}"/>
    <rect x="0" y="0" width="${ancho}" height="${alto}" rx="24" stroke-width="${grosorDentro}"/>
    <image href="data:image/png;base64,${silueta.toString("base64")}" x="${relleno}" y="${relleno}" width="${width}" height="${height}"/>
  </g>
</svg>`;

await sharp(Buffer.from(svg)).webp({ quality: 70, alphaQuality: 70, effort: 6 }).toFile(SALIDA);
const meta = await sharp(SALIDA).metadata();
console.log(`Listo: ${SALIDA} (${meta.width}×${meta.height})`);
