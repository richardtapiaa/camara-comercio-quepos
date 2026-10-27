// Sirve dist/ (el sitio ya compilado con `npm run build`) como lo haría un hosting: con gzip y con la 404 propia.
// Lo usan herramientas/medir-rendimiento.mjs y las pruebas de Playwright (playwright.config.ts).
// Uso directo: node herramientas/servidor-estatico.mjs [puerto]
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

const DIST = fileURLToPath(new URL("../dist/", import.meta.url));

const TIPOS = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".xml": "application/xml",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
};
// Lo que un hosting comprime (las imágenes, fuentes y videos ya vienen comprimidos)
const COMPRIMIBLE = new Set([".html", ".js", ".mjs", ".css", ".json", ".xml", ".txt", ".svg"]);

const existe = (ruta) => stat(ruta).then((s) => s, () => null);

// /quepos/ → dist/quepos/index.html; /quepos → redirige a /quepos/ (como Netlify, Vercel o GitHub Pages)
const resolver = async (pathname) => {
  const ruta = normalize(join(DIST, decodeURIComponent(pathname)));
  if (!ruta.startsWith(DIST)) return null;
  const info = await existe(ruta);
  if (info?.isFile()) return { archivo: ruta };
  if (info?.isDirectory()) {
    if (!pathname.endsWith("/")) return { redirigir: pathname + "/" };
    if (await existe(join(ruta, "index.html"))) return { archivo: join(ruta, "index.html") };
  }
  return null;
};

export const iniciarServidor = (puerto = 4330) =>
  new Promise((listo) => {
    const servidor = createServer(async (pedido, respuesta) => {
      const { pathname } = new URL(pedido.url, "http://localhost");
      const encontrado = await resolver(pathname);
      if (encontrado?.redirigir) {
        respuesta.writeHead(301, { Location: encontrado.redirigir }).end();
        return;
      }
      const archivo = encontrado?.archivo ?? join(DIST, "404.html");
      const extension = extname(archivo);
      let cuerpo = await readFile(archivo);
      const cabeceras = { "Content-Type": TIPOS[extension] ?? "application/octet-stream" };
      if (COMPRIMIBLE.has(extension) && /\bgzip\b/.test(pedido.headers["accept-encoding"] ?? "")) {
        cuerpo = gzipSync(cuerpo);
        cabeceras["Content-Encoding"] = "gzip";
      }
      // Los archivos de _astro/ llevan un hash en el nombre: se pueden guardar en caché para siempre
      if (pathname.startsWith("/_astro/")) cabeceras["Cache-Control"] = "public, max-age=31536000, immutable";
      respuesta.writeHead(encontrado ? 200 : 404, cabeceras).end(cuerpo);
    });
    servidor.listen(puerto, () => listo(servidor));
  });

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const puerto = Number(process.argv[2]) || 4330;
  await iniciarServidor(puerto);
  console.log(`dist/ en http://localhost:${puerto}`);
}
