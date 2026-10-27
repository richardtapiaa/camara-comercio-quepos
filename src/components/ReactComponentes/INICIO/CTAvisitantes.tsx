"use client"

import * as React from "react"
import { type HTMLMotionProps, type Variants, motion } from "framer-motion"

import { cn } from "@/lib/utils"

interface GalleryGridCellProps extends HTMLMotionProps<"div"> {
  index: number
}
const SPRING_TRANSITION_CONFIG = {
  type: "spring",
  stiffness: 100,
  damping: 16,
  mass: 0.75,
  restDelta: 0.005,
} as const
const filterVariants: Variants = {
  hidden: {
    opacity: 0,
    filter: "blur(10px)",
  },
  visible: {
    opacity: 1,
    filter: "blur(0px)",
  },
}
const areaClasses = [
  "col-start-2 col-end-3 row-start-1 row-end-3",
  "col-start-1 col-end-2 row-start-2 row-end-4",
  "col-start-1 col-end-2 row-start-4 row-end-6",
  "col-start-2 col-end-3 row-start-3 row-end-5",
]

export const ContainerStagger = React.forwardRef<
  HTMLDivElement,
  HTMLMotionProps<"div">
>(({ transition, ...props }, ref) => {
  return (                             
    <motion.div
      ref={ref}
      initial="hidden"
      whileInView={"visible"}
      viewport={{ once: true }}
      transition={{
        staggerChildren: transition?.staggerChildren ?? 0.2,
        delayChildren: transition?.delayChildren ?? 0.2,
        duration: 0.3,
        ...transition,
      }}
      {...props}
    />
  )
})
ContainerStagger.displayName = "ContainerStagger"

export const ContainerAnimated = React.forwardRef<
  HTMLDivElement,
  HTMLMotionProps<"div">
>(({ transition, ...props }, ref) => {
  return (
    <motion.div
      ref={ref}
      variants={filterVariants}
      transition={{
        ...SPRING_TRANSITION_CONFIG,
        duration: 0.3,
        ...transition,
      }}
      {...props}
    />
  )
})
ContainerAnimated.displayName = "ContainerAnimated"

export const GalleryGrid = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "grid grid-cols-2 grid-rows-[50px_150px_50px_150px_50px] gap-4",
        className
      )}
      {...props}
    />
  )
})
GalleryGrid.displayName = "ContainerSticky"

export const GalleryGridCell = React.forwardRef<
  HTMLDivElement,
  GalleryGridCellProps
>(({ className, transition, index, ...props }, ref) => {
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.3,
        delay: index * 0.2,
        delayChildren: transition?.delayChildren ?? 0.2,
      }}
      className={`relative overflow-hidden rounded-xl shadow-xl ${areaClasses[index]}`}
      {...props}
    />
  )
})
GalleryGridCell.displayName = "GalleryGridCell"

type CTAVisitantesProps = {
  imagenes: { src: string; srcSet?: string; alt: string }[]
}

// Ancho de cada celda: la mitad de la columna en celular, ~22 % de la pantalla en tablet y 268 px desde 1280 px
const TAMANO_CELDA = "(min-width: 1280px) 268px, (min-width: 768px) 22vw, calc(50vw - 32px)"

export const CTAVisitantes = ({ imagenes }: CTAVisitantesProps) => {
  return (
    <section id="visitors" className="bg-white px-6 py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
        <ContainerStagger>
          <ContainerAnimated>
            <h2 className="font-serif text-4xl font-extrabold uppercase tracking-tight text-slate-900 sm:text-6xl">
              Para Visitantes
            </h2>
          </ContainerAnimated>
          <ContainerAnimated>
            <p className="mt-4 max-w-md text-base font-bold uppercase tracking-wide text-slate-600 sm:text-lg">
              Descubre lo que puedes hacer mientras visitas nuestro cantón
            </p>
          </ContainerAnimated>
          <ContainerAnimated>
            <a
              href="/visitenos"
              className="mt-8 inline-block rounded-full bg-rose-500 px-8 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-rose-600"
            >
              Visitantes
            </a>
          </ContainerAnimated>
        </ContainerStagger>

        <GalleryGrid>
          {imagenes.slice(0, 4).map((imagen, index) => (
            <GalleryGridCell index={index} key={imagen.src}>
              <img
                src={imagen.src}
                srcSet={imagen.srcSet}
                sizes={imagen.srcSet ? TAMANO_CELDA : undefined}
                alt={imagen.alt}
                className="size-full object-cover object-center"
                draggable={false}
                loading="lazy"
                decoding="async"
              />
            </GalleryGridCell>
          ))}
        </GalleryGrid>
      </div>
    </section>
  )
}
