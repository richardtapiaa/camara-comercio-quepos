import { useEffect, useRef, useState } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";

import { cn } from "@/lib/utils";

interface VelocityScrollProps {
  text: string;
  default_velocity?: number;
  className?: string;
}

interface ParallaxProps {
  children: string;
  baseVelocity: number;
  className?: string;
}

export const wrap = (min: number, max: number, v: number) => {
  const rangeSize = max - min;
  return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
};

// Definido fuera de VelocityScroll: si se declara dentro, React lo trata como un componente nuevo
// en cada render y reinicia su estado y su animación.
function ParallaxText({ children, baseVelocity = 100, className }: ParallaxProps) {
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
    let moveBy = directionFactor.current * baseVelocity * (delta / 1000);

    if (velocityFactor.get() < 0) {
      directionFactor.current = -1;
    } else if (velocityFactor.get() > 0) {
      directionFactor.current = 1;
    }

    moveBy += directionFactor.current * moveBy * velocityFactor.get();

    const nextX = baseX.get() + moveBy;
    baseX.set(nextX);
    // Se avanza de a un texto completo y se vuelve al inicio sin que se note el salto
    x.set(`${wrap(-100 / repetitionsRef.current, 0, nextX)}%`);
  });

  return (
    <div className="w-full overflow-hidden whitespace-nowrap" ref={containerRef}>
      <motion.div className={cn("inline-block", className)} style={{ x }}>
        {Array.from({ length: repetitions }).map((_, i) => (
          <span key={i} ref={i === 0 ? textRef : null}>
            {children}{" "}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

export function VelocityScroll({ text, default_velocity = 5, className }: VelocityScrollProps) {
  return (
    <section className="relative w-full">
      <ParallaxText baseVelocity={default_velocity} className={className}>
        {text}
      </ParallaxText>
      <ParallaxText baseVelocity={-default_velocity} className={className}>
        {text}
      </ParallaxText>
    </section>
  );
}
