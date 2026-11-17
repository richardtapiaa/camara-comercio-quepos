import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const mm = gsap.matchMedia();

mm.add("(prefers-reduced-motion: no-preference)", () => {
  document.querySelectorAll<HTMLElement>("[data-frase-celebre]").forEach((seccion) => {
    const palabras = seccion.querySelectorAll<HTMLElement>("[data-frase-palabra]");
    if (!palabras.length) return;
    // La animación sigue a la frase, no a la sección: si se mide contra la sección (que entra a la pantalla mucho
    // antes que la frase), las palabras ya están encendidas cuando la frase aparece. Así empieza cuando la frase
    // asoma por abajo y termina cuando su inicio llega al 40 % de la pantalla, mientras se lee.
    const frase = palabras[0].closest("p") ?? seccion;

    gsap.fromTo(
      palabras,
      { opacity: 0.15, y: 8 },
      {
        opacity: 1,
        y: 0,
        ease: "none",
        stagger: 0.1,
        scrollTrigger: {
          trigger: frase,
          // Inicio y fin medidos con el borde de arriba de la frase: el recorrido es siempre el mismo (48 % de la
          // pantalla), tenga la frase pocas o muchas líneas.
          start: "top 88%",
          end: "top 40%",
          scrub: true,
        },
      }
    );
  });
});
