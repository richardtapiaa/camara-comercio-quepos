'use client'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'


// fondoAnimales: fondo crema con dibujos de animales (clase de styles/quepos/fondo-animales.css), en la página de
// Quepos; sin él, blanco (Visítenos)
export default function FAQs({ fondoAnimales = false }: { fondoAnimales?: boolean }) {
  const faqItems = [
    {
      id: 'item-1',
      question: '¿Cómo llego a Quepos?',
      answer: 'Desde San José son aproximadamente 3 horas en carro por la Ruta 27 y la Costanera Sur (Ruta 34). También hay buses directos desde la capital y vuelos nacionales que aterrizan en el aeródromo de Quepos (La Managua), a pocos minutos del centro.',
    },
    {
      id: 'item-2',
      question: '¿Cuál es la mejor época para visitar Quepos?',
      answer: 'La temporada seca va de diciembre a abril, ideal para playa y tours. De mayo a noviembre es la temporada verde: llueve más, sobre todo por las tardes, pero hay menos turistas, mejores precios y la naturaleza está en su punto más verde.',
    },
    {
      id: 'item-3',
      question: '¿Cómo visito el Parque Nacional Manuel Antonio?',
      answer: 'El parque está a unos 15 minutos de Quepos. Las entradas se compran en línea por anticipado en el sitio oficial del SINAC, ya que la capacidad diaria es limitada. Revisa el horario y el día de cierre semanal antes de ir, y recuerda que no se permite ingresar con comida ni bebidas en envases desechables.',
    },
    {
      id: 'item-4',
      question: '¿Qué actividades puedo hacer en Quepos?',
      answer: 'Quepos es reconocido por la pesca deportiva y la Marina Pez Vela. Además puedes hacer rafting en los ríos Naranjo y Savegre, tours en catamarán, kayak en los manglares de Isla Damas, canopy, avistamiento de fauna y disfrutar de sus playas.',
    },
    {
      id: 'item-5',
      question: '¿Qué moneda se usa y puedo pagar con tarjeta?',
      answer: 'La moneda oficial es el colón costarricense, pero el dólar estadounidense se acepta en la mayoría de comercios turísticos. Las tarjetas de crédito y débito se aceptan ampliamente; aun así, es recomendable llevar algo de efectivo para transporte, propinas y comercios pequeños.',
    },
    {
      id: 'item-6',
      question: '¿Es seguro visitar Quepos?',
      answer: 'Quepos es un destino turístico tranquilo, pero conviene tomar precauciones básicas: no dejar pertenencias sin vigilancia en la playa ni en el carro, nadar solo en zonas seguras y atender las banderas de corrientes de resaca. En caso de emergencia, llama al 911.',
    },
    {
      id: 'item-7',
      question: '¿Qué debo llevar en mi viaje?',
      answer: 'Bloqueador solar, repelente de insectos, ropa ligera, sandalias, un impermeable o sombrilla (sobre todo en temporada verde) y una botella reutilizable para mantenerte hidratado. Recuerda no alimentar a los animales silvestres.',
    },
  ];


  return (
    <section className={`${fondoAnimales ? "fondo-animales" : "bg-white"} py-16 md:py-24`}>
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-10 md:grid-cols-2 md:gap-16">
          <div>
            <h2 className="text-4xl font-black uppercase leading-[0.95] tracking-tight text-slate-900 sm:text-5xl">
              Preguntas frecuentes
            </h2>
            <p className="mt-6 max-w-md text-balance text-lg text-slate-700">
              Consultas que un turista necesita conocer sobre Quepos, Costa Rica.
            </p>
            <p className="mt-6 hidden text-slate-600 md:block">
              ¿No encuentras lo que buscas?{' '}
              <a href="/contacto" className="font-medium text-rose-500 hover:underline">
                Contáctanos
              </a>{' '}
              y con gusto te ayudamos.
            </p>
          </div>

          <Accordion type="single" collapsible className="flex flex-col gap-4">
            {faqItems.map((item) => (
              <AccordionItem
                key={item.id}
                value={item.id}
                className="rounded-lg border border-slate-200 bg-white px-6 transition-colors hover:border-slate-300"
              >
                <AccordionTrigger className="cursor-pointer py-6 text-sm font-extrabold uppercase tracking-tight text-slate-900 sm:text-base">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="pb-6">
                  <p className="text-base leading-relaxed text-slate-600">{item.answer}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <p className="text-slate-600 md:hidden">
            ¿No encuentras lo que buscas?{' '}
            <a href="/contacto" className="font-medium text-rose-500 hover:underline">
              Contáctanos
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}
