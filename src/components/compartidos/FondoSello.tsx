import logoSello from "../../assets/compartido/logo-camara-sello.webp";

interface Props {
  opacidad?: number;
  lado?: "derecha" | "izquierda";
  corrido?: boolean;
  claro?: boolean;
  fijo?: boolean;
}

const clasesLado = {
  derecha: { fila: "justify-end", sello: "-mr-24 rotate-6 lg:-mr-28" },
  izquierda: { fila: "justify-start", sello: "-ml-24 -rotate-6 lg:-ml-28" },
};

const clasesCorrido = {
  derecha: "-mr-48 rotate-6 lg:-mr-[22rem]",
  izquierda: "-ml-48 -rotate-6 lg:-ml-[22rem]",
};

export default function FondoSello({ opacidad = 0.1, lado = "derecha", corrido = false, claro = false, fijo = true }: Props) {
  const clases = clasesLado[lado];
  const claseSello = `${corrido ? clasesCorrido[lado] : clases.sello} ${claro ? "brightness-0 invert" : ""}`;
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
      <div className={`${fijo ? "sticky top-0 h-svh" : "absolute inset-0"} flex items-center overflow-hidden ${clases.fila}`}>
        <img
          src={logoSello.src}
          width={logoSello.width}
          height={logoSello.height}
          alt=""
          loading="lazy"
          decoding="async"
          draggable={false}
          style={{ opacity: opacidad }}
          className={`h-auto w-[380px] max-w-none select-none sm:w-[540px] lg:w-[780px] ${claseSello}`}
        />
      </div>
    </div>
  );
}
