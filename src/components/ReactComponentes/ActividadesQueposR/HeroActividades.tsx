'use client'

import * as React from 'react';

import { cn } from "@/lib/utils";
import {
  motion,
  type HTMLMotionProps,
  useMotionTemplate,
  useScroll,
  useTransform,
} from 'framer-motion';

interface ParallaxItemProps extends HTMLMotionProps<'div'> {
  start: number;
  end: number;
}

export const Parallax = ({ className, ...props }: React.ComponentProps<'div'>) => {

  return (
    <>
      <style>{estilosParallax}</style>
      <div className={cn('relative min-h-dvh w-full', className)} {...props} />
    </>
  );
};

export function ParallaxContainer({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div className={cn('min-h-screen', className)} {...props} />
  );
}
// El parallax corre con animaciones CSS ligadas al scroll (animation-timeline: view()): el navegador las
// mueve en el mismo cuadro que el scroll, sin esperar a JS. Con JS (useScroll) las fotos llegaban un cuadro
// tarde al scroll táctil y en celular temblaban o se "pegaban". Mismo enfoque que MisionScripts.astro
const estilosParallax = `
@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    .parallax-item {
      animation-name: parallax-item;
      animation-timing-function: linear;
      animation-fill-mode: both;
      animation-timeline: view();
      /* Mismo rango que el offset de useScroll: desde start px tras entrar hasta end px antes de salir */
      animation-range: cover var(--parallax-inicio) cover calc(100% + var(--parallax-fin));
    }
    /* Celular: el texto ocupa la mitad de arriba de la pantalla, así que las fotos recorren solo la mitad de
       abajo (si subían hasta arriba se desvanecían encima del título como un fantasma). Para que no pasen
       de golpe suben a la mitad de la velocidad del scroll: durante 96svh de scroll se desplazan 48svh hacia
       abajo, así que en pantalla solo suben 48svh (de abajo hasta la mitad) y ahí terminan de desvanecerse */
    @media (max-width: 767px) {
      .parallax-item {
        animation-range: cover 0% cover 96svh;
        /* !important para ganarle a las variables de escritorio que van en el style de cada foto */
        --parallax-y0: 0px !important;
        --parallax-y75: 36svh !important;
        --parallax-y1: 48svh !important;
      }
    }
  }
}
@keyframes parallax-item {
  0% { translate: 0 var(--parallax-y0); scale: 1; opacity: 1; }
  75% { translate: 0 var(--parallax-y75); scale: 1; opacity: 1; }
  100% { translate: 0 var(--parallax-y1); scale: 0.85; opacity: 0; }
}
`;

// Navegadores sin animaciones ligadas al scroll (Safari < 26, Firefox) usan la versión con JS, pero solo en
// escritorio: en celular esa versión tiembla con el scroll táctil, así que ahí las fotos quedan quietas
type ModoParallax = 'css' | 'js' | 'quieto';
const consultaEscritorio = '(min-width: 768px)';

const modoParallax = (): ModoParallax => {
  if (CSS.supports('animation-timeline: view()')) return 'css';
  return window.matchMedia(consultaEscritorio).matches ? 'js' : 'quieto';
};

function useModoParallax() {
  return React.useSyncExternalStore<ModoParallax>(
    (avisar) => {
      const mq = window.matchMedia(consultaEscritorio);
      mq.addEventListener('change', avisar);
      return () => mq.removeEventListener('change', avisar);
    },
    modoParallax,
    () => 'css'
  );
}

export function ParallaxItem({ start, end, className, style, ...props }: ParallaxItemProps) {
  const modo = useModoParallax();

  if (modo === 'js') {
    return <ParallaxItemAnimado start={start} end={end} className={className} style={style} {...props} />;
  }
  if (modo === 'quieto') {
    return <motion.div className={className} style={style} {...props} />;
  }

  const variables = {
    '--parallax-inicio': `${start}px`,
    '--parallax-fin': `${end}px`,
    '--parallax-y0': `${start}px`,
    '--parallax-y75': `${start + (end - start) * 0.75}px`,
    '--parallax-y1': `${end}px`,
  } as React.CSSProperties;

  return (
    <motion.div
      className={cn('parallax-item will-change-transform', className)}
      style={{ ...variables, ...style }}
      {...props}
    />
  );
}

function ParallaxItemAnimado({
  start,
  end,
  className,
  style,
  ...props
}: ParallaxItemProps) {
  const ref = React.useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: [`${start}px end`, `end ${end * -1}px`],
  });

  const opacity = useTransform(scrollYProgress, [0.75, 1], [1, 0]);
  const scale = useTransform(scrollYProgress, [0.75, 1], [1, 0.85]);

  const y = useTransform(scrollYProgress, [0, 1], [start, end]);
  const transform = useMotionTemplate`translateY(${y}px) scale(${scale})`;

  return (
    <motion.div
      className={cn('will-change-transform', className)}
      ref={ref}
      style={{ transform, opacity, ...style }}
      {...props}
    />
  );
}

// Texto que entra palabra por palabra desde el fondo (eje z): llega grande y desenfocado y se asienta
export function StaggerText({ text, className }: { text: string; className?: string }) {
  return (
    <motion.h1
      className={cn('flex flex-wrap justify-center gap-x-[0.25em]', className)}
      initial="oculto"
      whileInView="visible"
      viewport={{ once: true }}
      transition={{ staggerChildren: 0.08 }}
    >
      {text.split(' ').map((palabra, i) => (
        <motion.span
          key={i}
          className="inline-block"
          variants={{
            oculto: { opacity: 0, scale: 1.8, filter: 'blur(12px)' },
            visible: { opacity: 1, scale: 1, filter: 'blur(0px)' },
          }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {palabra}
        </motion.span>
      ))}
    </motion.h1>
  );
}

// Hero de actividades: texto fijo al centro y las fotos subiendo por encima, cada una a distinta velocidad
type HeroActividadesProps = {
  imagenes: { src: string; alt: string }[];
  /** Foto de fondo, fija detrás del texto mientras dura el hero */
  fondo?: { src: string; alt: string };
};

// Recorrido (start → end, en px) de cada foto en escritorio: van 3 por fila y ninguna arranca más arriba que
// la anterior, así no se montan. En celular van una por fila, repartidas a distintos lados y tamaños, todas
// con el mismo recorrido (definido en estilosParallax)
const recorridos = [
  { start: 200, end: -200, movil: 'w-[72%] mr-auto' },
  { start: 500, end: 20, movil: 'w-[58%] ml-auto' },
  { start: 800, end: 50, movil: 'w-[80%] mx-auto' },
  { start: 800, end: 50, movil: 'w-[60%] ml-[4%] mr-auto' },
  { start: 1100, end: 70, movil: 'w-[66%] ml-auto' },
  { start: 1100, end: 120, movil: 'w-[76%] mx-auto' },
];

export function HeroActividades({ imagenes, fondo }: HeroActividadesProps) {
  
  return (
    <Parallax className={cn("overflow-clip bg-white p-6 md:p-12", fondo ? "text-white" : "text-black")}>
      {/* En celular el texto va arriba (justo debajo de la barra de navegación) para dejar libre la mitad de
          abajo, por donde suben las fotos; en escritorio va centrado */}
      <div className="sticky top-0 isolate flex h-svh w-full flex-col items-center justify-start space-y-4 pt-28 text-center md:justify-center md:pt-0">
        {/* Fondo: va dentro del bloque fijo para quedarse quieto detrás del texto. Se extiende sobre el padding
            del hero para cubrir todo el ancho, y la capa oscura asegura que el texto blanco se lea.
            !m-0 anula el margen que le pone space-y-4 del contenedor y que lo dejaba 16px corto abajo */}
        {fondo && (
          <div className="absolute -inset-x-6 -top-6 bottom-0 -z-10 !m-0 md:-inset-x-12 md:-top-12" aria-hidden="true">
            <img src={fondo.src} alt="" className="size-full object-cover" draggable={false} />
            <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/40 to-black/60" />
          </div>
        )}

        <StaggerText
          className={cn(
            "mx-auto text-4xl font-bold tracking-tighter min-[380px]:text-5xl md:w-2/3",
            fondo && "drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)]"
          )}
          text="Descubre todo lo que puedes vivir en Quepos"
        />

        <p className={cn("max-w-prose", fondo && "text-white/90 drop-shadow-[0_1px_8px_rgba(0,0,0,0.5)]")}>
          Pesca deportiva, rafting, tours en catamarán, manglares, playas y parques nacionales: aventuras para
          todos los gustos en el corazón del Pacífico Central de Costa Rica.
        </p>

      </div>

      {/* En celular las fotos suben a media velocidad, así que en pantalla la separación entre ellas se reduce a
          la mitad: por eso el espacio vertical es tan grande */}
      <ParallaxContainer className="flex w-full flex-wrap justify-between gap-x-4 gap-y-[17rem] md:gap-y-4">
        {imagenes.slice(0, recorridos.length).map((imagen, i) => (
          <ParallaxItem
            key={imagen.src}
            className={cn(
              'aspect-[4/3] overflow-hidden rounded-2xl shadow-xl md:mx-0 md:w-[30%]',
              recorridos[i].movil
            )}
            start={recorridos[i].start}
            end={recorridos[i].end}
          >
            <img
              className="size-full object-cover object-[50%_50%]"
              src={imagen.src}
              alt={imagen.alt}
              draggable={false}
            />
          </ParallaxItem>
        ))}
      </ParallaxContainer>

      {/* Espacio para que terminen las animaciones. Es un bloque y no padding: el sticky del texto solo se
          mantiene dentro del contenido de su contenedor, y con padding se soltaba antes de tiempo */}
      <div className="h-[50svh] md:h-[1150px]" aria-hidden="true" />

    </Parallax>
  );
}
