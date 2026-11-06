import { readFile, writeFile } from "node:fs/promises";

const ENTRADA = "herramientas/datos/distritos-quepos";
const SALIDA = "src/data/mapa-quepos.json";
const ANCHO = 1000;
const TOLERANCIA = 0.8;

const distritos = [
  { codigo: "60601", id: "quepos", nombre: "Quepos" },
  { codigo: "60602", id: "savegre", nombre: "Savegre" },
  { codigo: "60603", id: "naranjito", nombre: "Naranjito" },
];

for (const d of distritos) {
  const geo = JSON.parse(await readFile(`${ENTRADA}/${d.codigo}.geojson`, "utf8"));
  const g = geo.geometry ?? geo.features[0].geometry;
  d.anillos = g.type === "Polygon" ? g.coordinates : g.coordinates.flat();
}

const todos = distritos.flatMap((d) => d.anillos.flat());
const lons = todos.map((p) => p[0]);
const lats = todos.map((p) => p[1]);
const [minLon, maxLon, minLat, maxLat] = [Math.min(...lons), Math.max(...lons), Math.min(...lats), Math.max(...lats)];
const cosLat = Math.cos((((minLat + maxLat) / 2) * Math.PI) / 180);
const escala = ANCHO / ((maxLon - minLon) * cosLat);
const ALTO = Math.ceil((maxLat - minLat) * escala);
const proyectar = ([lon, lat]) => [(lon - minLon) * cosLat * escala, (maxLat - lat) * escala];

function simplificar(puntos, tol) {
  if (puntos.length < 3) return puntos;
  const [a, b] = [puntos[0], puntos.at(-1)];
  let maxDist = 0;
  let indice = 0;
  for (let i = 1; i < puntos.length - 1; i++) {
    const [x, y] = puntos[i];
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const largo = Math.hypot(dx, dy) || 1;
    const dist = Math.abs(dy * x - dx * y + b[0] * a[1] - b[1] * a[0]) / largo;
    if (dist > maxDist) [maxDist, indice] = [dist, i];
  }
  if (maxDist <= tol) return [a, b];
  return [...simplificar(puntos.slice(0, indice + 1), tol).slice(0, -1), ...simplificar(puntos.slice(indice), tol)];
}

function simplificarAnillo(anillo, tol) {
  const [x0, y0] = anillo[0];
  let lejano = 1;
  for (let i = 1; i < anillo.length; i++) {
    if (Math.hypot(anillo[i][0] - x0, anillo[i][1] - y0) > Math.hypot(anillo[lejano][0] - x0, anillo[lejano][1] - y0)) lejano = i;
  }
  return [...simplificar(anillo.slice(0, lejano + 1), tol).slice(0, -1), ...simplificar(anillo.slice(lejano), tol)];
}

const areaPlano = (anillo) =>
  Math.abs(anillo.reduce((s, [x, y], i) => s + x * anillo[(i + 1) % anillo.length][1] - anillo[(i + 1) % anillo.length][0] * y, 0)) / 2;

function centroide(anillo) {
  let [cx, cy, a] = [0, 0, 0];
  for (let i = 0; i < anillo.length; i++) {
    const [x0, y0] = anillo[i];
    const [x1, y1] = anillo[(i + 1) % anillo.length];
    const f = x0 * y1 - x1 * y0;
    [cx, cy, a] = [cx + (x0 + x1) * f, cy + (y0 + y1) * f, a + f];
  }
  return [cx / (3 * a), cy / (3 * a)];
}

const kmPorUnidad = (maxLat - minLat) * 111.32 / ALTO;
const redondear = (n) => Math.round(n * 10) / 10;

const salida = {
  fuente: "https://github.com/schweini/CR_distritos_geojson (Apache 2.0)",
  viewBox: `0 0 ${ANCHO} ${ALTO}`,
  distritos: distritos.map(({ id, nombre, codigo, anillos }) => {
    const proyectados = anillos.map((anillo) => anillo.map(proyectar));
    const simplificados = proyectados
      .map((anillo) => simplificarAnillo(anillo, TOLERANCIA))
      .filter((anillo) => anillo.length >= 4 && areaPlano(anillo) > 1);
    const d = simplificados
      .map((anillo) => `M${anillo.map(([x, y]) => `${redondear(x)} ${redondear(y)}`).join("L")}Z`)
      .join("");
    const area = proyectados.reduce((s, anillo) => s + areaPlano(anillo), 0) * kmPorUnidad ** 2;
    const mayor = simplificados.reduce((m, anillo) => (areaPlano(anillo) > areaPlano(m) ? anillo : m));
    const [lx, ly] = centroide(mayor);
    return { id, nombre, codigo, d, areaKm2: Math.round(area), etiqueta: [Math.round(lx), Math.round(ly)] };
  }),
};

await writeFile(SALIDA, JSON.stringify(salida));
const peso = Buffer.byteLength(JSON.stringify(salida));
console.log(`Listo: ${SALIDA} (${(peso / 1024).toFixed(1)} KB, viewBox ${salida.viewBox})`);
for (const d of salida.distritos) console.log(`  ${d.nombre}: ${d.areaKm2} km², etiqueta en ${d.etiqueta}`);
