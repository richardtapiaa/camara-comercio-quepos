import { sello900, selloSizes, selloSrcSet } from "../../lib/sello";

interface Props {
  opacidad?: number;
  lado?: "derecha" | "izquierda";
  corrido?: boolean;
  claro?: boolean;
  fijo?: boolean;
  abajo?: boolean;
  prioritario?: boolean;
}

const clasesLado = {
  derecha: { fila: "justify-end", sello: "-mr-24 rotate-6 lg:-mr-28" },
  izquierda: { fila: "justify-start", sello: "-ml-24 -rotate-6 lg:-ml-28" },
};

const clasesAbajo = {
  derecha: "-mb-10 -mr-20 rotate-[14deg] sm:-mb-16 lg:-mb-24 lg:-mr-24",
  izquierda: "-mb-10 -ml-20 -rotate-[14deg] sm:-mb-16 lg:-mb-24 lg:-ml-24",
};

const clasesCorrido = {
  derecha: "-mr-48 rotate-6 lg:-mr-[22rem]",
  izquierda: "-ml-48 -rotate-6 lg:-ml-[22rem]",
};

export default function FondoSello({ opacidad = 0.1, lado = "derecha", corrido = false, claro = false, fijo = true, abajo = false, prioritario = false }: Props) {
  const clases = clasesLado[lado];
  const posicion = abajo ? clasesAbajo[lado] : corrido ? clasesCorrido[lado] : clases.sello;
  const claseSello = `${posicion} ${claro ? "brightness-0 invert" : ""}`;
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
      <div className={`${fijo ? "sticky top-0 h-svh" : "absolute inset-0"} flex ${abajo ? "items-end [mask-image:linear-gradient(to_bottom,#000_72%,transparent_100%)]" : "items-center"} overflow-hidden ${clases.fila}`}>
        <img
          src={sello900.src}
          srcSet={selloSrcSet}
          sizes={selloSizes}
          width={sello900.width}
          height={sello900.height}
          alt=""
          loading={prioritario ? "eager" : "lazy"}
          fetchPriority={prioritario ? "high" : undefined}
          decoding="async"
          draggable={false}
          style={{ opacity: opacidad }}
          className={`h-auto w-[380px] max-w-none select-none sm:w-[540px] lg:w-[780px] ${claseSello}`}
        />
      </div>
    </div>
  );
}
