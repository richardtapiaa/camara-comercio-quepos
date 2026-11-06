import type * as React from "react";
import { cn } from "@/lib/utils";

export interface LogoColaborador {
  src: string;
  alt: string;
  width: number;
  height: number;
  gradiente: { desde: string; medio: string; hasta: string };
}

interface MarqueeColaboradoresProps {
  titulo: string;
  descripcion?: string;
  logos: LogoColaborador[];
  velocidad?: "normal" | "lenta" | "rapida";
  className?: string;
}

const duraciones = { normal: "40s", lenta: "70s", rapida: "20s" };

const ANCHO_LOGO = 224;
const ANCHO_MINIMO_MITAD = 2600;

const estilos = `
@keyframes colaboradores-marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
@media (prefers-reduced-motion: reduce) {
  .colaboradores-cinta { animation: none !important; }
}
`;

export function MarqueeColaboradores({ titulo, descripcion, logos, velocidad = "normal", className }: MarqueeColaboradoresProps) {
  const repeticiones = Math.max(1, Math.ceil(ANCHO_MINIMO_MITAD / (logos.length * ANCHO_LOGO)));
  const mitad = Array.from({ length: repeticiones }, () => logos).flat();

  return (
    <section
      aria-labelledby="titulo-colaboradores"
      className={cn("w-full overflow-hidden bg-white py-16 sm:py-20", className)}
    >
      <style>{estilos}</style>

      <div className="mx-auto max-w-3xl px-6 text-center">
        <h2
          id="titulo-colaboradores"
          className="flex items-center justify-center gap-3 text-2xl font-semibold text-slate-900 sm:gap-6 sm:text-3xl"
        >
          <span aria-hidden="true" className="h-0.5 w-6 shrink-0 rounded-full bg-[#2780c9] sm:w-16" />
          <span className="text-balance sm:whitespace-nowrap">{titulo}</span>
          <span aria-hidden="true" className="h-0.5 w-6 shrink-0 rounded-full bg-[#2780c9] sm:w-16" />
        </h2>
        {descripcion && <p className="mx-auto mt-4 max-w-[62ch] text-lg leading-relaxed text-slate-600">{descripcion}</p>}
      </div>

      <ul className="sr-only">
        {logos.map((logo) => (
          <li key={logo.alt}>{logo.alt}</li>
        ))}
      </ul>

      <div
        aria-hidden="true"
        className="mt-12 w-full overflow-hidden"
        style={{ maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)" }}
      >
        <div
          className="colaboradores-cinta flex w-max items-center gap-8 hover:[animation-play-state:paused]"
          style={{ animation: `colaboradores-marquee ${duraciones[velocidad]} linear infinite` }}
        >
          {[...mitad, ...mitad].map((logo, i) => (
            <div
              key={i}
              className="group relative isolate flex h-28 w-48 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-[1.5rem] bg-[#f3f5f8] px-6"
            >
              <div
                style={
                  {
                    "--desde": logo.gradiente.desde,
                    "--medio": logo.gradiente.medio,
                    "--hasta": logo.gradiente.hasta,
                  } as React.CSSProperties
                }
                className="absolute inset-0 -z-10 scale-150 bg-gradient-to-br from-[var(--desde)] via-[var(--medio)] to-[var(--hasta)] opacity-0 transition-all duration-700 ease-out group-hover:scale-100 group-hover:opacity-100 group-active:scale-100 group-active:opacity-100 motion-reduce:scale-100 motion-reduce:transition-opacity motion-reduce:duration-200"
              />
              <img
                src={logo.src}
                alt=""
                width={logo.width}
                height={logo.height}
                loading="lazy"
                decoding="async"
                draggable={false}
                className="max-h-16 w-auto max-w-full object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
