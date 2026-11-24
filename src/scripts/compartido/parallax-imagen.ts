import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
  document.querySelectorAll<HTMLElement>("[data-parallax-imagen]").forEach((seccion) => {
    const capa = seccion.querySelector<HTMLElement>("[data-parallax-imagen-capa]");
    if (!capa) return;
    gsap.fromTo(
      capa,
      { yPercent: -11.5 },
      {
        yPercent: 11.5,
        ease: "none",
        scrollTrigger: { trigger: seccion, start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true },
      },
    );
  });
});
