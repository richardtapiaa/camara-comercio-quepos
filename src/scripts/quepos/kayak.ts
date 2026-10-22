import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const conCss = CSS.supports("animation-timeline: view()");
const sinMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!conCss && !sinMovimiento) {
  document.querySelectorAll<HTMLElement>("[data-kayak-scroll]").forEach((recuadro) => {
    const kayak = recuadro.querySelector<HTMLElement>("[data-kayak]");
    if (!kayak) return;


    kayak.style.left = "0";
    kayak.style.translate = "none";

    const scrollTrigger = { trigger: recuadro, start: "top bottom", end: "bottom top", scrub: true };


    // Mismo recorrido que el keyframe kayak-remada (misma fórmula y mismos 33 puntos)
    const PUNTOS = 32;
    const punto = (i: number) => {
      const t = i / PUNTOS;
      const fase = 8 * Math.PI * t;
      return {
        x: () => recuadro.offsetWidth * t,
        xPercent: -100 + 100 * t,
        y: -14 * Math.sin(fase),
        rotate: -4 * Math.cos(fase),
      };
    };
    const remada = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: { ...scrollTrigger, invalidateOnRefresh: true },
    });
    gsap.set(kayak, punto(0));
    for (let i = 1; i <= PUNTOS; i++) remada.to(kayak, { ...punto(i), duration: 1 });


    recuadro.querySelectorAll<Element>(".agua-capa, .cielo-nube").forEach((capa) => {
      const dx = parseFloat(getComputedStyle(capa).getPropertyValue("--agua-x"));
      gsap.fromTo(capa, { x: dx * -0.5 }, { x: dx * 0.5, ease: "none", scrollTrigger });
    });
  });
}
