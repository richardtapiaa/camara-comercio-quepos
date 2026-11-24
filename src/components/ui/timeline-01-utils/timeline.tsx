import * as React from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";
import "../../../styles/actividades/linea-tiempo.css";

gsap.registerPlugin(ScrollTrigger);

export type TimelineItem = {
  title: string;
  description: string;
  date: string;
  image: string;
  imageSrcSet?: string;
  alt?: string;
};

const TAMANO_FOTO =
  "(min-width: 1280px) 480px, (min-width: 1024px) calc(50vw - 160px), (min-width: 768px) min(672px, calc(100vw - 144px)), calc(100vw - 88px)";

const PUNTO_REFERENCIA = "70%";

const VISIBLES = 4;

const ESCRITORIO = "(min-width: 1024px)";

const SIN_MOVIMIENTO = "(prefers-reduced-motion: reduce)";

function ListaActividades({
  titulo,
  descripcion,
  id,
  abierta,
  onAlternar,
  onFin,
}: {
  titulo: string;
  descripcion: string;
  id: string;
  abierta: boolean;
  onAlternar: () => void;
  onFin: (abierta: boolean) => void;
}) {
  const lineas = descripcion
    .split("\n")
    .map((l) => l.replace(/^\s*[•·-]\s*/, "").trim())
    .filter(Boolean);
  const extra = lineas.slice(VISIBLES);
  const claseTexto =
    "list-disc space-y-0.5 pl-5 text-sm leading-relaxed text-slate-600 marker:text-[#2780c9] md:text-[15px] md:leading-[1.75]";

  return (
    <div className="mt-4">
      <ul className={claseTexto}>
        {lineas.slice(0, VISIBLES).map((l) => (
          <li key={l}>{l}</li>
        ))}
      </ul>
      {extra.length > 0 && (
        <>
          <div
            id={id}
            className={cn(
              "grid transition-[grid-template-rows,opacity] duration-500 ease-out motion-reduce:transition-none",
              abierta ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
            )}
            onTransitionEnd={(e) => e.target === e.currentTarget && e.propertyName === "grid-template-rows" && onFin(abierta)}
            inert={!abierta}
          >
            <ul className={cn("overflow-hidden", claseTexto, "mt-0.5")}>
              {extra.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
          </div>
          <button
            type="button"
            onClick={onAlternar}
            aria-expanded={abierta}
            aria-controls={id}
            className="group -mx-1 mt-2 inline-flex min-h-8 items-center gap-1.5 rounded-full px-1 py-1.5 text-sm font-semibold text-[#1d6aa8] transition-colors hover:text-[#17578b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1d6aa8]"
          >
            {abierta ? "Ver menos" : `Ver más (${extra.length})`}
            <span className="sr-only">: {titulo}</span>
            <svg
              viewBox="0 0 24 24"
              className={cn("size-4 transition-transform duration-300 motion-reduce:transition-none", abierta && "rotate-180")}
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        </>
      )}
    </div>
  );
}

function TarjetaActividad({
  item,
  indice,
  onEspacio,
}: {
  item: TimelineItem;
  indice: number;
  onEspacio?: (px: number) => void;
}) {
  const marco = React.useRef<HTMLDivElement>(null);
  const [abierta, setAbierta] = React.useState(false);
  const [altoFijo, setAltoFijo] = React.useState<number | null>(null);

  const modo = React.useRef<"encima" | "espacio" | "empuja">("encima");
  const cuadro = React.useRef(0);

  const soltar = () => setAltoFijo(null);
  const sinMovimiento = () => window.matchMedia(SIN_MOVIMIENTO).matches;
  const anclaje = (activo: boolean) => {
    document.documentElement.style.overflowAnchor = activo ? "" : "none";
  };
  const medirLinea = () => marco.current?.dispatchEvent(new Event("timeline-medir", { bubbles: true }));
  const seguirLinea = () => {
    medirLinea();
    cuadro.current = requestAnimationFrame(seguirLinea);
  };
  const terminarCambio = () => {
    cancelAnimationFrame(cuadro.current);
    ScrollTrigger.refresh();
    anclaje(true);
  };
  React.useEffect(() => () => cancelAnimationFrame(cuadro.current), []);

  const alTerminar = (quedoAbierta: boolean) => {
    if (!quedoAbierta) soltar();
    if (modo.current !== "encima") terminarCambio();
  };
  const alternar = () => {
    if (!abierta) {
      const angosta = !window.matchMedia(ESCRITORIO).matches;
      modo.current = angosta ? "empuja" : onEspacio ? "espacio" : "encima";
    }
    const actual = modo.current;
    if (actual !== "encima") anclaje(false);

    if (actual === "empuja") {
      setAbierta((a) => !a);
      if (sinMovimiento()) requestAnimationFrame(terminarCambio);
      else {
        cancelAnimationFrame(cuadro.current);
        cuadro.current = requestAnimationFrame(seguirLinea);
      }
      return;
    }

    if (!abierta) {
      setAltoFijo(marco.current?.offsetHeight ?? null);
      setAbierta(true);
      if (actual === "espacio")
        onEspacio?.(marco.current?.querySelector<HTMLElement>(`#actividades-extra-${indice} > ul`)?.scrollHeight ?? 0);
    } else {
      setAbierta(false);
      if (actual === "espacio") onEspacio?.(0);
      if (sinMovimiento()) soltar();
    }
    if (actual === "espacio" && sinMovimiento()) requestAnimationFrame(terminarCambio);
  };

  const idTitulo = `actividad-titulo-${indice}`;

  return (
    <div ref={marco} className="relative" style={altoFijo ? { height: altoFijo } : undefined}>
      <article
        aria-labelledby={idTitulo}
        className={cn(
          "overflow-hidden rounded-3xl bg-white shadow-[0_12px_40px_-16px_rgba(16,42,67,0.35)] ring-1 ring-slate-900/5",
          altoFijo && "absolute inset-x-0 top-0 z-30",
        )}
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
          <img
            src={item.image}
            srcSet={item.imageSrcSet}
            sizes={item.imageSrcSet ? TAMANO_FOTO : undefined}
            alt={item.alt ?? item.title}
            loading="lazy"
            decoding="async"
            className="size-full object-cover"
            draggable={false}
          />
        </div>

        <div className="p-5 sm:p-6 lg:p-8">
          <h3 id={idTitulo} className="text-xl font-bold tracking-tight text-balance text-[#102a43] md:text-2xl">
            {item.title}
          </h3>
          <ListaActividades
            titulo={item.title}
            descripcion={item.description}
            id={`actividades-extra-${indice}`}
            abierta={abierta}
            onAlternar={alternar}
            onFin={alTerminar}
          />
        </div>
      </article>
    </div>
  );
}

function useAnimacionTimeline(ref: React.RefObject<HTMLDivElement | null>) {
  React.useLayoutEffect(() => {
    const raiz = ref.current;
    if (!raiz) return;

    const linea = raiz.querySelector<HTMLElement>("[data-linea]")!;
    const relleno = raiz.querySelector<HTMLElement>("[data-linea-relleno]")!;
    const cursor = raiz.querySelector<HTMLElement>("[data-cursor]")!;
    const punta = raiz.querySelector<HTMLElement>("[data-linea-punta]")!;
    const marcadores = gsap.utils.toArray<HTMLElement>("[data-marcador]", raiz);
    if (marcadores.length < 2) return;

    const tramos = [
      { fondo: "[data-linea-tronco]", viajero: "[data-linea-perezoso]", desde: 0, hasta: 1 },
      { fondo: "[data-linea-agua]", viajero: "[data-linea-kayak]", desde: 1, hasta: 3 },
      { fondo: "[data-linea-cable]", viajero: "[data-linea-canopy]", desde: 3, hasta: 4 },
      { fondo: "[data-linea-agua-pesca]", viajero: "[data-linea-pescado]", desde: 4, hasta: 5 },
      { fondo: "[data-linea-arena]", viajero: "[data-linea-tortuga]", desde: 5, hasta: marcadores.length - 1 },
    ]
      .map((t) => ({ ...t, fondo: raiz.querySelector<HTMLElement>(t.fondo), viajero: raiz.querySelector<HTMLElement>(t.viajero) }))
      .filter((t): t is typeof t & { fondo: HTMLElement; viajero: HTMLElement } => !!t.fondo && !!t.viajero && !!marcadores[t.hasta]);

    let posiciones: number[] = [];
    let largo = 0;
    const medir = () => {
      const base = raiz.getBoundingClientRect().top;
      const centros = marcadores.map((m) => {
        const r = m.getBoundingClientRect();
        return r.top + r.height / 2 - base;
      });
      const inicio = centros[0];
      largo = centros[centros.length - 1] - inicio;
      posiciones = centros.map((c) => c - inicio);
      linea.style.top = `${inicio}px`;
      linea.style.height = `${largo}px`;
      for (const { fondo, desde, hasta } of tramos) {
        fondo.style.top = `${centros[desde]}px`;
        fondo.style.height = `${centros[hasta] - centros[desde]}px`;
      }
    };
    medir();
    ScrollTrigger.addEventListener("refreshInit", medir);
    raiz.addEventListener("timeline-medir", medir);

    const pausarFuera = new IntersectionObserver(
      (entradas) => entradas.forEach(({ target, isIntersecting }) => target.toggleAttribute("data-oculto", !isIntersecting)),
      { rootMargin: "120px 0px" },
    );
    raiz.querySelectorAll(".agua-linea").forEach((agua) => pausarFuera.observe(agua));

    const activar = (elemento: Element, activo: boolean) => elemento.toggleAttribute("data-activo", activo);

    const ctx = gsap.context(() => {
      if (window.matchMedia(SIN_MOVIMIENTO).matches) {
        gsap.set(relleno, { scaleY: 1 });
        marcadores.forEach((m) => activar(m, true));
        return;
      }

      let tramoActual: number | null = null;
      const moverViajeros = (y: number) => {
        const actual = tramos.findIndex((t) => y >= posiciones[t.desde] - 1 && y < posiciones[t.hasta] - 4);
        if (actual === tramoActual) return;
        tramoActual = actual;
        tramos.forEach((t, i) => activar(t.viajero, i === actual));
        activar(punta, actual === -1);
      };

      let puntosActivos = -1;
      const marcarPuntos = (recorrido: number) => {
        let activos = 0;
        while (activos < posiciones.length && posiciones[activos] <= recorrido) activos++;
        if (activos === puntosActivos) return;
        puntosActivos = activos;
        marcadores.forEach((m, i) => activar(m, i < activos));
      };

      let animacion: gsap.core.Timeline | null = null;
      const recorridoCursor = () => (animacion ? animacion.progress() * largo : 0);

      animacion = gsap
        .timeline({
          defaults: { ease: "none" },
          onUpdate: () => moverViajeros(recorridoCursor()),
          scrollTrigger: {
            trigger: marcadores[0],
            start: `center ${PUNTO_REFERENCIA}`,
            endTrigger: marcadores[marcadores.length - 1],
            end: `center ${PUNTO_REFERENCIA}`,
            scrub: 1.2,
            invalidateOnRefresh: true,
            onUpdate: (self) => marcarPuntos(self.scroll() - self.start),
            onRefresh: (self) => {
              puntosActivos = -1;
              tramoActual = null;
              marcarPuntos(self.scroll() - self.start);
              moverViajeros(recorridoCursor());
            },
          },
        })
        .fromTo(relleno, { scaleY: 0 }, { scaleY: 1, force3D: true })
        .fromTo(cursor, { y: 0 }, { y: () => largo, force3D: true }, 0);

      moverViajeros(recorridoCursor());
      const st = animacion.scrollTrigger;
      if (st) marcarPuntos(st.scroll() - st.start);
    }, raiz);

    return () => {
      ScrollTrigger.removeEventListener("refreshInit", medir);
      raiz.removeEventListener("timeline-medir", medir);
      pausarFuera.disconnect();
      ctx.revert();
    };
  }, [ref]);
}

const POSICION_LINEA = "left-6 md:left-8 lg:left-1/2";

export default function Timeline({
  items,
  perezoso,
  kayak,
  canopy,
  pescado,
  tortuga,
}: {
  items: TimelineItem[];
  perezoso?: string;
  kayak?: string;
  canopy?: string;
  pescado?: string;
  tortuga?: string;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [espacioFinal, setEspacioFinal] = React.useState(0);
  useAnimacionTimeline(ref);

  return (
    <div ref={ref} className="relative">
      <div data-linea className={cn("pointer-events-none absolute w-px", POSICION_LINEA)} aria-hidden="true">
        <div className="absolute inset-0 bg-slate-300" />
        <div data-linea-relleno className="absolute inset-0 origin-top scale-y-0 bg-slate-700 will-change-transform" />

        <div data-cursor className="absolute inset-x-0 top-0 z-20 will-change-transform">
          <div data-linea-punta data-viajero className="absolute left-1/2 top-0">
            <div className="absolute bottom-0 left-1/2 h-24 w-[3px] -translate-x-1/2 rounded-full bg-gradient-to-b from-transparent via-slate-700/30 to-slate-700 blur-[1px]" />
            <div className="absolute left-1/2 top-0 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-700 shadow-[0_0_10px_2px_rgba(51,65,85,0.3)]" />
          </div>

          {perezoso && (
            <div data-linea-perezoso data-viajero className="absolute left-0 top-0">
              <div className="-translate-x-[37%] -translate-y-[6%]">
                <img
                  src={perezoso}
                  alt=""
                  width={407}
                  height={367}
                  className="h-auto w-20 max-w-none origin-[37%_0%] animate-[perezoso-balanceo_2.4s_ease-in-out_infinite] select-none [mask-image:linear-gradient(to_bottom,transparent,black_14%)] motion-reduce:animate-none md:w-32"
                  draggable={false}
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>
          )}

          {kayak && (
            <div data-linea-kayak data-viajero className="absolute left-0 top-0">
              <img
                src={kayak}
                alt=""
                width={224}
                height={420}
                className="-ml-6 -mt-12 h-auto w-12 max-w-none animate-[kayak-oleaje_1.8s_ease-in-out_infinite] select-none motion-reduce:animate-none md:-ml-10 md:-mt-20 md:w-20"
                draggable={false}
                loading="lazy"
                decoding="async"
              />
            </div>
          )}

          {canopy && (
            <div data-linea-canopy data-viajero className="absolute left-0 top-0">
              <div className="-translate-x-[68%] -translate-y-[6%]">
                <img
                  src={canopy}
                  alt=""
                  width={308}
                  height={344}
                  className="h-auto w-16 max-w-none origin-[68%_6%] animate-[tirolesa-balanceo_1.6s_ease-in-out_infinite] select-none motion-reduce:animate-none md:w-24"
                  draggable={false}
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>
          )}

          {pescado && (
            <div data-linea-pescado data-viajero className="absolute left-0 top-0">
              <img
                src={pescado}
                alt=""
                width={1024}
                height={1024}
                className="-ml-10 -mt-8 h-auto w-20 max-w-none rotate-90 select-none md:-ml-16 md:-mt-12 md:w-32"
                draggable={false}
                loading="lazy"
                decoding="async"
              />
            </div>
          )}

          {tortuga && (
            <div data-linea-tortuga data-viajero className="absolute left-0 top-0">
              <img
                src={tortuga}
                alt=""
                width={1796}
                height={876}
                className="-ml-11 -mt-6 h-auto w-22 max-w-none rotate-90 select-none drop-shadow-[0_3px_3px_rgb(80_55_20/0.3)] md:-ml-[4.5rem] md:-mt-9 md:w-36"
                draggable={false}
                loading="lazy"
                decoding="async"
              />
            </div>
          )}
        </div>
      </div>

      {perezoso && (
        <div
          data-linea-tronco
          className={cn("tronco-linea pointer-events-none absolute w-3.5 -translate-x-1/2 rounded-full md:w-5", POSICION_LINEA)}
          aria-hidden="true"
        >
          <span className="tronco-nudo absolute left-1/2 top-[32%] h-3 w-2 -translate-x-1/2 rounded-[50%] md:h-4 md:w-3" />
          <span className="tronco-nudo absolute left-1/2 top-[71%] h-2.5 w-1.5 -translate-x-1/2 rounded-[50%] md:h-3 md:w-2" />
          <svg className="absolute right-[55%] top-[12%] w-10 md:w-16" viewBox="0 0 64 40" fill="none" aria-hidden="true">
            <path d="M62 30C48 26 36 20 22 10" stroke="#5a3a20" strokeWidth="4" strokeLinecap="round" />
            <path d="M40 21C36 13 38 6 44 3C46 11 45 17 40 21Z" fill="#5f8f3e" />
            <path d="M24 11C16 10 10 5 9 0C16 0 22 4 24 11Z" fill="#6fa34a" />
            <path d="M30 15C24 20 16 21 10 18C15 12 23 11 30 15Z" fill="#4e7c33" />
          </svg>
        </div>
      )}

      {kayak && (
        <div data-linea-agua className={cn("agua-linea pointer-events-none absolute w-6 -translate-x-1/2 md:w-9", POSICION_LINEA)} aria-hidden="true" />
      )}

      {canopy && (
        <div
          data-linea-cable
          className={cn("cable-linea pointer-events-none absolute w-[3px] -translate-x-1/2 md:w-1", POSICION_LINEA)}
          aria-hidden="true"
        >
          <span className="cable-anclaje absolute -top-1 left-1/2 h-2 w-4 -translate-x-1/2 rounded-sm" />
          <span className="cable-anclaje absolute -bottom-1 left-1/2 h-2 w-4 -translate-x-1/2 rounded-sm" />
        </div>
      )}

      {pescado && (
        <div data-linea-agua-pesca className={cn("agua-linea pointer-events-none absolute w-6 -translate-x-1/2 md:w-9", POSICION_LINEA)} aria-hidden="true" />
      )}

      {tortuga && (
        <div data-linea-arena className={cn("arena-linea pointer-events-none absolute w-6 -translate-x-1/2 md:w-9", POSICION_LINEA)} aria-hidden="true" />
      )}

      <ol
        className="transition-[padding-bottom] duration-500 ease-out motion-reduce:transition-none"
        style={espacioFinal ? { paddingBottom: espacioFinal } : undefined}
      >
        {items.map((item, i) => {
          const tarjetaIzquierda = i % 2 === 0;

          return (
            <li key={item.title} className="relative grid items-center gap-4 py-6 pl-14 md:pl-20 lg:grid-cols-2 lg:gap-0 lg:py-0 lg:pl-0">
              <span
                data-marcador
                className="absolute left-6 top-9 z-10 size-3.5 -translate-x-1/2 rounded-full border-[3px] border-slate-500 bg-[#f6f6f7] md:left-8 lg:left-1/2 lg:top-1/2 lg:-translate-y-1/2"
                aria-hidden="true"
              />

              {item.date && (
                <span
                  className={cn(
                    "text-3xl font-bold tracking-tight text-slate-500 lg:row-start-1 lg:text-5xl",
                    tarjetaIzquierda ? "lg:col-start-2 lg:pl-24" : "lg:col-start-1 lg:pr-24 lg:text-right",
                  )}
                >
                  {item.date}
                </span>
              )}

              <div
                className={cn(
                  "md:max-w-2xl lg:row-start-1 lg:max-w-none",
                  tarjetaIzquierda ? "lg:col-start-1 lg:pr-24" : "lg:col-start-2 lg:pl-24",
                )}
              >
                <TarjetaActividad item={item} indice={i} onEspacio={i === items.length - 1 ? setEspacioFinal : undefined} />
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
