import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import actividad1 from "../../assets/imagenes visitors/visitors-1.jpg";
import actividad2 from "../../assets/imagenes visitors/visitors-2.jpg";
import actividad3 from "../../assets/imagenes visitors/visitors-3.jpg";
import actividad4 from "../../assets/imagenes visitors/visitors-4.jpg";
import actividad5 from "../../assets/imagenes visitors/visitors-5.jpg";
import actividad6 from "../../assets/imagenes visitors/visitors-6.jpg";
import actividad7 from "../../assets/imagenes visitors/visitors-7.jpg";
import actividad8 from "../../assets/imagenes visitors/visitors-8.jpg";
import actividad9 from "../../assets/imagenes visitors/visitors-9.jpg";
import actividad10 from "../../assets/imagenes visitors/visitors-10.jpg";
import "./imagenesvisitors.css";

export type GalleryItem = {
  image: string;
  text: string;
};

const galleryItems: GalleryItem[] = [
  { image: actividad1.src, text: "Quepos coastline" },
  { image: actividad2.src, text: "Tropical escape" },
  { image: actividad3.src, text: "Manuel Antonio" },
  { image: actividad4.src, text: "Wildlife" },
  { image: actividad5.src, text: "Where to stay" },
  { image: actividad6.src, text: "Local experiences" },
  { image: actividad7.src, text: "Nature trails" },
  { image: actividad8.src, text: "Pacific views" },
  { image: actividad9.src, text: "Explore Quepos" },
  { image: actividad10.src, text: "Pura vida" },
];

export default function ImagenesVisitors() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const dragStartX = useRef<number | null>(null);
  const hasDragged = useRef(false);
  const itemCount = galleryItems.length;

  const moveGallery = (direction: number) => {
    setActiveIndex((currentIndex) => (currentIndex + direction + itemCount) % itemCount);
  };

  const handlePointerDown = (event: PointerEvent<HTMLElement>) => {
    dragStartX.current = event.clientX;
    hasDragged.current = false;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerUp = (event: PointerEvent<HTMLElement>) => {
    if (dragStartX.current === null) return;

    const distance = event.clientX - dragStartX.current;
    if (Math.abs(distance) > 35) {
      moveGallery(distance > 0 ? -1 : 1);
      hasDragged.current = true;
    }

    dragStartX.current = null;
  };

  const openImage = (index: number) => {
    setActiveIndex(index);
    setLightboxIndex(index);
  };

  const handleCardPointerUp = (index: number, event: PointerEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (dragStartX.current === null) return;

    const distance = event.clientX - dragStartX.current;
    dragStartX.current = null;

    if (Math.abs(distance) > 35) {
      moveGallery(distance > 0 ? -1 : 1);
      hasDragged.current = true;
    } else {
      openImage(index);
    }
  };

  const moveLightbox = (direction: number) => {
    setLightboxIndex((currentIndex) => (
      currentIndex === null ? null : (currentIndex + direction + itemCount) % itemCount
    ));
  };

  useEffect(() => {
    if (lightboxIndex === null) return;

    const closeWithEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightboxIndex(null);
    };

    document.addEventListener("keydown", closeWithEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", closeWithEscape);
      document.body.style.overflow = "";
    };
  }, [lightboxIndex]);

  return (
    <section className="visitor-gallery" aria-labelledby="visitor-gallery-title">
      <div className="visitor-gallery__header">
        <span>Discover the region</span>
        <h2 id="visitor-gallery-title">A closer look at Quepos</h2>
      </div>

      <div
        className="visitor-gallery__stage"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => {
          dragStartX.current = null;
        }}
      >
        <div className="visitor-gallery__orbit">
          {galleryItems.map((item, index) => {
            const offset = (index - activeIndex + itemCount) % itemCount;
            const normalizedOffset = offset > itemCount / 2 ? offset - itemCount : offset;
            const isActive = normalizedOffset === 0;

            return (
              <button
                className={`visitor-gallery__card${isActive ? " visitor-gallery__card--active" : ""}`}
                key={item.image}
                type="button"
                style={{ "--card-offset": normalizedOffset } as CSSProperties}
                onPointerDown={(event) => {
                  event.stopPropagation();
                  handlePointerDown(event);
                }}
                onPointerUp={(event) => handleCardPointerUp(index, event)}
                onClick={(event) => event.stopPropagation()}
                aria-label={`Mostrar imagen: ${item.text}`}
                aria-pressed={isActive}
              >
                <img src={item.image} alt={item.text} loading="lazy" />
                <span>{item.text}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="visitor-gallery__controls">
        <button type="button" onClick={() => moveGallery(-1)} aria-label="Imagen anterior">
          &#8592;
        </button>
        <span>{String(activeIndex + 1).padStart(2, "0")} / {String(itemCount).padStart(2, "0")}</span>
        <button type="button" onClick={() => moveGallery(1)} aria-label="Imagen siguiente">
          &#8594;
        </button>
      </div>

      {lightboxIndex !== null && (
        <div
          className="visitor-gallery__lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`Imagen ampliada: ${galleryItems[lightboxIndex].text}`}
          onClick={() => setLightboxIndex(null)}
        >
          <button
            className="visitor-gallery__lightbox-close"
            type="button"
            onClick={() => setLightboxIndex(null)}
            aria-label="Cerrar imagen ampliada"
          >
            &#10005;
          </button>
          <button
            className="visitor-gallery__lightbox-arrow visitor-gallery__lightbox-arrow--previous"
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              moveLightbox(-1);
            }}
            aria-label="Imagen anterior"
          >
            &#8592;
          </button>
          <figure className="visitor-gallery__lightbox-content" onClick={(event) => event.stopPropagation()}>
            <img
              src={galleryItems[lightboxIndex].image}
              alt={galleryItems[lightboxIndex].text}
            />
            <figcaption>{galleryItems[lightboxIndex].text}</figcaption>
          </figure>
          <button
            className="visitor-gallery__lightbox-arrow visitor-gallery__lightbox-arrow--next"
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              moveLightbox(1);
            }}
            aria-label="Imagen siguiente"
          >
            &#8594;
          </button>
        </div>
      )}
    </section>
  );
}