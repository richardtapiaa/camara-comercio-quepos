import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Gallery, GalleryImage } from "../QUEPOS/GaleriaQuepos";

export interface ImagenHotel {
  id: string;
  src: string;
  alt: string;
}

interface Props {
  imagenes: ImagenHotel[];
}

// Cada cuánto pasa sola a la foto siguiente
const INTERVALO_MS = 3000;


const COPIAS = 3;


export default function ImagenesHoteles({ imagenes }: Props) {
  const filaRef = React.useRef<HTMLDivElement>(null);
  // La rotación se detiene mientras la persona interactúa con la galería (mouse encima, toque o foco del teclado)
  const pausada = React.useRef(false);
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

  React.useEffect(() => {
    // Quien pidió menos movimiento en su sistema no recibe la rotación automática
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const id = window.setInterval(() => {
      // Sin rotar si la pestaña no se ve o hay una foto ampliada (el visor bloquea el scroll del body)
      if (
        pausada.current ||
        document.hidden ||
        document.body.style.overflow === "hidden"
      )
        return;
      mover(1);
    }, INTERVALO_MS);
    return () => window.clearInterval(id);
  }, []);

  // Cuando se deja de deslizar a mano, se vuelve a la copia del medio para no llegar nunca a una punta
  const alDesplazar = () => {
    window.clearTimeout(esperaScroll.current);
    esperaScroll.current = window.setTimeout(recentrar, 150);
  };

  const pausar = () => (pausada.current = true);
  const reanudar = () => (pausada.current = false);

  const flecha =
    "flex size-10 shrink-0 items-center justify-center rounded-full border border-neutral-300 text-neutral-700 transition-colors hover:bg-neutral-100";

  return (
    <Gallery images={imagenes}>
      <div
        className="relative flex flex-col gap-6 py-12"
        onPointerEnter={pausar}
        onPointerLeave={reanudar}
        onFocus={pausar}
        onBlur={reanudar}
      >
        {/* Degradados blancos a los lados (mismo fondo que la sección) para que las tarjetas aparezcan y se vayan suave */}
        <div className="pointer-events-none absolute inset-[0_auto_0_0] z-10 w-[12vw] bg-[linear-gradient(90deg,_#ffffff_35%,_transparent)]" />
        <div className="pointer-events-none absolute inset-[0_0_0_auto] z-10 w-[15vw] bg-[linear-gradient(270deg,_#ffffff_35%,_transparent)]" />

        <div
          ref={filaRef}
          onScroll={alDesplazar}
          className="flex snap-x snap-mandatory gap-8 overflow-x-auto px-8 pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {Array.from({ length: COPIAS }, (_, copia) =>
            imagenes.map((foto) => (
              // En celular la tarjeta es cuadrada (85 % del ancho de la pantalla); desde tablet vuelve a ser alta
              <div
                key={`${copia}-${foto.id}`}
                className="aspect-square min-w-[85vw] snap-center overflow-hidden rounded-xl shadow-xl md:aspect-auto md:h-[min(70vh,640px)] md:min-w-[38vw] xl:min-w-[30vw]"
              >
                {/* aspect="h-full" hace que la foto llene la tarjeta; mb-0 quita el margen pensado para el mosaico */}
                <GalleryImage
                  id={foto.id}
                  src={foto.src}
                  alt={foto.alt}
                  aspect="h-full"
                  className="mb-0 rounded-xl md:mb-0"
                  copia={copia === 1 ? undefined : copia + 1}
                />
              </div>
            )),
          )}
        </div>

        <div className="relative z-20 mx-8 flex justify-end gap-4">
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
