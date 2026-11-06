import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

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
        gsap.fromTo(
          capa,
          { backgroundPosition: () => `50% ${innerHeight / 2}px` },
          { backgroundPosition: () => `50% ${-innerHeight / 2}px`, ease: "none", scrollTrigger },
        );
      } else {
        gsap.fromTo(capa, { yPercent: -16.7 }, { yPercent: 16.7, ease: "none", scrollTrigger });
      }
    });
  },
);
