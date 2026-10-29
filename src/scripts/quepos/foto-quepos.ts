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
        // La capa mide 116 % de la sección: baja de −8 % a +8 % de la sección (6,9 % de la capa). Es más corto que en
        // escritorio para que la foto (de solo 1600 px) se amplíe lo menos posible
        gsap.fromTo(capa, { yPercent: -6.9 }, { yPercent: 6.9, ease: "none", scrollTrigger });
      }
    });
  },
);
