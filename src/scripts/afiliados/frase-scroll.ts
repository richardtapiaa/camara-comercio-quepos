import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Frase célebre de afiliados (AfiliadosComponentes/FraseCelebre.astro): al hacer scroll las palabras se encienden
// una tras otra, de tenues a negras, y suben apenas. Va con scrub (pegado al scroll): si se sube, se apagan.
// Sin JS o con "reducir movimiento" la frase se ve completa desde el principio
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
          // Empieza cuando la sección asoma por abajo y termina cuando su centro llega un poco arriba de la mitad
          start: "top 75%",
          end: "center 45%",
          scrub: true,
        },
      }
    );
  });
});
