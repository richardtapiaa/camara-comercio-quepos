import { writeFile } from "node:fs/promises";

const ANCHO = 1440;
const ALTO = 80;

const crearAzar = (semilla) => {
  let estado = semilla;
  return () => {
    estado = (estado + 0x6d2b79f5) | 0;
    let t = Math.imul(estado ^ (estado >>> 15), 1 | estado);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

function crearBorde(semilla, abajo) {
  const azar = crearAzar(semilla);
  const ruido = (paso) => {
    const valores = Array.from({ length: Math.ceil(ANCHO / paso) + 2 }, () => azar() * 2 - 1);
    return (x) => {
      const i = Math.floor(x / paso);
      const t = x / paso - i;
      const s = t * t * (3 - 2 * t);
      return valores[i] * (1 - s) + valores[i + 1] * s;
    };
  };
  const capas = [ruido(300), ruido(140), ruido(60), ruido(24), ruido(9)];
  const pesos = [1, 0.8, 0.4, 0.15, 0.05];
  const anchoFibra = ruido(40);
  const profundidad = (x) => 40 + 30 * Math.tanh(1.3 * capas.reduce((suma, capa, i) => suma + capa(x) * pesos[i], 0));

  const camino = (extra, temblor) => {
    const puntos = [];
    for (let x = 0; ; x = Math.min(ANCHO, x + 3 + azar() * 5)) {
      const d = profundidad(x) + extra(x) + (azar() - 0.5) * temblor;
      puntos.push(`${x.toFixed(1)} ${(abajo ? ALTO - d : d).toFixed(1)}`);
      if (x === ANCHO) break;
    }
    const borde = abajo ? ALTO : 0;
    return `M0 ${borde} L${puntos.join(" L")} L${ANCHO} ${borde} Z`;
  };
  return { papel: camino(() => 0, 1.4), fibra: camino((x) => 2.5 + 3 * anchoFibra(x), 3) };
}

const dibujar = ({ papel, fibra }) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${ANCHO} ${ALTO}" preserveAspectRatio="none">
  <path d="${fibra}" fill="#fff" fill-opacity="0.5"/>
  <path d="${papel}" fill="#fff"/>
</svg>
`;

for (const [nombre, semilla, abajo] of [["arriba", 7, false], ["abajo", 29, true]]) {
  const archivo = new URL(`../src/assets/quepos/borde-rasgado-${nombre}.svg`, import.meta.url);
  await writeFile(archivo, dibujar(crearBorde(semilla, abajo)));
  console.log(`Listo: src/assets/quepos/borde-rasgado-${nombre}.svg`);
}
