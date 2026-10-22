import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const conCss = CSS.supports("animation-timeline: view()");
const sinMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!conCss && !sinMovimiento) {
  document.querySelectorAll<HTMLElement>("[data-buseta-scroll]").forEach((recuadro) => {
    const buseta = recuadro.querySelector<HTMLElement>("[data-buseta]");
    if (!buseta) return;

    // GSAP mueve con transform; se arranca desde el borde izquierdo para que no se sume al "left" de reposo
    buseta.style.left = "0";

    // Mismo recorrido que el keyframe de CSS: de fuera por la izquierda a fuera por la derecha
    gsap.fromTo(
      buseta,
      { xPercent: -110, x: 0 },
      {
        xPercent: 0,
        x: () => recuadro.offsetWidth,
        ease: "none",
        scrollTrigger: {
          trigger: recuadro,
          // Equivale a "cover 0% cover 100%" del CSS
          start: "top bottom",
          end: "bottom top",
          scrub: true,
          invalidateOnRefresh: true,
        },
      }
    );
  });
}
