"use client";

import Timeline from "@/components/ui/timeline-01-utils/timeline";
import { Badge } from "@/components/ui/badge";

// Textos de cada actividad, en el mismo orden que las imágenes que llegan desde el .astro
const actividades = [
  {
    title: "Parque Nacional Manuel Antonio",
    description:
      "Recorre senderos entre bosque tropical y playas de arena blanca mientras observas perezosos, monos cariblancos, iguanas y aves. Las entradas se compran en línea por anticipado.",
    date: "Naturaleza",
  },
  {
    title: "Rafting en los ríos Naranjo y Savegre",
    description:
      "Descensos en balsa con guías certificados para todos los niveles, rodeados de montañas y bosque. Una de las aventuras más emocionantes de la zona.",
    date: "Aventura",
  },
  {
    title: "Tour en catamarán al atardecer",
    description:
      "Navega por la costa del Pacífico, haz snorkel, avista delfines y, en temporada, ballenas jorobadas, y despide el día con uno de los atardeceres más bonitos del país.",
    date: "Mar",
  },
  {
    title: "Canopy y rappel",
    description:
      "Vuela entre las copas de los árboles en tirolesas y desciende en rappel junto a cascadas y paredes de roca, con todo el equipo de seguridad incluido.",
    date: "Adrenalina",
  },
  {
    title: "Kayak en los manglares de Isla Damas",
    description:
      "Rema en aguas tranquilas entre los canales del manglar y descubre su fauna: aves, cangrejos, monos y, con suerte, algún cocodrilo tomando el sol.",
    date: "Ecoturismo",
  },
  {
    title: "Pesca deportiva",
    description:
      "Quepos es uno de los mejores destinos del mundo para la pesca de pez vela y marlín. Salidas desde la Marina Pez Vela con tripulaciones expertas y pesca de captura y liberación.",
    date: "Pesca",
  },
];

type InformacionActividadesProps = {
  imagenes: { src: string; alt: string }[];
  /** Perezoso que baja colgado de la línea entre la primera y la segunda actividad */
  perezoso?: string;
  /** Kayak que baja por el río entre la segunda y la tercera actividad */
  kayak?: string;
  /** Persona en la tirolesa entre la cuarta y la quinta actividad */
  canopy?: string;
};

const InformacionActividades = ({ imagenes, perezoso, kayak, canopy }: InformacionActividadesProps) => {
  const timelineData = actividades.slice(0, imagenes.length).map((actividad, i) => ({
    ...actividad,
    image: imagenes[i].src,
    alt: imagenes[i].alt,
  }));

  return (
    <section id="actividades" className="overflow-clip bg-[#f6f6f7] py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-16">
        <div className="mb-12 max-w-2xl space-y-4 md:mb-20">

          <div className="space-y-3">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl lg:text-5xl">
              Vive Quepos a tu manera
            </h2>
            <p className="text-base leading-relaxed text-slate-600 md:text-lg">
              Naturaleza, aventura y mar en un solo destino. Estas son algunas de las experiencias que no te
              puedes perder durante tu visita.
            </p>
          </div>
        </div>
        <Timeline items={timelineData} perezoso={perezoso} kayak={kayak} canopy={canopy} />
      </div>
    </section>
  );
};

export default InformacionActividades;
