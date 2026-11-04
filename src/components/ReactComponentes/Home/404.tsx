  'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { FlowButton } from '@/components/ui/flow-button';
import logoCamara from '@/assets/compartido/logo-camara.webp';
// Logo en estilo "sello" (como el mono de SobreQuepos); se genera con herramientas/logo-sello.mjs
import logoSello from '@/assets/compartido/logo-camara-sello.webp';

const containerVariants = {
  hidden: {
    opacity: 0,
    y: 30,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.43, 0.13, 0.23, 0.96] as const,
      delayChildren: 0.1,
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.43, 0.13, 0.23, 0.96] as const,
    },
  },
};

const numberVariants = {
  hidden: (direction: number) => ({
    opacity: 0,
    x: direction * 40,
    y: 15,
    rotate: direction * 5,
  }),
  visible: {
    opacity: 0.7,
    x: 0,
    y: 0,
    rotate: 0,
    transition: {
      duration: 0.8,
      ease: [0.43, 0.13, 0.23, 0.96] as const,
    },
  },
};

const ghostVariants = {
  hidden: {
    scale: 0.8,
    opacity: 0,
    y: 15,
    rotate: -5,
  },
  visible: {
    scale: 1,
    opacity: 1,
    y: 0,
    rotate: 0,
    transition: {
      duration: 0.6,
      ease: [0.43, 0.13, 0.23, 0.96] as const,
    },
  },
  hover: {
    scale: 1.1,
    y: -10,
    rotate: [0, -5, 5, -5, 0],
    transition: {
      duration: 0.8,
      ease: 'easeInOut' as const,
      rotate: {
        duration: 2,
        ease: 'linear' as const,
        repeat: Infinity,
        repeatType: 'reverse' as const,
      },
    },
  },
  floating: {
    y: [-5, 5],
    transition: {
      y: {
        duration: 2,
        ease: 'easeInOut' as const,
        repeat: Infinity,
        repeatType: 'reverse' as const,
      },
    },
  },
};

export function NotFound() {
  return (
    <div className="relative isolate flex min-h-svh flex-col items-center justify-center overflow-hidden bg-white px-4">
      {/* Fondo decorativo (alt vacío y aria-hidden): logo grande y tenue, girado y cortado por el borde de abajo a la
          derecha, detrás del contenido. En móvil va más pequeño para no tapar el texto */}
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
      <AnimatePresence mode="wait">
        <motion.div
          className="relative z-10 text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          <div className="mb-8 flex items-center justify-center gap-4 md:mb-12 md:gap-6">
            <motion.span
              className="select-none font-bold text-[80px] text-[#222222] opacity-70 md:text-[120px]"
              variants={numberVariants}
              custom={-1}
            >
              4
            </motion.span>
            <motion.div
              variants={ghostVariants}
              whileHover="hover"
              animate={['visible', 'floating']}
            >
              <img
                src="https://cdn.21st.dev/assets/mirror/88/8848c4fd858052c49c5a5d7267489c02b021c6cf3e31bfec02787e16f1ab7d0e.png"
                alt="Fantasma"
                width={120}
                height={120}
                className="h-[80px] w-[80px] select-none object-contain md:h-[120px] md:w-[120px]"
                draggable={false}
                loading="eager"
              />
            </motion.div>
            <motion.span
              className="select-none font-bold text-[80px] text-[#222222] opacity-70 md:text-[120px]"
              variants={numberVariants}
              custom={1}
            >
              4
            </motion.span>
          </div>

          <motion.h1
            className="mb-4 select-none font-bold text-3xl text-[#222222] opacity-70 md:mb-6 md:text-5xl"
            variants={itemVariants}
          >
            ¡Boo! Página no encontrada
          </motion.h1>

          <motion.p
            className="mb-8 select-none text-lg text-[#222222] opacity-50 md:mb-12 md:text-xl"
            variants={itemVariants}
          >
            ¡Ups! Esta página debe ser un fantasma; no está aquí.
          </motion.p>

          <motion.div
            className="flex justify-center"
            variants={itemVariants}
            whileHover={{
              scale: 1.05,
              transition: {
                duration: 0.3,
                ease: [0.43, 0.13, 0.23, 0.96] as const,
              },
            }}
          >
            <a href="/">
              <FlowButton text="Volver al inicio" />
            </a>
          </motion.div>

          <motion.div className="mt-12 flex justify-center" variants={itemVariants}>
            <img
              src={logoCamara.src}
              alt="Cámara de Comercio, Industria y Turismo de Quepos"
              width={260}
              height={130}
              className="h-auto w-[220px] object-contain md:w-[260px]"
            />
          </motion.div>

        </motion.div>
      </AnimatePresence>
    </div>
  );
}