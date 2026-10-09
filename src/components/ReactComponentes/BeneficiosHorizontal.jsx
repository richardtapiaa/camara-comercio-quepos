import { useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { beneficios } from './ScrollStacking.jsx';

gsap.registerPlugin(ScrollTrigger);

const Tarjeta = ({ titulo, texto, icono, numero, total }) => (
  <article className="beneficio-card flex h-96 w-[min(94vw,62rem)] overflow-hidden rounded-3xl bg-white shadow-[0_10px_40px_rgba(0,0,0,0.3)] sm:h-[min(26rem,55vh)]">
    <div className="flex min-w-0 flex-1 flex-col p-5 sm:p-10">
      <h3 className="text-xl font-bold leading-tight text-slate-900 sm:text-3xl">{titulo}</h3>
      <a href="#contacto" className="mt-1 text-sm font-medium text-blue-700 hover:underline sm:text-base">
        Más información...
      </a>
      <p className="mt-4 text-sm leading-relaxed text-slate-800 sm:text-lg">{texto}</p>
    </div>

    <div className="relative flex w-2/5 shrink-0 items-center justify-center bg-[#99B039] text-white sm:[&>svg]:h-24 sm:[&>svg]:w-24">
      <span className="absolute right-3 top-3 rounded-full bg-[#3A4219] px-3 py-1 text-[10px] font-semibold text-white sm:right-4 sm:top-4 sm:px-4 sm:text-xs">
        Beneficio {numero} de {total}
      </span>
      {icono}
    </div>
  </article>
);

const Encabezado = () => (
  <header className="mx-auto max-w-2xl px-6 text-center text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">
    <span className="text-sm font-semibold uppercase tracking-[0.25em] text-sky-300">Lo que ofrecemos</span>
    <h2 className="mt-3 font-serif text-3xl font-bold uppercase tracking-tight sm:text-4xl">Beneficios de ser asociado</h2>
    <div className="mx-auto mt-5 h-1.5 w-20 rounded-full bg-gradient-to-r from-sky-300 to-white" />
  </header>
);

// Una tarjeta baja hasta su panel, la pantalla se desplaza en horizontal al siguiente panel,
// y allí baja la siguiente tarjeta, y así sucesivamente.
const BeneficiosHorizontal = () => {
  const escenaRef = useRef(null);
  const pistaRef = useRef(null);
  const [sinMovimiento, setSinMovimiento] = useState(false);

  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setSinMovimiento(true);
      return;
    }

    const ctx = gsap.context(() => {
      const tarjetas = gsap.utils.toArray('.beneficio-card');
      const total = tarjetas.length;

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: escenaRef.current,
          pin: true,
          scrub: 1.5,
          start: 'top top',
          // un paso por cada bajada y cada desplazamiento horizontal
          end: () => `+=${(2 * total - 1) * window.innerHeight * 0.5}`,
          invalidateOnRefresh: true
        }
      });

      tarjetas.forEach((tarjeta, i) => {
        tl.fromTo(tarjeta, { y: () => -window.innerHeight }, { y: 0, ease: 'power2.out', duration: 1 });

        if (i < total - 1) {
          tl.to(pistaRef.current, { xPercent: (-100 * (i + 1)) / total, ease: 'power1.inOut', duration: 1 });
        }
      });
    }, escenaRef);

    const refrescar = () => ScrollTrigger.refresh();
    window.addEventListener('load', refrescar);

    return () => {
      window.removeEventListener('load', refrescar);
      ctx.revert();
    };
  }, []);

  if (sinMovimiento) {
    return (
      <div className="flex flex-col items-center gap-6 px-4 py-20">
        <Encabezado />
        {beneficios.map((b, i) => (
          <Tarjeta key={b.titulo} {...b} numero={i + 1} total={beneficios.length} />
        ))}
      </div>
    );
  }

  return (
    <div ref={escenaRef} className="flex h-screen flex-col overflow-hidden pt-24 pb-6">
      <Encabezado />
      <div className="min-h-0 flex-1">
        <div ref={pistaRef} className="flex h-full will-change-transform" style={{ width: `${beneficios.length * 100}vw` }}>
          {beneficios.map((b, i) => (
            <div key={b.titulo} className="flex h-full w-screen shrink-0 items-center justify-center">
              <Tarjeta {...b} numero={i + 1} total={beneficios.length} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BeneficiosHorizontal;
