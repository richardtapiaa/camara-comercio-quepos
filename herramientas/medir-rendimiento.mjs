// Mide todas las páginas de dist/ con Lighthouse (perfil de celular con red 4G lenta simulada, el mismo de PageSpeed
// Insights) y avisa cuáles pasan los límites de Core Web Vitals. Son mediciones de laboratorio: los datos reales
// de los visitantes (Search Console, CrUX) pueden ser distintos.
// Uso: npm run build && npm run rendimiento [-- --repeticiones=3] [-- --paginas=/,/quepos/] [-- --red-real]
// Con --red-real la red lenta se aplica de verdad en vez de estimarse: tarda más, pero el LCP se parece más al de un
// celular real (la estimación de Lighthouse suele exagerarlo en páginas con muchas imágenes)
// Los informes completos (HTML, se abren en el navegador) quedan en informes-lighthouse/.
import { mkdir, readdir, writeFile } from "node:fs/promises";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import * as chromeLauncher from "chrome-launcher";
import lighthouse from "lighthouse";
import { iniciarServidor } from "./servidor-estatico.mjs";

const PUERTO = 4331;
const DIST = fileURLToPath(new URL("../dist/", import.meta.url));
const INFORMES = fileURLToPath(new URL("../informes-lighthouse/", import.meta.url));

// Límites de "bueno" de Google. TBT es la métrica de laboratorio que más se relaciona con INP
const LIMITES = { lcp: 2500, cls: 0.1, tbt: 200 };

const opcion = (nombre) => process.argv.find((a) => a.startsWith(`--${nombre}=`))?.split("=")[1];
const repeticiones = Math.max(1, Number(opcion("repeticiones")) || 1);
const redReal = process.argv.includes("--red-real");

const buscarPaginas = async (carpeta) => {
  const paginas = [];
  for (const entrada of await readdir(carpeta, { withFileTypes: true })) {
    const ruta = join(carpeta, entrada.name);
    if (entrada.isDirectory() && entrada.name !== "_astro") paginas.push(...(await buscarPaginas(ruta)));
    else if (entrada.name === "index.html") paginas.push("/" + relative(DIST, carpeta).split(sep).join("/"));
  }
  return paginas;
};
const paginas = opcion("paginas")?.split(",") ?? (await buscarPaginas(DIST)).map((p) => (p === "/" ? p : p + "/")).sort();

const mediana = (valores) => [...valores].sort((a, b) => a - b)[Math.floor(valores.length / 2)];

await mkdir(INFORMES, { recursive: true });
const servidor = await iniciarServidor(PUERTO);
const chrome = await chromeLauncher.launch({ chromeFlags: ["--headless=new", "--no-sandbox"] });

const filas = [];
try {
  for (const pagina of paginas) {
    const corridas = [];
    for (let i = 0; i < repeticiones; i++) {
      if (process.stdout.isTTY) process.stdout.write(`\r${pagina} (${i + 1}/${repeticiones})…`.padEnd(60));
      const { lhr, report } = await lighthouse(
        `http://localhost:${PUERTO}${pagina}`,
        {
          port: chrome.port,
          output: "html",
          logLevel: "error",
          onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
          ...(redReal && { throttlingMethod: "devtools" }),
        },
      );
      corridas.push(lhr);
      if (i === 0) {
        const nombre = pagina === "/" ? "inicio" : pagina.replaceAll("/", "");
        await writeFile(join(INFORMES, `${nombre}.html`), report);
      }
    }
    const valor = (auditoria) => mediana(corridas.map((r) => r.audits[auditoria].numericValue));
    const puntaje = (categoria) => mediana(corridas.map((r) => Math.round(r.categories[categoria].score * 100)));
    filas.push({
      pagina,
      rendimiento: puntaje("performance"),
      accesibilidad: puntaje("accessibility"),
      practicas: puntaje("best-practices"),
      seo: puntaje("seo"),
      fcp: valor("first-contentful-paint"),
      lcp: valor("largest-contentful-paint"),
      tbt: valor("total-blocking-time"),
      cls: valor("cumulative-layout-shift"),
      peso: valor("total-byte-weight"),
    });
  }
} finally {
  await chrome.kill();
  servidor.close();
}

if (process.stdout.isTTY) process.stdout.write("\r".padEnd(60) + "\r");
const segundos = (ms) => (ms / 1000).toFixed(1) + " s";
console.table(
  Object.fromEntries(
    filas.map((f) => [
      f.pagina,
      {
        Rend: f.rendimiento,
        A11y: f.accesibilidad,
        BP: f.practicas,
        SEO: f.seo,
        FCP: segundos(f.fcp),
        LCP: segundos(f.lcp),
        TBT: Math.round(f.tbt) + " ms",
        CLS: f.cls.toFixed(3),
        Peso: Math.round(f.peso / 1024) + " KB",
      },
    ]),
  ),
);

const excedidas = filas.flatMap((f) =>
  [
    f.lcp > LIMITES.lcp && `${f.pagina}: LCP ${segundos(f.lcp)} (límite ${segundos(LIMITES.lcp)})`,
    f.cls > LIMITES.cls && `${f.pagina}: CLS ${f.cls.toFixed(3)} (límite ${LIMITES.cls})`,
    f.tbt > LIMITES.tbt && `${f.pagina}: TBT ${Math.round(f.tbt)} ms (límite ${LIMITES.tbt} ms)`,
  ].filter(Boolean),
);
console.log(excedidas.length ? `\nFuera de los límites:\n- ${excedidas.join("\n- ")}` : "\nTodas las páginas dentro de los límites.");
console.log(`Informes completos en ${relative(process.cwd(), INFORMES) || "."}/ (uno por página)`);
await writeFile(
  join(INFORMES, "resumen.json"),
  JSON.stringify({ fecha: new Date().toISOString(), repeticiones, redReal, filas }, null, 2),
);
