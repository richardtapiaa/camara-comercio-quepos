import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Parallax de FotoQuepos.astro, mientras la sección cruza la pantalla (de que asoma abajo a que sale arriba)
gsap.matchMedia().add(
  {
    escritorio: "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
    movil: "(max-width: 767px) and (prefers-reduced-motion: no-preference)",
  },
  (context) => {
    const { escritorio } = context.conditions as { escritorio: boolean };
    document.querySelectorAll<HTMLElement>("[data-foto-parallax]").forEach((seccion) => {
      const capa = seccion.querySelector<HTMLElement>("[data-foto-parallax-capa]");
      if (!capa) return;
      const scrollTrigger = { trigger: seccion, start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true };

      if (escritorio) {
        // Como el CodePen: el fondo es fijo a la ventana y su posición va de +½ a −½ pantalla
        gsap.fromTo(
          capa,
          { backgroundPosition: () => `50% ${innerHeight / 2}px` },
          { backgroundPosition: () => `50% ${-innerHeight / 2}px`, ease: "none", scrollTrigger },
        );
      } else {
        // La capa mide 150 % de la sección: baja de −25 % a +25 % de la sección (16,7 % de la capa). Con menos recorrido
        // el movimiento no se nota en celular (la sección mide ~340 px); a cambio la foto de 1600 px se amplía un poco
        gsap.fromTo(capa, { yPercent: -16.7 }, { yPercent: 16.7, ease: "none", scrollTrigger });
      }
    });
  },
);
