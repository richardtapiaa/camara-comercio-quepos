import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const conCss = CSS.supports("animation-timeline: view()");
const sinMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const medirSubida = (recuadro: HTMLElement, lapa: HTMLElement) => {
  const nube = recuadro.querySelector<SVGElement>("svg.nube-svg");
  const bordeNubes = nube ? nube.getBoundingClientRect().height : 0;
  return Math.max(0, lapa.offsetTop - bordeNubes + lapa.offsetHeight * 0.7);
};

if (conCss && !sinMovimiento) {
  document.querySelectorAll<HTMLElement>("[data-lapa-scroll]").forEach((recuadro) => {
    const lapa = recuadro.querySelector<HTMLElement>("[data-lapa]");
    if (!lapa) return;
    const actualizar = () => lapa.style.setProperty("--subida", `${medirSubida(recuadro, lapa)}px`);
    actualizar();
    new ResizeObserver(actualizar).observe(recuadro);
    lapa.addEventListener("load", actualizar);
  });
}

if (!conCss && !sinMovimiento) {
  document.querySelectorAll<HTMLElement>("[data-lapa-scroll]").forEach((recuadro) => {
    const lapa = recuadro.querySelector<HTMLElement>("[data-lapa]");
    if (!lapa) return;

    lapa.style.left = "0";
    lapa.style.translate = "none";

    const PUNTOS = 16;
    const punto = (i: number) => {
      const t = i / PUNTOS;
      const altura = 0.5 - 0.5 * Math.cos(3 * Math.PI * t);
      return {
        x: () => recuadro.offsetWidth * t,
        xPercent: -100 + 100 * t,
        y: () => lapa.offsetHeight * 0.05 - medirSubida(recuadro, lapa) * altura,
        rotate: -16 * Math.sin(3 * Math.PI * t),
      };
    };
    const vuelo = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: recuadro,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
        invalidateOnRefresh: true,
      },
    });
    gsap.set(lapa, punto(0));
    for (let i = 1; i <= PUNTOS; i++) vuelo.to(lapa, { ...punto(i), duration: 1 });

    recuadro.querySelectorAll<Element>(".nube-capa, .selva-capa").forEach((capa) => {
      const estilo = getComputedStyle(capa);
      const dx = parseFloat(estilo.getPropertyValue("--nube-x"));
      const dy = parseFloat(estilo.getPropertyValue("--nube-y"));
      gsap.fromTo(
        capa,
        { x: dx * -0.5, y: -dy },
        {
          x: dx * 0.5,
          y: dy,
          ease: "none",
          scrollTrigger: { trigger: recuadro, start: "top bottom", end: "bottom top", scrub: true },
        }
      );
    });
  });
}
