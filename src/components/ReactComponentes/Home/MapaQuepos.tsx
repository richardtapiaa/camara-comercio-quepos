import mapa from "../../../data/mapa-quepos.json";

type IdDistrito = "quepos" | "savegre" | "naranjito";

const estilo: Record<IdDistrito, { color: string; etiqueta?: [number, number]; enlace?: string }> = {
  quepos: {
    color: "#6fa9a2",
    etiqueta: [315, 395],
    enlace: "/quepos",
  },
  savegre: { color: "#93a77f", enlace: "/savegre" },
  naranjito: { color: "#cf8f5f", etiqueta: [380, 222], enlace: "/naranjito" },
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
            stroke={d.color}
            strokeWidth={1.5}
            strokeLinejoin="round"
            className={
              d.enlace
                ? "transition-[filter] duration-300 group-hover:brightness-90 group-focus-visible:brightness-90 motion-reduce:transition-none"
                : undefined
            }
          />
        );
        return d.enlace ? (
          <a key={d.id} href={d.enlace} data-distrito={d.id} aria-label={`Conozca el distrito de ${d.nombre}`} className="group cursor-pointer outline-none">
            {forma}
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
