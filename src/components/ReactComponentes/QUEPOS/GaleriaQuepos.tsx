import * as React from "react";
import { motion, AnimatePresence, useIsPresent, type Transition } from "framer-motion";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

// --- Tipos ---
export interface GaleriaItem {
  id: number;
  src: string;
  alt: string;
}

interface ImageData {
  id: string;
  src: string;
  alt?: string;
}

interface GalleryContextType {
  selectedImage: ImageData | null;
  setSelectedImage: (image: ImageData | null) => void;
  images: ImageData[];
  /** Pasa a la imagen siguiente (1) o anterior (-1), dando la vuelta al llegar a un extremo */
  navegar: (direccion: number) => void;
  /** Dirección del último cambio, para la animación de deslizar */
  direccion: number;
  /** Ya se cambió de imagen desde que se abrió (la vista ya no corresponde a la miniatura de origen) */
  navegado: boolean;
}

const GalleryContext = React.createContext<GalleryContextType | null>(null);

// --- Física ---
const spring: Transition = {
  type: "spring",
  stiffness: 350,
  damping: 35,
  mass: 1,
};

// Deslizamiento al cambiar de imagen; la dirección llega por "custom"
const deslizar = {
  entrar: (direccion: number) => ({ x: direccion * 120, opacity: 0 }),
  centro: { x: 0, opacity: 1 },
  salir: (direccion: number) => ({ x: direccion * -120, opacity: 0 }),
};

// --- Componentes ---

/**
 * Proveedor raíz: guarda la imagen ampliada y renderiza el modal.
 */
export function Gallery({ children, images = [] }: { children: React.ReactNode; images?: ImageData[] }) {
  const [vista, setVista] = React.useState<{ imagen: ImageData | null; direccion: number; navegado: boolean }>({
    imagen: null,
    direccion: 0,
    navegado: false,
  });
  const selectedImage = vista.imagen;

  const setSelectedImage = React.useCallback((imagen: ImageData | null) => {
    setVista({ imagen, direccion: 0, navegado: false });
  }, []);

  const navegar = React.useCallback(
    (direccion: number) => {
      setVista((prev) => {
        if (!prev.imagen || images.length < 2) return prev;
        const actual = images.findIndex((img) => img.id === prev.imagen!.id);
        const siguiente = images[(actual + direccion + images.length) % images.length];
        return { imagen: siguiente, direccion, navegado: true };
      });
    },
    [images],
  );

  // Escape cierra; las flechas cambian de imagen
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedImage(null);
      else if (e.key === "ArrowRight") navegar(1);
      else if (e.key === "ArrowLeft") navegar(-1);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navegar, setSelectedImage]);

  // Precarga la anterior y la siguiente para que el cambio sea instantáneo
  React.useEffect(() => {
    if (!selectedImage || images.length < 2) return;
    const actual = images.findIndex((img) => img.id === selectedImage.id);
    [-1, 1].forEach((paso) => {
      new Image().src = images[(actual + paso + images.length) % images.length].src;
    });
  }, [selectedImage, images]);

  // Bloquea el scroll de la página mientras el modal está abierto. Se reserva el ancho de la barra de scroll:
  // si no, al quitarla y volver a ponerla el mosaico se reacomoda y la foto vuelve a un lugar que se movió
  const abierto = selectedImage !== null;
  React.useEffect(() => {
    if (!abierto) return;
    const { body } = document;
    const anterior = { overflow: body.style.overflow, paddingRight: body.style.paddingRight };
    const barra = window.innerWidth - document.documentElement.clientWidth;
    body.style.overflow = "hidden";
    if (barra > 0) body.style.paddingRight = `${parseFloat(getComputedStyle(body).paddingRight) + barra}px`;
    return () => {
      body.style.overflow = anterior.overflow;
      body.style.paddingRight = anterior.paddingRight;
    };
  }, [abierto]);

  return (
    <GalleryContext.Provider
      value={{ selectedImage, setSelectedImage, images, navegar, direccion: vista.direccion, navegado: vista.navegado }}
    >
      {children}
      <GalleryModal />
    </GalleryContext.Provider>
  );
}

/**
 * Cuadrícula masonry responsive
 */
export function GalleryGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("columns-2 gap-3 md:columns-3 md:gap-4 lg:columns-4", className)}>{children}</div>;
}

/**
 * Miniatura de la galería
 */
export function GalleryImage({
  src,
  alt,
  id,
  className,
  loading = "lazy",
  aspect,
}: {
  src: string;
  alt?: string;
  id: string;
  className?: string;
  loading?: "lazy" | "eager";
  /** Proporción de la miniatura (p. ej. "aspect-[3/5]"); la imagen se recorta para llenarla */
  aspect?: string;
}) {
  const context = React.useContext(GalleryContext);
  if (!context) throw new Error("GalleryImage must be used within a Gallery");

  return (
    <motion.button
      type="button"
      whileHover="hover"
      whileTap="tap"
      className={cn(
        "relative mb-3 block w-full break-inside-avoid cursor-zoom-in rounded-2xl overflow-hidden bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 md:mb-4",
        aspect,
        className,
      )}
      onClick={() => context.setSelectedImage({ id, src, alt })}
      aria-label={`Ampliar imagen: ${alt || "Galería"}`}
    >
      <motion.img
        layoutId={`image-${id}`}
        src={src}
        alt={alt || "Imagen de la galería"}
        loading={loading}
        className={cn("w-full object-cover rounded-2xl", aspect ? "h-full" : "h-auto")}
        variants={{
          hover: { scale: 0.98 },
          tap: { scale: 0.95 },
        }}
        transition={spring}
      />

      {/* Oscurecido sutil al pasar el cursor */}
      <motion.div
        variants={{
          hover: { opacity: 1 },
          tap: { opacity: 1 },
        }}
        initial={{ opacity: 0 }}
        className="absolute inset-0 bg-black/20 pointer-events-none rounded-2xl"
        transition={{ duration: 0.2 }}
      />
    </motion.button>
  );
}


function GalleryModal() {
  const context = React.useContext(GalleryContext);
  if (!context) return null;

  const { selectedImage, direccion, navegado } = context;

  return (
    <AnimatePresence>
      {/* Se pasan como props: al cerrar, la vista que sale conserva la última imagen mientras se anima */}
      {selectedImage && <VistaAmpliada key="vista" imagen={selectedImage} direccion={direccion} navegado={navegado} />}
    </AnimatePresence>
  );
}

function VistaAmpliada({ imagen, direccion, navegado }: { imagen: ImageData; direccion: number; navegado: boolean }) {
  const { setSelectedImage, images, navegar } = React.useContext(GalleryContext)!;
  // Mientras se anima el cierre la vista sigue montada; sin esto su capa transparente tapaba la página
  // y no se podía hacer clic ni scroll hasta que terminaba
  const presente = useIsPresent();
  // El navegador lanza "click" al soltar aunque se haya arrastrado; así se distingue un toque de un deslizamiento
  const huboArrastre = React.useRef(false);

  const posicion = images.findIndex((img) => img.id === imagen.id);
  const conVarias = images.length > 1;
  const botonClase =
    "absolute z-50 p-2.5 bg-white/10 text-white rounded-full backdrop-blur-md hover:bg-white/20 transition-colors";

  return (
    // z-[70]: por encima del Navbar (z-50) y su menú móvil (z-[60])
    <div
      className={cn("fixed inset-0 z-[70] flex items-center justify-center", !presente && "pointer-events-none")}
      role="dialog"
      aria-modal="true"
    >
      {/* Fondo de vidrio esmerilado */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-2xl"
        onClick={() => setSelectedImage(null)}
      />

      {/* Contenedor del gesto de arrastre: horizontal cambia de imagen, vertical cierra */}
      <motion.div
        className="relative z-10 w-full h-full flex items-center justify-center cursor-zoom-out"
        drag={conVarias ? true : "y"}
        dragDirectionLock
        dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
        dragElastic={0.8}
        onPointerDown={() => {
          huboArrastre.current = false;
        }}
        onDragStart={() => {
          huboArrastre.current = true;
        }}
        onDragEnd={(_, info) => {
          const horizontal = Math.abs(info.offset.x) > Math.abs(info.offset.y);
          if (horizontal) {
            if (Math.abs(info.offset.x) > 80 || Math.abs(info.velocity.x) > 400) navegar(info.offset.x < 0 ? 1 : -1);
          } else if (Math.abs(info.offset.y) > 100 || Math.abs(info.velocity.y) > 300) {
            // Se cierra si se arrastró lo suficiente o con suficiente velocidad
            setSelectedImage(null);
          }
        }}
        // Un toque cierra; al terminar de deslizar no, así cambiar de imagen no cierra la vista
        onClick={() => {
          if (!huboArrastre.current) setSelectedImage(null);
        }}
      >
        <AnimatePresence initial={false} custom={direccion} mode="popLayout">
          {/* Al abrir es el elemento compartido con la miniatura; al cambiar de imagen se desliza */}
          <motion.img
            key={imagen.id}
            layoutId={navegado ? undefined : `image-${imagen.id}`}
            src={imagen.src}
            alt={imagen.alt || "Imagen ampliada de la galería"}
            className="w-auto h-auto max-w-[95vw] max-h-[80vh] sm:max-w-[calc(100vw-9rem)] rounded-2xl shadow-2xl object-contain will-change-transform"
            draggable={false} // Evita el arrastre nativo para que funcione el de framer-motion
            custom={direccion}
            variants={deslizar}
            initial="entrar"
            animate="centro"
            exit="salir"
            transition={navegado ? { x: spring, opacity: { duration: 0.2 } } : spring}
          />
        </AnimatePresence>
      </motion.div>

      {conVarias && (
        <>
          {/* Anterior / siguiente */}
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.1, duration: 0.2 }}
            className={cn(botonClase, "left-3 top-1/2 -translate-y-1/2 sm:left-6")}
            onClick={() => navegar(-1)}
            aria-label="Imagen anterior"
          >
            <ChevronLeft className="w-6 h-6" />
          </motion.button>
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.1, duration: 0.2 }}
            className={cn(botonClase, "right-3 top-1/2 -translate-y-1/2 sm:right-6")}
            onClick={() => navegar(1)}
            aria-label="Imagen siguiente"
          >
            <ChevronRight className="w-6 h-6" />
          </motion.button>

          {/* Contador */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.1, duration: 0.2 }}
            className="absolute bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-sm text-white backdrop-blur-md"
            aria-live="polite"
          >
            {posicion + 1} / {images.length}
          </motion.p>
        </>
      )}

      {/* Botón cerrar */}
      <motion.button
        type="button"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ delay: 0.1, duration: 0.2 }}
        className={cn(botonClase, "top-6 right-6")}
        onClick={() => setSelectedImage(null)}
        aria-label="Cerrar galería"
      >
        <X className="w-5 h-5" />
      </motion.button>
    </div>
  );
}

// Proporciones variadas (verticales y horizontales) para el mosaico estilo masonry
const PROPORCIONES = ["aspect-[3/5]", "aspect-[16/10]", "aspect-[2/3]", "aspect-[4/5]", "aspect-[16/10]", "aspect-[3/4]", "aspect-[3/5]"];

const GaleriaQuepos = ({ items, className }: { items: GaleriaItem[]; className?: string }) => (
  <Gallery images={items.map((item) => ({ id: String(item.id), src: item.src, alt: item.alt }))}>
    <GalleryGrid className={className}>
      {items.map((item, index) => (
        <GalleryImage
          key={item.id}
          id={String(item.id)}
          src={item.src}
          alt={item.alt}
          loading={index < 4 ? "eager" : "lazy"}
          aspect={PROPORCIONES[index % PROPORCIONES.length]}
        />
      ))}
    </GalleryGrid>
  </Gallery>
);

export default GaleriaQuepos;
