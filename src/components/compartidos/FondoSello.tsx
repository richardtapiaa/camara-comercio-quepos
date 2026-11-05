// Fondo decorativo: el logo de la Cámara en estilo sello (assets/compartido/logo-camara-sello.webp, se genera con
// herramientas/logo-sello.mjs), fijo a la derecha de la pantalla mientras se recorre la sección.
// Solo CSS, sin JavaScript (background-attachment: fixed no funciona en iPhone): una capa que cubre la sección entera
// y, dentro, un sticky del alto de la pantalla con el sello.
// Se usa sin client:* (también desde archivos .astro). La sección que lo contiene necesita:
//   - relative isolate: para que el sello quede detrás del contenido pero delante del fondo de la sección
//   - overflow-x-clip, NO overflow-hidden: overflow-hidden rompe el position: sticky
import logoSello from "../../assets/compartido/logo-camara-sello.webp";

interface Props {
  /** Opacidad del sello. Baja (por defecto 0.10) porque queda detrás de texto */
  opacidad?: number;
  /** Lado de la pantalla donde va el sello, cortado por ese borde (por defecto a la derecha) */
  lado?: "derecha" | "izquierda";
  /** Lo saca más allá del borde, para que se vea solo el ícono y no las letras (útil cuando hay texto encima) */
  corrido?: boolean;
  /** Sello blanco, para fondos oscuros (la imagen es azul oscuro y no se vería) */
  claro?: boolean;
  /**
   * true (por defecto): fijo en la pantalla mientras se recorre la sección. false: centrado en la sección, para secciones
   * más bajas que la pantalla (como el pie de página); así tampoco necesita overflow-x-clip
   */
  fijo?: boolean;
}

// A la izquierda va girado al revés, como reflejo del de la derecha
const clasesLado = {
  derecha: { fila: "justify-end", sello: "-mr-24 rotate-6 lg:-mr-28" },
  izquierda: { fila: "justify-start", sello: "-ml-24 -rotate-6 lg:-ml-28" },
};

// Margen extra cuando va corrido (reemplaza el margen del lado)
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
