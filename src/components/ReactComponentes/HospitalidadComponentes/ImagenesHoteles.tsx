import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Gallery, GalleryImage } from "../QUEPOS/GaleriaQuepos";

export interface ImagenHotel {
  id: string;
  /** Versión grande, para la foto ampliada */
  src: string;
  alt: string;
  /** Miniatura para la tarjeta y sus anchos ("url 360w, …"): la tarjeta no baja la versión grande */
  miniatura?: string;
  srcSet?: string;
}

interface Props {
  imagenes: ImagenHotel[];
  /** Versión para el frente oscuro del mostrador de la recepción (GaleriaHospitalidad.astro): tarjetas más bajas,
   *  degradados de los lados en el color del mostrador y flechas claras */
  enMostrador?: boolean;
}


const COPIAS = 3;

// Ancho con que se ve cada tarjeta, para elegir del srcset. En el mostrador: 4/3 del alto clamp(170px, 24vw, 300px)
const TAMANOS_MOSTRADOR = "(min-width: 1250px) 400px, (max-width: 708px) 227px, 32vw";
const TAMANOS_NORMAL = "(min-width: 1280px) 30vw, (min-width: 768px) 38vw, 85vw";


export default function ImagenesHoteles({ imagenes, enMostrador = false }: Props) {
  const filaRef = React.useRef<HTMLDivElement>(null);
  const esperaScroll = React.useRef<number | undefined>(undefined);

  // Ancho de una copia completa de la fila (distancia entre la primera tarjeta de una copia y la de la siguiente)
  const anchoCopia = () => {
    const fila = filaRef.current;
    const primera = fila?.children[0] as HTMLElement | undefined;
    const siguienteCopia = fila?.children[imagenes.length] as
      HTMLElement | undefined;
    return primera && siguienteCopia
      ? siguienteCopia.offsetLeft - primera.offsetLeft
      : 0;
  };

  // Si el scroll quedó en la primera o la última copia, lo pasa al mismo punto de la copia del medio
  const recentrar = () => {
    const fila = filaRef.current;
    const ancho = anchoCopia();
    if (!fila || !ancho) return;
    if (fila.scrollLeft < ancho * 0.5) fila.scrollLeft += ancho;
    else if (fila.scrollLeft > ancho * 1.5) fila.scrollLeft -= ancho;
  };

  // Corre la fila una tarjeta (ancho de una tarjeta + el espacio entre tarjetas)
  const mover = (direccion: 1 | -1) => {
    const fila = filaRef.current;
    const tarjeta = fila?.firstElementChild as HTMLElement | null;
    if (!fila || !tarjeta) return;
    recentrar();
    fila.scrollBy({
      left: direccion * (tarjeta.offsetWidth + 32),
      behavior: "smooth",
    });
  };

  // Al arrancar se ubica en la copia del medio
  React.useEffect(() => {
    const fila = filaRef.current;
    if (fila) fila.scrollLeft = anchoCopia();
  }, []);

  // Cuando se deja de deslizar a mano, se vuelve a la copia del medio para no llegar nunca a una punta
  const alDesplazar = () => {
    window.clearTimeout(esperaScroll.current);
    esperaScroll.current = window.setTimeout(recentrar, 150);
  };

  const flecha = enMostrador
    ? "flex size-9 shrink-0 items-center justify-center rounded-full border border-white/25 text-white/80 transition-colors hover:bg-white/10 md:size-10"
    : "flex size-10 shrink-0 items-center justify-center rounded-full border border-neutral-300 text-neutral-700 transition-colors hover:bg-neutral-100";
  // Color de los degradados de los lados: el fondo de la sección, o el del mostrador
  const fondo = enMostrador ? "#17140f" : "#ffffff";

  return (
    <Gallery images={imagenes}>
      {/* Sin giro automático: las fotos se pasan con las flechas o deslizando */}
      <div className={enMostrador ? "relative flex flex-col gap-3 py-5 md:gap-4 md:py-8" : "relative flex flex-col gap-6 py-12"}>
        {/* Degradados blancos a los lados (mismo fondo que la sección) para que las tarjetas aparezcan y se vayan suave */}
        <div
          className="pointer-events-none absolute inset-[0_auto_0_0] z-10 w-[12vw]"
          style={{ background: `linear-gradient(90deg, ${fondo} ${enMostrador ? "10%" : "35%"}, transparent)` }}
        />
        <div
          className="pointer-events-none absolute inset-[0_0_0_auto] z-10 w-[15vw]"
          style={{ background: `linear-gradient(270deg, ${fondo} ${enMostrador ? "10%" : "35%"}, transparent)` }}
        />

        <div
          ref={filaRef}
          onScroll={alDesplazar}
          className={`flex snap-x snap-mandatory gap-8 overflow-x-auto px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${enMostrador ? "pb-2" : "pb-6"}`}
        >
          {Array.from({ length: COPIAS }, (_, copia) =>
            imagenes.map((foto) => (
              // En celular la tarjeta es cuadrada (85 % del ancho de la pantalla); desde tablet vuelve a ser alta
              <div
                key={`${copia}-${foto.id}`}
                className={
                  enMostrador
                    ? // En el mostrador: fotos 4:3 de alto fijo (según el ancho de pantalla), como cuadros iluminados
                      "aspect-[4/3] h-[clamp(170px,24vw,300px)] shrink-0 snap-center overflow-hidden rounded-2xl shadow-[0_10px_24px_rgb(0_0_0/0.6)]"
                    : "aspect-square min-w-[85vw] snap-center overflow-hidden rounded-xl shadow-xl md:aspect-auto md:h-[min(70vh,640px)] md:min-w-[38vw] xl:min-w-[30vw]"
                }
              >
                {/* aspect="h-full" hace que la foto llene la tarjeta; mb-0 quita el margen pensado para el mosaico */}
                <GalleryImage
                  id={foto.id}
                  src={foto.src}
                  alt={foto.alt}
                  miniatura={foto.miniatura}
                  srcSet={foto.srcSet}
                  sizes={enMostrador ? TAMANOS_MOSTRADOR : TAMANOS_NORMAL}
                  aspect="h-full"
                  // En el mostrador: mismo redondeo que la foto (rounded-2xl) y sin el fondo gris claro de la tarjeta,
                  // que asomaba en las esquinas como un marco blanco sobre el frente oscuro
                  className={enMostrador ? "mb-0 rounded-2xl bg-transparent md:mb-0" : "mb-0 rounded-xl md:mb-0"}
                  copia={copia === 1 ? undefined : copia + 1}
                />
              </div>
            )),
          )}
        </div>

        <div className={`relative z-20 flex justify-end gap-4 ${enMostrador ? "mx-5 md:mx-8" : "mx-8"}`}>
          <button
            type="button"
            onClick={() => mover(-1)}
            aria-label="Anterior"
            className={flecha}
          >
            <ChevronLeft className="size-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => mover(1)}
            aria-label="Siguiente"
            className={flecha}
          >
            <ChevronRight className="size-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </Gallery>
  );
}
