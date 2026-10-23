import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Gallery, GalleryImage } from "../QUEPOS/GaleriaQuepos";

export interface ImagenHotel {
  id: string;
  src: string;
  alt: string;
  miniatura?: string;
  srcSet?: string;
}

interface Props {
  imagenes: ImagenHotel[];
  enMostrador?: boolean;
}


const COPIAS = 3;

const TAMANOS_MOSTRADOR = "(min-width: 1250px) 400px, (max-width: 708px) 227px, 32vw";
const TAMANOS_NORMAL = "(min-width: 1280px) 30vw, (min-width: 768px) 38vw, 85vw";


export default function ImagenesHoteles({ imagenes, enMostrador = false }: Props) {
  const filaRef = React.useRef<HTMLDivElement>(null);
  const esperaScroll = React.useRef<number | undefined>(undefined);

  const anchoCopia = () => {
    const fila = filaRef.current;
    const primera = fila?.children[0] as HTMLElement | undefined;
    const siguienteCopia = fila?.children[imagenes.length] as
      HTMLElement | undefined;
    return primera && siguienteCopia
      ? siguienteCopia.offsetLeft - primera.offsetLeft
      : 0;
  };

  const recentrar = () => {
    const fila = filaRef.current;
    const ancho = anchoCopia();
    if (!fila || !ancho) return;
    if (fila.scrollLeft < ancho * 0.5) fila.scrollLeft += ancho;
    else if (fila.scrollLeft > ancho * 1.5) fila.scrollLeft -= ancho;
  };

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

  React.useEffect(() => {
    const fila = filaRef.current;
    if (fila) fila.scrollLeft = anchoCopia();
  }, []);

  const alDesplazar = () => {
    window.clearTimeout(esperaScroll.current);
    esperaScroll.current = window.setTimeout(recentrar, 150);
  };

  const flecha = enMostrador
    ? "flex size-9 shrink-0 items-center justify-center rounded-full border border-white/25 text-white/80 transition-colors hover:bg-white/10 md:size-10"
    : "flex size-10 shrink-0 items-center justify-center rounded-full border border-neutral-300 text-neutral-700 transition-colors hover:bg-neutral-100";
  const fondo = enMostrador ? "#17140f" : "#ffffff";

  return (
    <Gallery images={imagenes}>
      <div className={enMostrador ? "relative flex flex-col gap-3 py-5 md:gap-4 md:py-8" : "relative flex flex-col gap-6 py-12"}>
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
          className={`flex snap-x snap-mandatory scroll-px-8 gap-8 overflow-x-auto px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${enMostrador ? "pb-2" : "pb-6"}`}
        >
          {Array.from({ length: COPIAS }, (_, copia) =>
            imagenes.map((foto) => (
              <div
                key={`${copia}-${foto.id}`}
                className={
                  enMostrador
                    ? "aspect-[4/3] h-[clamp(170px,24vw,300px)] shrink-0 snap-start overflow-hidden rounded-2xl shadow-[0_10px_24px_rgb(0_0_0/0.6)]"
                    : "aspect-square min-w-[85vw] snap-start overflow-hidden rounded-xl shadow-xl md:aspect-auto md:h-[min(70vh,640px)] md:min-w-[38vw] xl:min-w-[30vw]"
                }
              >
                <GalleryImage
                  id={foto.id}
                  src={foto.src}
                  alt={foto.alt}
                  miniatura={foto.miniatura}
                  srcSet={foto.srcSet}
                  sizes={enMostrador ? TAMANOS_MOSTRADOR : TAMANOS_NORMAL}
                  aspect="h-full"
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
