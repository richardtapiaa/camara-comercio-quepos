// Genera src/assets/compartido/logo-camara-sello.webp: el logo de la Cámara como un sello de tinta de un solo color,
// con doble marco redondeado (como los sellos de goma), bordes limpios y una textura suave de tinta (unas zonas un
// poco más claras, como cuando el sello no se presiona parejo). Sin bordes rasgados ni huecos.
// Es un archivo fijo (la semilla del ruido hace que salga siempre igual): solo hay que volver a generarlo si cambia
// el logo o el color. La opacidad tenue no va aquí sino en el CSS de quien lo use.
// Uso: node herramientas/logo-sello.mjs
import sharp from "sharp";

const ENTRADA = "src/assets/compartido/logo-camara.webp";
const SALIDA = "src/assets/compartido/logo-camara-sello.webp";
const COLOR = "#2b4a5c"; // azul del sitio
const ESCALA = 2; // se dibuja al doble del logo original para que los bordes queden nítidos

const logo = sharp(ENTRADA);
const { width, height } = await logo.metadata();

// Silueta de una sola tinta. Se respeta la transparencia del logo (así los tres círculos que se cruzan se siguen
// distinguiendo) y las partes blancas (la vela) quedan como hueco
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

// Marco: uno grueso por fuera y uno fino por dentro, con esquinas redondeadas
const relleno = 34; // espacio entre el logo y el marco de adentro
const grosorFuera = 8;
const grosorDentro = 2.5;
const separacion = 9;
const ancho = width + relleno * 2;
const alto = height + relleno * 2;
const total = separacion + grosorFuera; // lo que el marco de afuera agrega por cada lado
const margen = total + 6;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${(ancho + margen * 2) * ESCALA}" height="${(alto + margen * 2) * ESCALA}"
  viewBox="${-margen} ${-margen} ${ancho + margen * 2} ${alto + margen * 2}">
  <defs>
    <filter id="tinta" x="-10%" y="-10%" width="120%" height="120%">
      <!-- Textura de tinta: un ruido suave que deja algunas zonas al ~85 % y la mayoría sólidas -->
      <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="3" seed="7" result="ruido"/>
      <feColorMatrix in="ruido" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1.2 0 0 0 0.45" result="presion"/>
      <!-- Grano fino, casi imperceptible, para que no se vea plano como un vector -->
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

// Calidad 70: se ve al ~11 % de opacidad, más calidad no se nota y pesa el doble
await sharp(Buffer.from(svg)).webp({ quality: 70, alphaQuality: 70, effort: 6 }).toFile(SALIDA);
const meta = await sharp(SALIDA).metadata();
console.log(`Listo: ${SALIDA} (${meta.width}×${meta.height})`);
