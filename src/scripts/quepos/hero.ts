import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const conCss = CSS.supports("animation-timeline: view()");
const sinMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!conCss && !sinMovimiento) {
  document.querySelectorAll<HTMLElement>("[data-hero-isla-titulo]").forEach((titulo) => {
    const hero = titulo.closest<HTMLElement>(".hero-isla");
    if (!hero) return;
    gsap.to(titulo, {
      y: () => (parseFloat(getComputedStyle(titulo).getPropertyValue("--bajada")) / 100) * titulo.offsetHeight,
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
