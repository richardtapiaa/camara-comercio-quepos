"use client";

import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import balanceIcon from "@/assets/icons-svg/inicio-icons/balance-svgrepo-com.svg";
import cantonIcon from "@/assets/icons-svg/inicio-icons/canton.svg";
import dialogoIcon from "@/assets/icons-svg/inicio-icons/dialogo.svg";
import grupoAfiliadosIcon from "@/assets/icons-svg/inicio-icons/grupo_afiliados.svg";
import initiativeIcon from "@/assets/icons-svg/inicio-icons/Initiative.svg";
import manosIcon from "@/assets/icons-svg/inicio-icons/manos.svg";
import mejorasIcon from "@/assets/icons-svg/inicio-icons/mejoraras.svg";
import naturalezaIcon from "@/assets/icons-svg/inicio-icons/naturaleza.svg";
import reconocimientoIcon from "@/assets/icons-svg/inicio-icons/reconocimiento.svg";

export interface Objetivo {
  letra: string;
  texto: string;
}

const iconos = [
  reconocimientoIcon,
  dialogoIcon,
  manosIcon,
  grupoAfiliadosIcon,
  cantonIcon,
  mejorasIcon,
  initiativeIcon,
  naturalezaIcon,
  balanceIcon,
];

type Icono = { src: string };
type ObjetivoEnLista = Objetivo & { tempId: number; icono: Icono };

interface ObjetivoCardProps {
  position: number;
  objetivo: ObjetivoEnLista;
  handleMove: (steps: number) => void;
}

const ObjetivoCard: React.FC<ObjetivoCardProps> = ({ position, objetivo, handleMove }) => {
  const isCenter = position === 0;

  return (
    <div
      onClick={() => handleMove(position)}
      className={cn(
        "absolute left-1/2 top-1/2 flex cursor-pointer flex-col justify-center rounded-3xl bg-white p-6 transition-all duration-500 ease-in-out sm:p-8",
        isCenter ? "z-10 text-neutral-900" : "z-0 text-neutral-700"
      )}
      style={{
        width: "var(--card)",
        height: "var(--card)",
        transform: `
          translate(-50%, -50%)
          translateX(calc(var(--card) / 1.5 * ${position}))
          translateY(${isCenter ? -65 : position % 2 ? 15 : -15}px)
          rotate(${isCenter ? 0 : position % 2 ? 2.5 : -2.5}deg)
        `,
        boxShadow: isCenter
          ? "0 24px 48px -12px rgba(14, 59, 102, 0.28)"
          : "0 6px 16px -6px rgba(14, 59, 102, 0.12)",
      }}
    >
      <div className="mb-4 flex h-14 w-14 shrink-0 items-center justify-center sm:h-16 sm:w-16">
        <img src={objetivo.icono.src} alt="" width={64} height={64} loading="lazy" className="h-full w-full object-contain" aria-hidden="true" />
      </div>
      <h3 className={cn("text-base font-medium leading-snug sm:text-lg lg:text-xl", isCenter ? "text-neutral-900" : "text-neutral-800")}>
        {objetivo.texto}
      </h3>
    </div>
  );
};

export default function ObjetivosCards({ objetivos }: { objetivos: Objetivo[] }) {
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

  const botonControl = cn(
    "flex h-14 w-14 items-center justify-center rounded-full text-2xl transition-colors",
    "border-2 border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-900 hover:text-white",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2"
  );

  return (
    <div className="relative w-full overflow-hidden" style={{ height: 600, "--card": "min(365px, calc(100vw - 48px))" } as React.CSSProperties} aria-label="Objetivos específicos">
      {lista.map((objetivo, index) => {
        const position = lista.length % 2 ? index - (lista.length + 1) / 2 : index - lista.length / 2;
        return (
          <ObjetivoCard
            key={objetivo.tempId}
            objetivo={objetivo}
            handleMove={handleMove}
            position={position}
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
