"use client";

import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Globe,
  Handshake,
  HeartHandshake,
  Landmark,
  Leaf,
  MessagesSquare,
  Scale,
  Smile,
  Users,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface Objetivo {
  letra: string;
  texto: string;
}

const iconos: LucideIcon[] = [Landmark, MessagesSquare, Handshake, Users, Globe, Smile, HeartHandshake, Leaf, Scale];

type ObjetivoEnLista = Objetivo & { tempId: number; icono: LucideIcon };

interface ObjetivoCardProps {
  position: number;
  objetivo: ObjetivoEnLista;
  handleMove: (steps: number) => void;
  cardSize: number;
}

const ObjetivoCard: React.FC<ObjetivoCardProps> = ({ position, objetivo, handleMove, cardSize }) => {
  const isCenter = position === 0;
  const Icono = objetivo.icono;

  return (
    <div
      onClick={() => handleMove(position)}
      className={cn(
        "absolute left-1/2 top-1/2 cursor-pointer rounded-3xl bg-white p-8 transition-all duration-500 ease-in-out",
        isCenter ? "z-10 text-neutral-900" : "z-0 text-neutral-700"
      )}
      style={{
        width: cardSize,
        height: cardSize,
        transform: `
          translate(-50%, -50%)
          translateX(${(cardSize / 1.5) * position}px)
          translateY(${isCenter ? -65 : position % 2 ? 15 : -15}px)
          rotate(${isCenter ? 0 : position % 2 ? 2.5 : -2.5}deg)
        `,
        boxShadow: isCenter
          ? "0 24px 48px -12px rgba(14, 59, 102, 0.28)"
          : "0 6px 16px -6px rgba(14, 59, 102, 0.12)",
      }}
    >
      <div className="mb-4 flex h-14 w-12 items-center justify-center rounded-xl bg-[#E8F4FA] text-[#1B66A6]">
        <Icono className="h-6 w-6" aria-hidden="true" />
      </div>
      <h3 className={cn("text-[15px] font-medium leading-snug sm:text-lg", isCenter ? "text-neutral-900" : "text-neutral-800")}>
        {objetivo.texto}
      </h3>
    </div>
  );
};

export default function ObjetivosCards({ objetivos }: { objetivos: Objetivo[] }) {
  const [cardSize, setCardSize] = useState(365);
  const [lista, setLista] = useState<ObjetivoEnLista[]>(() => {
    const items = objetivos.map((objetivo, i) => ({ ...objetivo, tempId: i, icono: iconos[i % iconos.length] }));
    const centro = items.length % 2 ? (items.length + 1) / 2 : items.length / 2;
    return [...items.slice(-centro), ...items.slice(0, -centro)];
  });

  const handleMove = (steps: number) => {
    const nuevaLista = [...lista];
    if (steps > 0) {
      for (let i = steps; i > 0; i--) {
        const item = nuevaLista.shift();
        if (!item) return;
        nuevaLista.push({ ...item, tempId: Math.random() });
      }
    } else {
      for (let i = steps; i < 0; i++) {
        const item = nuevaLista.pop();
        if (!item) return;
        nuevaLista.unshift({ ...item, tempId: Math.random() });
      }
    }
    setLista(nuevaLista);
  };

  useEffect(() => {
    const updateSize = () => {
      const { matches } = window.matchMedia("(min-width: 640px)");
      setCardSize(matches ? 365 : 290);
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const botonControl = cn(
    "flex h-14 w-14 items-center justify-center rounded-full text-2xl transition-colors",
    "border-2 border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-900 hover:text-white",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2"
  );

  return (
    <div className="relative w-full overflow-hidden" style={{ height: 600 }} aria-label="Objetivos específicos">
      {lista.map((objetivo, index) => {
        const position = lista.length % 2 ? index - (lista.length + 1) / 2 : index - lista.length / 2;
        return (
          <ObjetivoCard
            key={objetivo.tempId}
            objetivo={objetivo}
            handleMove={handleMove}
            position={position}
            cardSize={cardSize}
          />
        );
      })}
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        <button type="button" onClick={() => handleMove(-1)} className={botonControl} aria-label="Objetivo anterior">
          <ChevronLeft />
        </button>
        <button type="button" onClick={() => handleMove(1)} className={botonControl} aria-label="Objetivo siguiente">
          <ChevronRight />
        </button>
      </div>
    </div>
  );
}
