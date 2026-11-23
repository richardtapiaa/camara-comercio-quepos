"use client"

import * as React from "react"

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export interface MagicTextProps {
  text: string;
  className?: string;
  opacidadInicial?: number;
}

const limitar = (valor: number) => Math.min(1, Math.max(0, valor));

export const MagicText: React.FC<MagicTextProps> = ({ text, className, opacidadInicial = 0.2 }) => {
  const container = useRef<HTMLParagraphElement>(null);
  const words = text.split(" ");

  // Las palabras se encienden una tras otra mientras el párrafo sube del 90 % al 25 % de la pantalla.
  useEffect(() => {
    const parrafo = container.current;
    if (!parrafo) return;
    const palabras = Array.from(parrafo.querySelectorAll<HTMLElement>("[data-palabra]"));
    let cuadro = 0;
    let ultimo = -1;

    const actualizar = () => {
      cuadro = 0;
      const alto = window.innerHeight;
      const progreso = limitar((alto * 0.9 - parrafo.getBoundingClientRect().top) / (alto * 0.65));
      if (progreso === ultimo) return;
      ultimo = progreso;
      palabras.forEach((palabra, i) => {
        palabra.style.opacity = String(limitar(progreso * palabras.length - i));
      });
    };
    const pedir = () => {
      cuadro ||= requestAnimationFrame(actualizar);
    };

    actualizar();
    window.addEventListener("scroll", pedir, { passive: true });
    window.addEventListener("resize", pedir);
    return () => {
      cancelAnimationFrame(cuadro);
      window.removeEventListener("scroll", pedir);
      window.removeEventListener("resize", pedir);
    };
  }, [text]);

  return (
    <p ref={container} className={cn("flex flex-wrap", className)}>
      {words.map((word, i) => (
        <span key={i} className="relative mr-[0.25em]">
          <span className="absolute" style={{ opacity: opacidadInicial }} aria-hidden="true">
            {word}
          </span>
          <span data-palabra style={{ opacity: 0 }}>{word}</span>
        </span>
      ))}
    </p>
  );
};
