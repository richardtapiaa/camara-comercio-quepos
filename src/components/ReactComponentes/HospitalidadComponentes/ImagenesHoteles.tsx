import * as React from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Gallery, GalleryImage } from "../QUEPOS/GaleriaQuepos";

export interface ImagenHotel {
  id: string;
  src: string;
  alt: string;
  lugar: string;
  miniatura?: string;
  srcSet?: string;
}

const TAMANOS = "(min-width: 1280px) 28.4vw, (min-width: 1024px) 31vw, (min-width: 640px) 46vw, 80vw";

const flecha =
  "flex size-11 items-center justify-center rounded-full bg-[#9cdeea] text-[#163746] transition-colors hover:bg-[#86d3e1] disabled:opacity-40";

// Carrusel de tarjetas altas: al tocar una foto se abre en grande con el visor de la galería de Quepos
export default function ImagenesHoteles({ titulo, imagenes }: { titulo: string; imagenes: ImagenHotel[] }) {
  const filaRef = React.useRef<HTMLUListElement>(null);
  const [extremos, setExtremos] = React.useState({ inicio: true, final: false });

  // Las flechas se apagan en los extremos
  const actualizar = React.useCallback(() => {
    const fila = filaRef.current;
    if (!fila) return;
    setExtremos({
      inicio: fila.scrollLeft <= 2,
      final: fila.scrollLeft + fila.clientWidth >= fila.scrollWidth - 2,
    });
  }, []);

  React.useEffect(actualizar, [actualizar]);

  // Avanza una tarjeta (su ancho más el espacio entre tarjetas)
  const mover = (direccion: 1 | -1) => {
    const fila = filaRef.current;
    const tarjeta = fila?.firstElementChild as HTMLElement | null;
    if (!fila || !tarjeta) return;
    const espacio = parseFloat(getComputedStyle(fila).columnGap) || 0;
    fila.scrollBy({ left: direccion * (tarjeta.offsetWidth + espacio), behavior: "smooth" });
  };

  return (
    <Gallery images={imagenes}>
      <div className="mb-6 flex items-center justify-between gap-4 px-5 sm:px-6">
        <h2 className="text-[1.75rem] font-bold leading-tight text-neutral-900 sm:text-[2rem]">{titulo}</h2>
        <div className="flex shrink-0 gap-3">
          <button type="button" className={flecha} onClick={() => mover(-1)} disabled={extremos.inicio} aria-label="Anterior">
            <ArrowLeft className="size-5" aria-hidden="true" />
          </button>
          <button type="button" className={flecha} onClick={() => mover(1)} disabled={extremos.final} aria-label="Siguiente">
            <ArrowRight className="size-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Ocupa todo el ancho y deja ver un pedazo de la siguiente tarjeta, como un carrusel tipo Swiper */}
      <ul
        ref={filaRef}
        onScroll={actualizar}
        className="flex snap-x snap-mandatory scroll-px-5 gap-5 overflow-x-auto px-5 [scrollbar-width:none] sm:scroll-px-6 sm:gap-6 sm:px-6 [&::-webkit-scrollbar]:hidden"
      >
        {imagenes.map((foto) => (
          <li
            key={foto.id}
            className="relative aspect-[343/466] w-[80vw] sm:aspect-[545/600] max-w-[545px] shrink-0 snap-start overflow-hidden rounded-[40px] bg-[#dcecf4] sm:w-[46vw] lg:w-[31vw] xl:w-[28.4vw]"
          >
            <GalleryImage
              id={foto.id}
              src={foto.src}
              alt={foto.alt}
              miniatura={foto.miniatura}
              srcSet={foto.srcSet}
              sizes={TAMANOS}
              aspect="h-full"
              className="mb-0 rounded-none md:mb-0"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent via-35% to-transparent" />
            <p className="pointer-events-none absolute inset-x-0 bottom-0 p-5 text-base italic text-[#dcff4f] sm:p-6 sm:text-lg">
              {foto.lugar}
            </p>
          </li>
        ))}
      </ul>
    </Gallery>
  );
}
