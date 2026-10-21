import * as React from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

export type TimelineItem = {
  title: string;
  description: string;
  date: string;
  image: string;
  alt?: string;
};

// Animaciones con GSAP:
// - Cada tarjeta entra subiendo y apareciendo al acercarse a la pantalla.
// - La línea va del primer marcador al último y se llena con el scroll (scrub) a medida que la recorre un
//   punto a la altura de PUNTO_REFERENCIA de la pantalla; un punto con estela acompaña la punta. Al llegar a
//   cada marcador, este se rellena (sección por sección) y se vacía al volver a subir.
//   Es el 70% y no el centro porque al final de la página el último marcador no alcanza a subir hasta la
//   mitad de la pantalla (queda entre el 52% y el 68% según el tamaño) y nunca se rellenaría.
const PUNTO_REFERENCIA = "70%";

function useAnimacionTimeline(ref: React.RefObject<HTMLDivElement | null>) {
  React.useLayoutEffect(() => {
    const raiz = ref.current;
    if (!raiz) return;

    const linea = raiz.querySelector<HTMLElement>("[data-linea]")!;
    const relleno = raiz.querySelector<HTMLElement>("[data-linea-relleno]")!;
    const punta = raiz.querySelector<HTMLElement>("[data-linea-punta]")!;
    const marcadores = gsap.utils.toArray<HTMLElement>("[data-marcador]", raiz);
    const tarjetas = gsap.utils.toArray<HTMLElement>("[data-tarjeta]", raiz);
    const primero = marcadores[0];
    const ultimo = marcadores[marcadores.length - 1];
    if (!primero || !ultimo) return;

    // La línea empieza en el centro del primer marcador y termina en el del último. Se mide de nuevo en cada
    // refresco de ScrollTrigger (cambio de tamaño, fuentes o imágenes cargadas)
    const centroY = (el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      return r.top + r.height / 2 - raiz.getBoundingClientRect().top;
    };
    const medir = () => {
      const inicio = centroY(primero);
      linea.style.top = `${inicio}px`;
      linea.style.height = `${centroY(ultimo) - inicio}px`;
    };
    medir();
    ScrollTrigger.addEventListener("refreshInit", medir);

    const sinMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      if (sinMovimiento) {
        gsap.set(relleno, { scaleY: 1 });
        gsap.set(tarjetas, { autoAlpha: 1, y: 0 });
        gsap.set(punta, { autoAlpha: 0 });
        gsap.set(marcadores, { backgroundColor: "#334155" });
        return;
      }

      // Relleno y punta avanzan juntos. scrub: 1.2 = la línea alcanza al scroll en ~1,2 s con inercia, así no da
      // saltos con la rueda del mouse (que mueve la página a tirones). force3D la deja en la GPU
      gsap
        .timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: primero,
            start: `center ${PUNTO_REFERENCIA}`,
            endTrigger: ultimo,
            end: `center ${PUNTO_REFERENCIA}`,
            scrub: 1.2,
            invalidateOnRefresh: true,
          },
        })
        .fromTo(relleno, { scaleY: 0 }, { scaleY: 1, force3D: true })
        .fromTo(punta, { y: 0 }, { y: () => linea.offsetHeight, force3D: true }, 0);

      // Cada marcador se rellena cuando la línea lo alcanza: crece y se oscurece suave (antes rebotaba de golpe)
      marcadores.forEach((marcador) => {
        gsap.to(marcador, {
          backgroundColor: "#334155",
          borderColor: "#334155",
          scale: 1.2,
          duration: 0.6,
          ease: "power3.out",
          scrollTrigger: {
            trigger: marcador,
            start: `center ${PUNTO_REFERENCIA}`,
            toggleActions: "play none none reverse",
          },
        });
      });

      // Cada tarjeta entra subiendo y apareciendo cuando se acerca a la pantalla (una sola vez)
      tarjetas.forEach((tarjeta) => {
        gsap.fromTo(
          tarjeta,
          { autoAlpha: 0, y: 48 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
            force3D: true,
            scrollTrigger: { trigger: tarjeta, start: "top 88%", once: true },
          },
        );
      });
    }, raiz);

    return () => {
      ScrollTrigger.removeEventListener("refreshInit", medir);
      ctx.revert();
    };
  }, [ref]);
}

// Línea de tiempo alternada: en escritorio la línea va al centro; cada actividad es una tarjeta blanca (foto
// arriba, título y texto abajo) a un lado y, al otro lado, su categoría en grande a la altura del marcador.
// Van alternando de lado. En celular la línea va a la izquierda con la categoría encima de cada tarjeta
export default function Timeline({ items }: { items: TimelineItem[] }) {
  const ref = React.useRef<HTMLDivElement>(null);
  useAnimacionTimeline(ref);

  return (
    <div ref={ref} className="relative">
      {/* Línea: va del primer marcador al último (top y alto los calcula el script). Base gris clara,
          relleno oscuro y una punta con estela que baja junto al relleno */}
      <div data-linea className="pointer-events-none absolute left-3 w-px md:left-1/2" aria-hidden="true">
        <div className="absolute inset-0 bg-slate-300" />
        <div data-linea-relleno className="absolute inset-0 origin-top scale-y-0 bg-slate-700 will-change-transform" />
        <div data-linea-punta className="absolute left-1/2 top-0 will-change-transform">
          {/* Estela: degradado que suaviza la punta de la rayita mientras baja */}
          <div className="absolute bottom-0 left-1/2 h-24 w-[3px] -translate-x-1/2 rounded-full bg-gradient-to-b from-transparent via-slate-700/30 to-slate-700 blur-[1px]" />
          <div className="absolute left-1/2 top-0 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-700 shadow-[0_0_10px_2px_rgba(51,65,85,0.3)]" />
        </div>
      </div>

      <ol>
        {items.map((item, i) => {
          const tarjetaIzquierda = i % 2 === 0;

          return (
            <li
              key={item.title}
              className="relative grid items-center gap-4 py-6 pl-10 md:grid-cols-2 md:gap-0 md:py-0 md:pl-0"
            >
              {/* Marcador: círculo hueco sobre la línea, a la altura de la categoría (se rellena al pasar) */}
              <span
                data-marcador
                className="absolute left-3 top-9 z-10 size-3.5 -translate-x-1/2 rounded-full border-[3px] border-slate-500 bg-[#f6f6f7] md:left-1/2 md:top-1/2 md:-translate-y-1/2"
                aria-hidden="true"
              />

              {/* Categoría en grande, del lado contrario a la tarjeta */}
              <span
                className={cn(
                  "text-3xl font-bold tracking-tight text-slate-500 md:text-5xl",
                  tarjetaIzquierda ? "md:order-2 md:pl-24" : "md:pr-24 md:text-right"
                )}
              >
                {item.date}
              </span>

              <div className={cn(tarjetaIzquierda ? "md:order-1 md:pr-24" : "md:pl-24")}>
                {/* Tarjeta blanca con sombra: foto arriba y abajo título y texto */}
                <article data-tarjeta className="overflow-hidden rounded-3xl bg-white shadow-[0_12px_40px_-16px_rgba(16,42,67,0.35)] ring-1 ring-slate-900/5">
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.alt ?? item.title}
                      loading={i === 0 ? "eager" : "lazy"}
                      decoding="async"
                      className="size-full object-cover"
                      draggable={false}
                    />
                  </div>

                  <div className="p-6 md:p-8">
                    <h3 className="text-xl font-bold tracking-tight text-[#102a43] md:text-2xl">{item.title}</h3>
                    <p className="mt-4 text-sm leading-relaxed text-slate-600 md:text-[15px] md:leading-[1.75]">
                      {item.description}
                    </p>
                  </div>
                </article>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
