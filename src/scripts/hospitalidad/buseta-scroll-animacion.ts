import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const conCss = CSS.supports("animation-timeline: view()");
const sinMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!conCss && !sinMovimiento) {
  document.querySelectorAll<HTMLElement>("[data-buseta-scroll]").forEach((recuadro) => {
    const buseta = recuadro.querySelector<HTMLElement>("[data-buseta]");
    if (!buseta) return;

    buseta.style.left = "0";

    gsap.fromTo(
      buseta,
      { xPercent: -110, x: 0 },
      {
        xPercent: 0,
        x: () => recuadro.offsetWidth,
        ease: "none",
        scrollTrigger: {
          trigger: recuadro,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
          invalidateOnRefresh: true,
        },
      }
    );
  });
}
