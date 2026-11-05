"use client";

import Timeline from "@/components/ui/timeline-01-utils/timeline";
import { Badge } from "@/components/ui/badge";

const actividades = [
  {
    title: "Naturaleza y Observación de Fauna",
    description: `• Tour avistamiento de ballenas y delfines
• Tour de Mariposarios
• Parque Nacional Manuel Antonio
• Tour de avistamiento de aves
• Tour de observación de perezosos
• Tour fotográfico de naturaleza
• Senderismo en el Refugio de Vida Silvestre
• Tour de observación de ranas y reptiles`,
    date: "",
  },
  {
    title: "Aventuras Acuáticas y Marítimas",
    description: `• Clases y práctica de Surf
• Snorkel y buceo de superficie en Playa Biesanz
• Paseos en jet ski`,
    date: "",
  },
  {
    title: "Tours en Manglares y Ríos",
    description: `• Tour en Kayak
• Tour Rafting
• Tours en manglares
• Tour de manglares en bote eléctrico o solar
• Excursiones de paddleboard en manglares y playas
• Excursiones guiadas de bioluminiscencia
• Tour de tubbing en ríos locales`,
    date: "",
  },
  {
    title: "Aventura y Adrenalina Terrestre",
    description: `• Canopy
• Caminatas nocturnas en la selva
• Excursiones en Cuatrimotos / Off-road
• Cabalgatas por la montaña y cataratas
• Visita a Parques y Reservas Privadas
• Visita a cascadas locales
• Excursiones de canopy nocturno
• Vuelos en ultraligero o paracaidismo sobre la costa`,
    date: "",
  },
  {
    title: "Pesca y Navegación",
    description: `• Tour Catamarán
• Tour Buceo
• Vuelos - Charters
• Torneos de pesca deportiva internacional y nacionales
• Cruceros
• Visita a la Marina Pez Vela
• Tour de pesca costera o en bote artesanal`,
    date: "",
  },
  {
    title: "Bienestar, Relax y Ocio",
    description: `• BODAS
• SPA
• Playas
• Experiencias de bienestar y yoga en la playa`,
    date: "",
  },
  {
    title: "Cultura, Gastronomía y Comunidad",
    description: `• Turismo rural
• Villas rurales
• Emprendurismo artesanal
• Patrimonio cultural
• Tours de café, chocolate y vainilla
• Clases de cocina costarricense
• Visita a mercados artesanales locales
• Talleres de arte y artesanía indígena
• Excursiones a reservas ecológicas comunitarias`,
    date: "",
  },
];

type InformacionActividadesProps = {
  imagenes: { src: string; srcSet?: string; alt: string }[];
  perezoso?: string;
  kayak?: string;
  canopy?: string;
  pescado?: string;
};

const InformacionActividades = ({ imagenes, perezoso, kayak, canopy, pescado }: InformacionActividadesProps) => {
  const timelineData = actividades.slice(0, imagenes.length).map((actividad, i) => ({
    ...actividad,
    image: imagenes[i].src,
    imageSrcSet: imagenes[i].srcSet,
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
        <Timeline items={timelineData} perezoso={perezoso} kayak={kayak} canopy={canopy} pescado={pescado} />
      </div>
    </section>
  );
};

export default InformacionActividades;
