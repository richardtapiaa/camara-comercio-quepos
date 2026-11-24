import type { CSSProperties } from 'react';
import { FlowButton } from '@/components/ui/flow-button';
import logoCamara from '@/assets/compartido/logo-camara.webp';
import logoSello from '@/assets/compartido/logo-camara-sello-900.webp';
import fantasma from '@/assets/compartido/fantasma-404.webp';

const retraso = (segundos: number, lado?: number) =>
  ({ '--retraso': `${segundos}s`, '--lado': lado }) as CSSProperties;

export function NotFound() {
  return (
    <div className="relative isolate flex min-h-svh flex-col items-center justify-center overflow-hidden bg-white px-4">
      <img
        src={logoSello.src}
        width={logoSello.width}
        height={logoSello.height}
        alt=""
        aria-hidden="true"
        decoding="async"
        draggable={false}
        className="pointer-events-none absolute -bottom-6 -right-28 -z-10 h-auto w-[520px] max-w-none -rotate-6 select-none opacity-[0.18] md:-bottom-24 md:-right-32 md:w-[720px] lg:w-[820px]"
      />
      <div className="p404-contenido relative z-10 text-center">
        <div className="mb-8 flex items-center justify-center gap-4 md:mb-12 md:gap-6">
          <span
            className="p404-numero select-none font-bold text-[80px] text-[#222222] opacity-70 md:text-[120px]"
            style={retraso(0.1, -1)}
          >
            4
          </span>
          <div className="p404-fantasma">
            <div className="p404-fantasma-flotar">
              <img
                src={fantasma.src}
                alt="Fantasma"
                width={120}
                height={120}
                className="h-[80px] w-[80px] select-none object-contain md:h-[120px] md:w-[120px]"
                draggable={false}
                loading="eager"
              />
            </div>
          </div>
          <span
            className="p404-numero select-none font-bold text-[80px] text-[#222222] opacity-70 md:text-[120px]"
            style={retraso(0.2, 1)}
          >
            4
          </span>
        </div>

        <h1
          className="p404-elemento mb-4 select-none font-bold text-3xl text-[#222222] md:mb-6 md:text-5xl"
          style={retraso(0.3)}
        >
          ¡Boo! Página no encontrada
        </h1>

        <p
          className="p404-elemento mb-8 select-none text-lg text-[#222222] md:mb-12 md:text-xl"
          style={retraso(0.4)}
        >
          ¡Ups! Esta página debe ser un fantasma; no está aquí.
        </p>

        <div className="p404-elemento p404-boton flex justify-center" style={retraso(0.5)}>
          <a href="/">
            <FlowButton text="Volver al inicio" />
          </a>
        </div>

        <div className="p404-elemento mt-12 flex justify-center" style={retraso(0.6)}>
          <img
            src={logoCamara.src}
            alt="Cámara de Comercio, Industria y Turismo de Quepos"
            width={260}
            height={130}
            className="h-auto w-[220px] object-contain md:w-[260px]"
          />
        </div>
      </div>
    </div>
  );
}
