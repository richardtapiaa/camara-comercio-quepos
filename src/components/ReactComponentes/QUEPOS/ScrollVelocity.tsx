import { useEffect, useRef, useState } from "react";
import {
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";

import { cn } from "@/lib/utils";

// Imagen encima de una letra del texto (p. ej. un animal sobre la C), que se mueve con ella
export interface Decoracion {
  // Posición de la letra en el texto, contando espacios y desde 0
  indice: number;
  src: string;
  // Clases de posición y tamaño (en em, crecen con la letra). Sin ella va centrada encima de la letra.
  // Una misma letra puede tener varias decoraciones (p. ej. un animal arriba y hojas en la base)
  clase?: string;
}

const POSICION_POR_DEFECTO = "bottom-[78%] left-1/2 h-[0.9em] -translate-x-1/2";

interface VelocityScrollProps {
  text: string;
  default_velocity?: number;
  className?: string;
  scrollReactive?: boolean;
  // 2: dos líneas en direcciones opuestas; 1: una sola línea
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

// El texto letra por letra; las letras con decoración llevan su imagen encima (tamaño en em: crece con la letra)
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
  const baseX = useMotionValue(0);
  const x = useMotionValue("0%");
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400,
  });

  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], {
    clamp: false,
  });

  const [repetitions, setRepetitions] = useState(1);
  const repetitionsRef = useRef(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  // Solo se mueve cerca de la pantalla: fuera de ella no tiene sentido recalcular un cuadro tras otro
  const enPantalla = useInView(containerRef, { margin: "200px 0px" });
  const sinMovimiento = useReducedMotion();

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

  const directionFactor = useRef<number>(1);
  useAnimationFrame((_, delta) => {
    if (!enPantalla || sinMovimiento) return;
    let moveBy = directionFactor.current * baseVelocity * (delta / 1000);

    if (scrollReactive) {
      if (velocityFactor.get() < 0) {
        directionFactor.current = -1;
      } else if (velocityFactor.get() > 0) {
        directionFactor.current = 1;
      }

      moveBy += directionFactor.current * moveBy * velocityFactor.get();
    }

    const nextX = baseX.get() + moveBy;
    baseX.set(nextX);
    x.set(`${wrap(-100 / repetitionsRef.current, 0, nextX)}%`);
  });

  return (
    // Con decoraciones solo se recorta a los lados: las imágenes sobresalen por arriba de las letras
    <div className={cn("w-full whitespace-nowrap", decoraciones?.length ? "overflow-x-clip" : "overflow-hidden")} ref={containerRef}>
      <motion.div className={cn("inline-block", className)} style={{ x }}>
        {Array.from({ length: repetitions }).map((_, i) => (
          <span key={i} ref={i === 0 ? textRef : null}>
            {decoraciones?.length ? textoConDecoraciones(children, decoraciones) : children}{" "}
          </span>
        ))}
      </motion.div>
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
        <ParallaxText
          baseVelocity={-default_velocity}
          className={className}
          scrollReactive={scrollReactive}
          decoraciones={decoraciones}
        >
          {text}
        </ParallaxText>
      )}
    </section>
  );
}
