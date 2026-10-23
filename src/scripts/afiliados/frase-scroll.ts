import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const mm = gsap.matchMedia();

mm.add("(prefers-reduced-motion: no-preference)", () => {
  document.querySelectorAll<HTMLElement>("[data-frase-celebre]").forEach((seccion) => {
    const palabras = seccion.querySelectorAll<HTMLElement>("[data-frase-palabra]");
    if (!palabras.length) return;

    gsap.fromTo(
      palabras,
      { opacity: 0.15, y: 8 },
      {
        opacity: 1,
        y: 0,
        ease: "none",
        stagger: 0.1,
        scrollTrigger: {
          trigger: seccion,
          start: "top 75%",
          end: "center 45%",
          scrub: true,
        },
      }
    );
  });
});
