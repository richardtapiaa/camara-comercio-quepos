'use client'

import * as React from 'react';

import { cn } from "@/lib/utils";
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

type Imagen = { src: string; alt: string };

type HeroActividadesProps = {
  foto: Imagen & { width: number; height: number };
  primerPlano: string;
  fotoAvif?: string;
  primerPlanoAvif?: string;
  titulo?: string;
  boton?: { texto: string; href: string };
  className?: string;
};

const estiloTitulo = { fontFamily: '"Arial Black", "Helvetica Neue", Poppins, Arial, sans-serif', fontWeight: 900 } as const;

const clasesTitulo =
  'select-none whitespace-nowrap text-[min(15cqw,max(8.9cqw,18.8cqh))] uppercase leading-[0.8] tracking-[-0.02em] text-white md:text-[min(13cqw,max(8.9cqw,18.8cqh))]';

const clasesBoton =
  'items-center gap-2 rounded-full bg-white px-6 py-3 text-xs font-bold uppercase tracking-wide text-[#1e2a5a] shadow-lg transition-colors hover:bg-white/85 md:px-8 md:py-4 md:text-sm';

const fundidoArriba = '[mask-image:linear-gradient(to_bottom,transparent,black_16%)] md:[mask-image:none]';

const entrada = (retraso: number) => ({
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 1, delay: retraso, ease: [0.22, 1, 0.36, 1] as const },
});

export function HeroActividades({
  foto,
  primerPlano,
  fotoAvif,
  primerPlanoAvif,
  titulo = "Aventura",
  boton = { texto: "Descubre las actividades", href: "#actividades" },
  className,
}: HeroActividadesProps) {
  return (
    <section
      className={cn('relative isolate h-svh min-h-[560px] w-full overflow-hidden bg-[#0b0f0a] [container-type:size]', className)}
      aria-label="Aventura en Quepos"
    >
      <motion.div
        {...entrada(0)}
        className="absolute left-1/2 [--alto-foto:0.78] [--foco-x:45%] [--foco-y:1] [translate:calc(-1*var(--foco-x))_0] md:[--alto-foto:1] md:[--foco-x:50%] md:[--foco-y:0.5]"
        style={{
          width: `max(100cqw, calc(100cqh * var(--alto-foto) * ${foto.width} / ${foto.height}))`,
          aspectRatio: `${foto.width} / ${foto.height}`,
          top: `calc((100cqh - max(100cqw * ${foto.height} / ${foto.width}, 100cqh * var(--alto-foto))) * var(--foco-y))`,
        }}
      >
        <picture>
          {fotoAvif && <source type="image/avif" srcSet={fotoAvif} />}
          <img
            src={foto.src}
            alt={foto.alt}
            className={cn('absolute inset-0 size-full', fundidoArriba)}
            draggable={false}
            fetchPriority="high"
          />
        </picture>
        <div className={cn('absolute inset-0 bg-black/15', fundidoArriba)} aria-hidden="true" />

        <div className="absolute bottom-[57%] left-[var(--foco-x)] -translate-x-1/2 md:bottom-[47.3%]">
          <motion.h1 {...entrada(0.3)} className={clasesTitulo} style={estiloTitulo}>
            {titulo}
          </motion.h1>
        </div>

        <picture>
          {primerPlanoAvif && <source type="image/avif" srcSet={primerPlanoAvif} />}
          <img
            src={primerPlano}
            alt=""
            className={cn('absolute inset-0 size-full', fundidoArriba)}
            draggable={false}
            fetchPriority="high"
            aria-hidden="true"
          />
        </picture>

        <div className="absolute left-[var(--foco-x)] top-[calc(52.7%_-_0.8*min(13cqw,max(8.9cqw,18.8cqh)))] hidden -translate-x-1/2 flex-col items-start md:flex">
          <span className={cn(clasesTitulo, 'invisible')} style={estiloTitulo} aria-hidden="true">
            {titulo}
          </span>
          <motion.a {...entrada(0.7)} href={boton.href} className={cn(clasesBoton, 'mt-8 inline-flex')}>
            {boton.texto}
            <ArrowRight className="size-4" strokeWidth={2} aria-hidden="true" />
          </motion.a>
        </div>
      </motion.div>

      <motion.a
        {...entrada(0.7)}
        href={boton.href}
        className={cn(clasesBoton, 'absolute inset-x-0 bottom-8 z-10 mx-auto flex w-max md:hidden')}
      >
        {boton.texto}
        <ArrowRight className="size-4" strokeWidth={2} aria-hidden="true" />
      </motion.a>
    </section>
  );
}
