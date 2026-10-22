import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const conCss = CSS.supports("animation-timeline: view()");
const sinMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Mismo recorrido que el keyframe hero-vista-esconde, para navegadores sin scroll-driven animations
if (!conCss && !sinMovimiento) {
  document.querySelectorAll<HTMLElement>("[data-hero-vista-titulo]").forEach((titulo) => {
    const hero = titulo.closest<HTMLElement>(".hero-vista");
    if (!hero) return;
    gsap.to(titulo, {
      // Igual que --bajada: el 19 % del alto de la foto más el 110 % del alto del título
      y: () => (hero.querySelector<HTMLElement>(".hero-vista-recuadro")?.offsetHeight ?? 0) * 0.19 + titulo.offsetHeight * 1.1,
      ease: "none",
      scrollTrigger: {
        trigger: hero,
        start: "top top",
        // Equivale a "exit 85%" del CSS
        end: () => `+=${hero.offsetHeight * 0.85}`,
        scrub: true,
        invalidateOnRefresh: true,
      },
    });
  });
}
