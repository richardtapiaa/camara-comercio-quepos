import * as React from "react";
import { animate, motion, useMotionValue, type AnimationPlaybackControls } from "framer-motion";
import useMeasure from "react-use-measure";
import { cn } from "@/lib/utils";

export type InfiniteSliderProps = {
  children: React.ReactNode;
  gap?: number;
  /** Velocidad en px por segundo. */
  speed?: number;
  /** Velocidad al pasar el cursor por encima. */
  speedOnHover?: number;
  direction?: "horizontal" | "vertical";
  reverse?: boolean;
  className?: string;
};

export function InfiniteSlider({
  children,
  gap = 16,
  speed = 100,
  speedOnHover,
  direction = "horizontal",
  reverse = false,
  className,
}: InfiniteSliderProps) {
  const [currentSpeed, setCurrentSpeed] = React.useState(speed);
  const [ref, { width, height }] = useMeasure();
  const translation = useMotionValue(0);
  const [isTransitioning, setIsTransitioning] = React.useState(false);
  const [key, setKey] = React.useState(0);

  React.useEffect(() => {
    const size = direction === "horizontal" ? width : height;
    if (!size) return;

    // El contenido está duplicado: se recorre una mitad y se vuelve a empezar sin salto
    const contentSize = size + gap;
    const from = reverse ? -contentSize / 2 : 0;
    const to = reverse ? 0 : -contentSize / 2;

    let controls: AnimationPlaybackControls;

    if (isTransitioning) {
      // Termina el ciclo actual a la nueva velocidad antes de reiniciar
      const remaining = Math.abs(translation.get() - to);
      controls = animate(translation, [translation.get(), to], {
        ease: "linear",
        duration: remaining / currentSpeed,
        onComplete: () => {
          setIsTransitioning(false);
          setKey((k) => k + 1);
        },
      });
    } else {
      controls = animate(translation, [from, to], {
        ease: "linear",
        duration: Math.abs(to - from) / currentSpeed,
        repeat: Infinity,
        repeatType: "loop",
        repeatDelay: 0,
        onRepeat: () => translation.set(from),
      });
    }

    return () => controls.stop();
  }, [key, translation, currentSpeed, width, height, gap, isTransitioning, direction, reverse]);

  const hoverProps = speedOnHover
    ? {
        onHoverStart: () => {
          setIsTransitioning(true);
          setCurrentSpeed(speedOnHover);
        },
        onHoverEnd: () => {
          setIsTransitioning(true);
          setCurrentSpeed(speed);
        },
      }
    : {};

  return (
    <div className={cn("overflow-hidden", className)}>
      <motion.div
        ref={ref}
        className={cn("flex", direction === "horizontal" ? "w-max" : "h-max flex-col")}
        style={{
          ...(direction === "horizontal" ? { x: translation } : { y: translation }),
          gap: `${gap}px`,
        }}
        {...hoverProps}
      >
        {children}
        {children}
      </motion.div>
    </div>
  );
}
