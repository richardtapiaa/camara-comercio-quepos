// Mapa del cantón de Quepos con sus 3 distritos (Quepos, Savegre y Naranjito), con el nombre de cada uno encima.
// El distrito Quepos es un enlace a /quepos. Los trazos salen de src/data/mapa-quepos.json (se genera con
// herramientas/mapa-quepos.mjs).
// Se usa SIN directiva client:* (ver MapaQuepos.astro): el enlace y el resaltado al pasar el mouse son HTML y CSS,
// así que sale como SVG puro, sin React en el navegador. La animación al tocar Quepos es un script aparte en
// MapaQuepos.astro, que encuentra el mapa y el distrito por los atributos data-mapa-quepos y data-distrito.
import mapa from "../../../data/mapa-quepos.json";

type IdDistrito = "quepos" | "savegre" | "naranjito";

// Colores suaves, como tierra y vegetación
const estilo: Record<IdDistrito, { color: string; etiqueta?: [number, number]; enlace?: string }> = {
  quepos: {
    color: "#6fa9a2",
    // El centro del polígono queda pegado al borde con Naranjito: el nombre va más adentro
    etiqueta: [315, 395],
    enlace: "/quepos",
  },
  savegre: { color: "#93a77f" },
  // El centro del polígono está en la parte angosta: el nombre va en la parte ancha
  naranjito: { color: "#cf8f5f", etiqueta: [380, 222] },
};

const distritos = mapa.distritos.map((d) => {
  const e = estilo[d.id as IdDistrito];
  return { ...d, ...e, etiqueta: e.etiqueta ?? (d.etiqueta as [number, number]) };
});

export default function MapaQuepos() {
  return (
    <svg
      data-mapa-quepos=""
      viewBox={mapa.viewBox}
      className="h-auto w-full overflow-visible"
      role="group"
      aria-label="Mapa del cantón de Quepos con sus tres distritos: Quepos, Savegre y Naranjito"
    >
      {distritos.map((d) => {
        const forma = (
          <path
            d={d.d}
            fill={d.color}
            stroke="#ffffff"
            strokeWidth={3}
            strokeLinejoin="round"
            className={
              d.enlace
                ? "transition-[filter] duration-300 group-hover:brightness-90 group-focus-visible:brightness-90 motion-reduce:transition-none"
                : undefined
            }
          />
        );
        return d.enlace ? (
          // Enlace dentro del SVG: funciona con clic, toque y teclado (Tab + Enter) sin JavaScript
          <a key={d.id} href={d.enlace} data-distrito={d.id} aria-label={`Distrito ${d.nombre}: conozca Quepos`} className="group cursor-pointer outline-none">
            {forma}
            {/* Contorno visible al llegar con el teclado */}
            <path
              d={d.d}
              fill="none"
              stroke="#1d3542"
              strokeWidth={6}
              strokeLinejoin="round"
              className="pointer-events-none opacity-0 group-focus-visible:opacity-100"
            />
          </a>
        ) : (
          <g key={d.id} role="img" aria-label={`Distrito ${d.nombre}`}>
            {forma}
          </g>
        );
      })}

      {/* Nombres en mayúsculas encima de cada distrito (decorativos: cada distrito ya tiene su aria-label) */}
      {distritos.map((d) => (
        <text
          key={`n-${d.id}`}
          data-distrito={d.id}
          x={d.etiqueta[0]}
          y={d.etiqueta[1]}
          textAnchor="middle"
          dominantBaseline="middle"
          aria-hidden="true"
          className="pointer-events-none select-none fill-white font-extrabold uppercase"
          style={{ fontSize: 34, letterSpacing: "0.04em" }}
        >
          {d.nombre}
        </text>
      ))}
    </svg>
  );
}
