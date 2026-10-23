import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const conCss = CSS.supports("animation-timeline: view()");
const sinMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!conCss && !sinMovimiento) {
  document.querySelectorAll<HTMLElement>("[data-hero-vista-titulo]").forEach((titulo) => {
    const hero = titulo.closest<HTMLElement>(".hero-vista");
    if (!hero) return;
    gsap.to(titulo, {
      y: () => (hero.querySelector<HTMLElement>(".hero-vista-recuadro")?.offsetHeight ?? 0) * 0.19 + titulo.offsetHeight * 1.1,
      ease: "none",
      scrollTrigger: {
        trigger: hero,
        start: "top top",
        end: () => `+=${hero.offsetHeight * 0.85}`,
        scrub: true,
        invalidateOnRefresh: true,
      },
    });
  });
}
