"use client" 

import * as React from "react"
 
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils";
 
export interface MagicTextProps {
  text: string;
  /** Clases del párrafo (tamaño, peso, color, interlineado...); las palabras las heredan */
  className?: string;
  /** Opacidad de las palabras que todavía no se revelan */
  opacidadInicial?: number;
}
 
interface WordProps {
  children: string;
  progress: MotionValue<number>;
  range: number[];
  opacidadInicial: number;
}
 
// Cada palabra tiene una copia tenue detrás y encima la versión llena, que aparece con el scroll
const Word: React.FC<WordProps> = ({ children, progress, range, opacidadInicial }) => {
  const opacity = useTransform(progress, range, [0, 1]);
 
  return (
    <span className="relative mr-[0.25em]">
      <span className="absolute" style={{ opacity: opacidadInicial }} aria-hidden="true">
        {children}
      </span>
      <motion.span style={{ opacity: opacity }}>{children}</motion.span>
    </span>
  );
};
 
export const MagicText: React.FC<MagicTextProps> = ({ text, className, opacidadInicial = 0.2 }) => {
  const container = useRef<HTMLParagraphElement>(null);
 
  const { scrollYProgress } = useScroll({
    target: container,
 
    offset: ["start 0.9", "start 0.25"],
  });
  const words = text.split(" ");
 
  return (
    <p ref={container} className={cn("flex flex-wrap", className)}>
      {words.map((word, i) => {
        const start = i / words.length;
 
        const end = start + 1 / words.length;
 
        return (
          <Word key={i} progress={scrollYProgress} range={[start, end]} opacidadInicial={opacidadInicial}>
            {word}
          </Word>
        );
      })}
    </p>
  );
};