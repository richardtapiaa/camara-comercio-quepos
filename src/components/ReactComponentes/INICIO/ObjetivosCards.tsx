import * as React from "react";
import { motion, useInView } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Globe,
  Handshake,
  HeartHandshake,
  Landmark,
  Leaf,
  MessagesSquare,
  Scale,
  Smile,
  Users,
} from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { cn } from "@/lib/utils";

// --- Carousel Context ---
type CarouselApi = ReturnType<typeof useEmblaCarousel>[1];
type EmblaCarouselType = NonNullable<CarouselApi>;
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>;
type CarouselOptions = UseCarouselParameters[0];
type CarouselPlugin = UseCarouselParameters[1];

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0];
  api: CarouselApi;
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
};

const CarouselContext = React.createContext<CarouselContextProps | null>(null);

function useCarousel() {
  const context = React.useContext(CarouselContext);
  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />");
  }
  return context;
}

// --- Main Carousel Component ---
const Carousel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { opts?: CarouselOptions; plugins?: CarouselPlugin }
>(({ opts, plugins, className, children, ...props }, ref) => {
  const [carouselRef, api] = useEmblaCarousel({ ...opts, axis: "x" }, plugins);
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);

  const onSelect = React.useCallback((api: EmblaCarouselType) => {
    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());
  }, []);

  const scrollPrev = React.useCallback(() => api?.scrollPrev(), [api]);
  const scrollNext = React.useCallback(() => api?.scrollNext(), [api]);

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        scrollPrev();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        scrollNext();
      }
    },
    [scrollPrev, scrollNext],
  );

  React.useEffect(() => {
    if (!api) return;
    onSelect(api);
    api.on("reInit", onSelect);
    api.on("select", onSelect);
    return () => {
      api.off("reInit", onSelect);
      api.off("select", onSelect);
    };
  }, [api, onSelect]);

  return (
    <CarouselContext.Provider
      value={{ carouselRef, api, scrollPrev, scrollNext, canScrollPrev, canScrollNext }}
    >
      <div
        ref={ref}
        onKeyDownCapture={handleKeyDown}
        className={cn("relative", className)}
        role="region"
        aria-roledescription="carousel"
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  );
});
Carousel.displayName = "Carousel";

// --- Carousel Content ---
const CarouselContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { carouselRef } = useCarousel();
    return (
      <div ref={carouselRef} className="overflow-hidden">
        <div ref={ref} className={cn("-ml-4 flex", className)} {...props} />
      </div>
    );
  },
);
CarouselContent.displayName = "CarouselContent";

// --- Carousel Item ---
const CarouselItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      role="group"
      aria-roledescription="slide"
      className={cn("min-w-0 shrink-0 grow-0 basis-full pl-4", className)}
      {...props}
    />
  ),
);
CarouselItem.displayName = "CarouselItem";

// --- Carousel Controls ---
const botonControl =
  "flex h-11 w-11 items-center justify-center rounded-full border border-[#217BCB]/40 bg-[#217BCB]/10 text-[#0E3B66] transition hover:bg-[#217BCB]/25 disabled:cursor-not-allowed disabled:opacity-40";

const CarouselPrevious = () => {
  const { scrollPrev, canScrollPrev } = useCarousel();
  return (
    <button type="button" className={botonControl} onClick={scrollPrev} disabled={!canScrollPrev}>
      <ArrowLeft className="h-4 w-4" />
      <span className="sr-only">Objetivo anterior</span>
    </button>
  );
};

const CarouselNext = () => {
  const { scrollNext, canScrollNext } = useCarousel();
  return (
    <button type="button" className={botonControl} onClick={scrollNext} disabled={!canScrollNext}>
      <ArrowRight className="h-4 w-4" />
      <span className="sr-only">Objetivo siguiente</span>
    </button>
  );
};

// --- Objetivo Card & Carousel Section ---
export interface Objetivo {
  letra: string;
  texto: string;
}

// Degradado en tonos oscuros de #217BCB; clase literal para que Tailwind la genere
const estilos = [
  { icon: Landmark, gradient: "from-[#1B66A6] to-[#0E3B66]" },
  { icon: MessagesSquare, gradient: "from-[#1B66A6] to-[#0E3B66]" },
  { icon: Handshake, gradient: "from-[#1B66A6] to-[#0E3B66]" },
  { icon: Users, gradient: "from-[#1B66A6] to-[#0E3B66]" },
  { icon: Globe, gradient: "from-[#1B66A6] to-[#0E3B66]" },
  { icon: Smile, gradient: "from-[#1B66A6] to-[#0E3B66]" },
  { icon: HeartHandshake, gradient: "from-[#1B66A6] to-[#0E3B66]" },
  { icon: Leaf, gradient: "from-[#1B66A6] to-[#0E3B66]" },
  { icon: Scale, gradient: "from-[#1B66A6] to-[#0E3B66]" },
];

const ObjetivoCard = ({ objetivo, index }: { objetivo: Objetivo; index: number }) => {
  const { icon: Icono, gradient } = estilos[index % estilos.length];

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
      }}
      className={cn(
        "relative flex h-[380px] w-full flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br p-8 text-white shadow-xl",
        gradient,
      )}
    >
      <div className="flex flex-col items-start text-left">
        <span className="mb-8 font-mono text-sm text-white/60">( {objetivo.letra} )</span>
        <Icono className="h-12 w-12" aria-hidden="true" />
      </div>
      <div>
        <h3 className="mb-2 text-lg font-semibold uppercase tracking-wider">Objetivo {objetivo.letra}</h3>
        <p className="text-sm leading-relaxed text-white/85">{objetivo.texto}</p>
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
    </motion.div>
  );
};

// Main exportable component
export default function ObjetivosCards({ objetivos }: { objetivos: Objetivo[] }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  // Avanza solo cada 3.5 s y se pausa al pasar el cursor; no arranca si el usuario prefiere menos movimiento
  const plugins = React.useMemo(() => {
    const sinMovimiento = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    return [Autoplay({ delay: 3500, stopOnInteraction: false, stopOnMouseEnter: true, playOnInit: !sinMovimiento })];
  }, []);

  return (
    <div className="mx-auto w-full max-w-6xl px-4">
      <Carousel ref={ref} opts={{ align: "start", loop: true }} plugins={plugins} aria-label="Objetivos específicos">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          transition={{ staggerChildren: 0.1 }}
        >
          <CarouselContent>
            {objetivos.map((objetivo, index) => (
              <CarouselItem key={objetivo.letra} className="md:basis-1/2 lg:basis-1/3">
                <div className="p-1">
                  <ObjetivoCard objetivo={objetivo} index={index} />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </motion.div>
        <div className="mt-8 flex justify-center gap-3">
          <CarouselPrevious />
          <CarouselNext />
        </div>
      </Carousel>
    </div>
  );
}
