'use client'

import * as React from 'react';

import { cn } from "@/lib/utils";
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

type Imagen = { src: string; alt: string };

type HeroActividadesProps = {
  /** CAPA 1: la foto completa, tal cual */
  foto: Imagen & { width: number; height: number };
  /** CAPA 3: la misma foto, del mismo tamaño, con solo el kayakista visible (canal alfa) */
  primerPlano: string;
  /** Las mismas dos capas en AVIF (más livianas); si faltan se usan solo las de arriba */
  fotoAvif?: string;
  primerPlanoAvif?: string;
  /** CAPA 2: título gigante que queda entre la foto y el kayakista */
  titulo?: string;
  /** Botón blanco debajo del título */
  boton?: { texto: string; href: string };
  className?: string;
};

// Tipografía del título: sans serif extra bold. Arial Black / Helvetica Neue en Mac y Windows; en Linux y
// Android, que no las traen, cae en Poppins 900 (ya cargada en Layout.astro)
const estiloTitulo = { fontFamily: '"Arial Black", "Helvetica Neue", Poppins, Arial, sans-serif', fontWeight: 900 } as const;

// Tamaño del título: 18.8 % del alto de la foto (que es max(100cqh, 47.2cqw), ver el recuadro), así guarda la
// misma proporción con el kayakista en cualquier pantalla, pero sin pasar del 15 % / 13 % del ancho de la
// pantalla para que entre. El mismo tamaño se usa para ubicar el botón justo debajo (ver más abajo)
const clasesTitulo =
  'select-none whitespace-nowrap text-[min(15cqw,max(8.9cqw,18.8cqh))] uppercase leading-[0.8] tracking-[-0.02em] text-white md:text-[min(13cqw,max(8.9cqw,18.8cqh))]';

const clasesBoton =
  'items-center gap-2 rounded-full bg-white px-6 py-3 text-xs font-bold uppercase tracking-wide text-[#1e2a5a] shadow-lg transition-colors hover:bg-white/85 md:px-8 md:py-4 md:text-sm';

// En celular la foto no llega hasta arriba: su borde de arriba se funde con el fondo oscuro del hero
const fundidoArriba = '[mask-image:linear-gradient(to_bottom,transparent,black_16%)] md:[mask-image:none]';

// Entrada suave con la curva que usan los otros textos del sitio
const entrada = (retraso: number) => ({
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 1, delay: retraso, ease: [0.22, 1, 0.36, 1] as const },
});

// Hero de actividades: la foto tal cual y un título gigante que pasa por detrás del kayakista. Son tres capas
// del mismo tamaño apiladas (foto, título y la misma foto recortada al kayakista), así la imagen se ve igual
// que la original y solo cambia que las letras quedan detrás de la persona
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
      {/* Recuadro con la proporción de la foto que cubre toda la pantalla (como object-cover): las capas van en
          porcentajes de la foto, así calzan en cualquier pantalla.
          La foto está ampliada a lo ancho (2.12:1) para que en escritorio se vea completa, con el kayakista
          entero y no tan grande.
          --foco-x: punto de la foto que queda al centro. En celular, que recorta los costados, se centra en el
          kayakista.
          --foco-y: en pantallas más anchas que la foto sobra alto y se recorta; 0.5 recorta lo mismo arriba y
          abajo. En celular vale 1: la foto va pegada abajo.
          --alto-foto: alto mínimo de la foto en proporción a la pantalla. En celular es 0.78: así se achica y se
          ve más del río, y arriba (detrás de la barra de navegación) se funde con el fondo oscuro.
          La foto con el kayakista entra igual que el título y el botón (sube y aparece), y antes que ellos */}
      <motion.div
        {...entrada(0)}
        className="absolute left-1/2 [--alto-foto:0.78] [--foco-x:45%] [--foco-y:1] [translate:calc(-1*var(--foco-x))_0] md:[--alto-foto:1] md:[--foco-x:50%] md:[--foco-y:0.5]"
        style={{
          width: `max(100cqw, calc(100cqh * var(--alto-foto) * ${foto.width} / ${foto.height}))`,
          aspectRatio: `${foto.width} / ${foto.height}`,
          top: `calc((100cqh - max(100cqw * ${foto.height} / ${foto.width}, 100cqh * var(--alto-foto))) * var(--foco-y))`,
        }}
      >
        {/* CAPA 1 — La foto */}
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
        {/* Velo muy suave para que el blanco del título resalte */}
        <div className={cn('absolute inset-0 bg-black/15', fundidoArriba)} aria-hidden="true" />

        {/* CAPA 2 — Título, centrado en la pantalla. Su borde de abajo queda a la altura de la cara, así el casco
            le tapa la parte de abajo de las letras. En celular va un poco más arriba, así el casco
            solo tapa la parte de abajo de las letras y el título se lee */}
        <div className="absolute bottom-[57%] left-[var(--foco-x)] -translate-x-1/2 md:bottom-[47.3%]">
          <motion.h1 {...entrada(0.3)} className={clasesTitulo} style={estiloTitulo}>
            {titulo}
          </motion.h1>
        </div>

        {/* CAPA 3 — El kayakista: la misma foto con solo la persona visible, encima del título */}
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

        {/* Botón en escritorio: una copia invisible del título en el mismo lugar lo deja justo debajo y alineado
            a su borde izquierdo, delante de todo */}
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

      {/* Botón en celular: abajo al centro, para no taparle la cara al kayakista */}
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
