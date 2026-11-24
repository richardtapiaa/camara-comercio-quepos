import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

export interface Decoracion {
  indice: number;
  src: string;
  clase?: string;
}

const POSICION_POR_DEFECTO = "bottom-[78%] left-1/2 h-[0.9em] -translate-x-1/2";

const REPETICIONES_INICIALES = 8;

const RIGIDEZ = 400;
const AMORTIGUACION = 50;
const PASO_RESORTE = 0.004;
const MAX_DELTA = 0.04;

interface VelocityScrollProps {
  text: string;
  default_velocity?: number;
  className?: string;
  scrollReactive?: boolean;
  filas?: 1 | 2;
  decoraciones?: Decoracion[];
}

interface ParallaxProps {
  children: string;
  baseVelocity: number;
  className?: string;
  scrollReactive?: boolean;
  decoraciones?: Decoracion[];
}

function textoConDecoraciones(texto: string, decoraciones: Decoracion[]) {
  return Array.from(texto).map((letra, i) => {
    const deLaLetra = decoraciones.filter((d) => d.indice === i);
    if (!deLaLetra.length) return letra;
    return (
      <span key={i} className="relative inline-block">
        {letra}
        {deLaLetra.map((decoracion, j) => (
          <img
            key={j}
            src={decoracion.src}
            alt=""
            loading="lazy"
            decoding="async"
            draggable={false}
            className={cn(
              "pointer-events-none absolute w-auto max-w-none select-none",
              decoracion.clase ?? POSICION_POR_DEFECTO,
            )}
          />
        ))}
      </span>
    );
  });
}

export const wrap = (min: number, max: number, v: number) => {
  const rangeSize = max - min;
  return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
};

function ParallaxText({ children, baseVelocity = 100, className, scrollReactive = true, decoraciones }: ParallaxProps) {
  const [repetitions, setRepetitions] = useState(REPETICIONES_INICIALES);
  const repetitionsRef = useRef(REPETICIONES_INICIALES);
  const containerRef = useRef<HTMLDivElement>(null);
  const filaRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const calculateRepetitions = () => {
      if (containerRef.current && textRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const textWidth = textRef.current.offsetWidth;
        if (!textWidth) return;
        const newRepetitions = Math.ceil(containerWidth / textWidth) + 2;
        repetitionsRef.current = newRepetitions;
        setRepetitions(newRepetitions);
      }
    };

    calculateRepetitions();

    window.addEventListener("resize", calculateRepetitions);
    return () => window.removeEventListener("resize", calculateRepetitions);
  }, [children]);

  useEffect(() => {
    const contenedor = containerRef.current;
    const fila = filaRef.current;
    if (!contenedor || !fila || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cuadro = 0;
    let anterior = 0;
    let posicion = 0;
    let direccion = 1;
    let scrollAnterior = 0;
    let velocidad = 0;
    let inercia = 0;

    const avanzar = (ahora: number) => {
      cuadro = requestAnimationFrame(avanzar);
      const delta = Math.min((ahora - anterior) / 1000, MAX_DELTA);
      anterior = ahora;
      if (delta <= 0) return;

      let paso = direccion * baseVelocity * delta;
      if (scrollReactive) {
        const scroll = window.scrollY;
        const objetivo = (scroll - scrollAnterior) / delta;
        scrollAnterior = scroll;
        for (let resto = delta; resto > 0; resto -= PASO_RESORTE) {
          const h = Math.min(resto, PASO_RESORTE);
          inercia += (RIGIDEZ * (objetivo - velocidad) - AMORTIGUACION * inercia) * h;
          velocidad += inercia * h;
        }
        if (!objetivo && Math.abs(velocidad) < 0.01) velocidad = inercia = 0;

        const factor = velocidad * 0.005;
        if (factor < 0) direccion = -1;
        else if (factor > 0) direccion = 1;
        paso += direccion * paso * factor;
      }

      posicion += paso;
      fila.style.transform = `translateX(${wrap(-100 / repetitionsRef.current, 0, posicion)}%)`;
    };

    const observador = new IntersectionObserver(
      ([entrada]) => {
        cancelAnimationFrame(cuadro);
        if (!entrada.isIntersecting) return;
        anterior = performance.now();
        scrollAnterior = window.scrollY;
        velocidad = inercia = 0;
        cuadro = requestAnimationFrame(avanzar);
      },
      { rootMargin: "200px 0px" },
    );
    observador.observe(contenedor);

    return () => {
      observador.disconnect();
      cancelAnimationFrame(cuadro);
    };
  }, [baseVelocity, scrollReactive]);

  return (
    <div className={cn("w-full whitespace-nowrap", decoraciones?.length ? "overflow-x-clip" : "overflow-hidden")} ref={containerRef}>
      <div ref={filaRef} className={cn("inline-block", className)}>
        {Array.from({ length: repetitions }).map((_, i) => (
          <span key={i} ref={i === 0 ? textRef : null} aria-hidden={i > 0 ? true : undefined}>
            {decoraciones?.length ? textoConDecoraciones(children, decoraciones) : children}{" "}
          </span>
        ))}
      </div>
    </div>
  );
}

export function VelocityScroll({
  text,
  default_velocity = 5,
  className,
  scrollReactive = true,
  filas = 2,
  decoraciones,
}: VelocityScrollProps) {
  return (
    <section className="relative w-full">
      <ParallaxText baseVelocity={default_velocity} className={className} scrollReactive={scrollReactive} decoraciones={decoraciones}>
        {text}
      </ParallaxText>
      {filas === 2 && (
        <div aria-hidden="true">
          <ParallaxText
            baseVelocity={-default_velocity}
            className={className}
            scrollReactive={scrollReactive}
            decoraciones={decoraciones}
          >
            {text}
          </ParallaxText>
        </div>
      )}
    </section>
  );
}
