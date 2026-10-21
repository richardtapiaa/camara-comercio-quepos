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
// - Tramos con escena (props `perezoso` y `kayak`): del 1.er al 2.º marcador la línea es un tronco y baja un perezoso
//   agarrado de él; del 2.º al 4.º (Aventura → Adrenalina) es un río y baja un kayak; del 4.º al 5.º
//   (Adrenalina → Ecoturismo) es el cable de una tirolesa y baja una persona colgada de la polea. Mientras hay un viajero, la punta se esconde.
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

    // Cada tramo con escena: el fondo que cubre la línea (tronco, río…), su viajero y entre qué marcadores va
    const tramos = [
      { fondo: "[data-linea-tronco]", viajero: "[data-linea-perezoso]", desde: 0, hasta: 1 },
      { fondo: "[data-linea-agua]", viajero: "[data-linea-kayak]", desde: 1, hasta: 3 },
      { fondo: "[data-linea-cable]", viajero: "[data-linea-canopy]", desde: 3, hasta: 4 },
    ]
      .map((t) => ({
        ...t,
        fondo: raiz.querySelector<HTMLElement>(t.fondo),
        viajero: raiz.querySelector<HTMLElement>(t.viajero),
      }))
      .filter((t) => t.fondo && t.viajero && marcadores[t.hasta]);

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
      // Cada fondo cubre su tramo, de un marcador al otro
      tramos.forEach(({ fondo, desde, hasta }) => {
        const arriba = centroY(marcadores[desde]);
        fondo!.style.top = `${arriba}px`;
        fondo!.style.height = `${centroY(marcadores[hasta]) - arriba}px`;
      });
    };
    medir();
    ScrollTrigger.addEventListener("refreshInit", medir);

    const sinMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      if (sinMovimiento) {
        gsap.set(relleno, { scaleY: 1 });
        gsap.set(tarjetas, { autoAlpha: 1, y: 0 });
        gsap.set(punta, { autoAlpha: 0 });
        tramos.forEach(({ viajero }) => gsap.set(viajero, { autoAlpha: 0 }));
        gsap.set(marcadores, { backgroundColor: "#334155" });
        return;
      }

      // Dónde empieza y termina cada tramo, en px desde el inicio de la línea
      const limites = (t: (typeof tramos)[number]) => [
        centroY(marcadores[t.desde]) - centroY(primero),
        centroY(marcadores[t.hasta]) - centroY(primero),
      ];
      // Según dónde va la punta (posición ya suavizada por el scrub) se muestra el viajero de ese tramo y se esconde
      // la punta; fuera de los tramos vuelve la punta. Solo se anima cuando cambia de tramo, no en cada cuadro
      let tramoAntes: number | null = null;
      const actualizarViajeros = (y: number) => {
        const actual = tramos.findIndex((t) => {
          const [ini, fin] = limites(t);
          return y >= ini - 1 && y < fin - 4;
        });
        if (actual === tramoAntes) return;
        tramoAntes = actual;
        tramos.forEach((t, i) => gsap.to(t.viajero, { autoAlpha: i === actual ? 1 : 0, duration: 0.35, overwrite: "auto" }));
        gsap.to(punta, { autoAlpha: actual === -1 ? 1 : 0, duration: 0.35, overwrite: "auto" });
      };

      // Relleno y punta avanzan juntos. scrub: 1.2 = la línea alcanza al scroll en ~1,2 s con inercia, así no da
      // saltos con la rueda del mouse (que mueve la página a tirones). force3D la deja en la GPU
      const recorrido = gsap
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

      if (tramos.length) {
        // Los viajeros bajan junto con la punta (cada uno se ve solo en su tramo)
        tramos.forEach(({ viajero }) =>
          recorrido.fromTo(viajero, { y: 0 }, { y: () => linea.offsetHeight, force3D: true }, 0),
        );
        recorrido.eventCallback("onUpdate", () => actualizarViajeros(Number(gsap.getProperty(punta, "y"))));
        actualizarViajeros(0);
      }

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
export default function Timeline({
  items,
  perezoso,
  kayak,
  canopy,
}: {
  items: TimelineItem[];
  /** Imagen del perezoso que baja por el tronco (1.er → 2.º marcador) */
  perezoso?: string;
  /** Imagen del kayak que baja por el río (2.º → 4.º marcador) */
  kayak?: string;
  /** Imagen de la persona en la tirolesa (4.º → 5.º marcador) */
  canopy?: string;
}) {
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

        {/* Perezoso colgado del tronco entre el primer y el segundo marcador (lo mueve el script), derecho, cabeza
            arriba: la mano de la izquierda de la imagen (al 37 % del ancho, arriba de todo) va sobre el tronco y el
            cuerpo cuelga hacia el costado. La foto trae los brazos cortados arriba: ese borde se difumina. Se balancea despacio desde las manos para que se vea vivo. z-20: por encima
            del tronco y de las tarjetas (en celular la línea pasa pegada a ellas) */}
        {perezoso && (
          <div data-linea-perezoso className="invisible absolute left-0 top-0 z-20 opacity-0 will-change-transform">
            <div className="-translate-x-[37%] -translate-y-[6%]">
              <img
                src={perezoso}
                alt=""
                width={407}
                height={367}
                className="h-auto w-20 max-w-none origin-[37%_0%] animate-[perezoso-balanceo_2.4s_ease-in-out_infinite] select-none [mask-image:linear-gradient(to_bottom,transparent,black_14%)] motion-reduce:animate-none md:w-32"
                draggable={false}
                loading="lazy"
              />
            </div>
          </div>
        )}

        {/* Kayak bajando por el río entre el 2.º y el 4.º marcador (lo mueve el script). La imagen viene girada con
            la proa hacia abajo, a favor de la corriente; se mece de lado y sube y baja un poco, como sobre el agua */}
        {kayak && (
          <div data-linea-kayak className="invisible absolute left-0 top-0 z-20 opacity-0 will-change-transform">
            <img
              src={kayak}
              alt=""
              width={224}
              height={420}
              className="-ml-6 -mt-12 h-auto w-12 max-w-none animate-[kayak-oleaje_1.8s_ease-in-out_infinite] select-none motion-reduce:animate-none md:-ml-10 md:-mt-20 md:w-20"
              draggable={false}
              loading="lazy"
            />
          </div>
        )}

        {/* Persona en la tirolesa entre el 4.º y el 5.º marcador (la mueve el script). La polea de la imagen (al 68 %
            del ancho y 6 % del alto) va sobre el cable; el cuerpo cuelga a la izquierda y se balancea desde ahí */}
        {canopy && (
          <div data-linea-canopy className="invisible absolute left-0 top-0 z-20 opacity-0 will-change-transform">
            <div className="-translate-x-[68%] -translate-y-[6%]">
              <img
                src={canopy}
                alt=""
                width={308}
                height={344}
                className="h-auto w-16 max-w-none origin-[68%_6%] animate-[tirolesa-balanceo_1.6s_ease-in-out_infinite] select-none motion-reduce:animate-none md:w-24"
                draggable={false}
                loading="lazy"
              />
            </div>
          </div>
        )}
      </div>

      {/* Tronco: el tramo de la línea donde baja el perezoso (del primer al segundo marcador; top y alto los calcula
          el script) se ve como una rama de árbol con corteza, nudos y una ramita con hojas. Va encima de la línea y
          debajo de los marcadores y del perezoso */}
      {perezoso && (
        <div
          data-linea-tronco
          className="tronco-linea pointer-events-none absolute left-3 w-3.5 -translate-x-1/2 rounded-full md:left-1/2 md:w-5"
          aria-hidden="true"
        >
          {/* Nudos de la madera */}
          <span className="tronco-nudo absolute left-1/2 top-[32%] h-3 w-2 -translate-x-1/2 rounded-[50%] md:h-4 md:w-3" />
          <span className="tronco-nudo absolute left-1/2 top-[71%] h-2.5 w-1.5 -translate-x-1/2 rounded-[50%] md:h-3 md:w-2" />
          {/* Ramita con hojas saliendo hacia la izquierda, cerca de arriba */}
          <svg
            className="absolute right-[55%] top-[12%] w-10 md:w-16"
            viewBox="0 0 64 40"
            fill="none"
            aria-hidden="true"
          >
            <path d="M62 30C48 26 36 20 22 10" stroke="#5a3a20" strokeWidth="4" strokeLinecap="round" />
            <path d="M40 21C36 13 38 6 44 3C46 11 45 17 40 21Z" fill="#5f8f3e" />
            <path d="M24 11C16 10 10 5 9 0C16 0 22 4 24 11Z" fill="#6fa34a" />
            <path d="M30 15C24 20 16 21 10 18C15 12 23 11 30 15Z" fill="#4e7c33" />
          </svg>
        </div>
      )}

      {/* Río: el tramo del kayak (del 2.º al 4.º marcador; top y alto los calcula el script) es una franja de agua
          lisa con las orillas onduladas que corren hacia abajo */}
      {kayak && (
        <div
          data-linea-agua
          className="agua-linea pointer-events-none absolute left-3 w-6 -translate-x-1/2 md:left-1/2 md:w-9"
          aria-hidden="true"
        />
      )}

      {/* Tirolesa: el tramo del canopy (del 4.º al 5.º marcador; top y alto los calcula el script) es un cable de acero
          trenzado, con una placa de anclaje en cada punta */}
      {canopy && (
        <div
          data-linea-cable
          className="cable-linea pointer-events-none absolute left-3 w-[3px] -translate-x-1/2 md:left-1/2 md:w-1"
          aria-hidden="true"
        >
          <span className="cable-anclaje absolute -top-1 left-1/2 h-2 w-4 -translate-x-1/2 rounded-sm" />
          <span className="cable-anclaje absolute -bottom-1 left-1/2 h-2 w-4 -translate-x-1/2 rounded-sm" />
        </div>
      )}

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
