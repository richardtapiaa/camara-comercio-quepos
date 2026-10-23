import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const mm = gsap.matchMedia();

mm.add("(prefers-reduced-motion: no-preference)", () => {
  document.querySelectorAll<HTMLElement>("[data-parallax-afiliados]").forEach((hero) => {
    const fondo = hero.querySelector<HTMLElement>("[data-parallax-fondo]");
    const contenido = hero.querySelector<HTMLElement>("[data-parallax-contenido]");
    const oscuro = hero.querySelector<HTMLElement>("[data-parallax-oscuro]");

    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true, invalidateOnRefresh: true },
    });

    if (fondo) tl.fromTo(fondo, { yPercent: 0, scale: 1 }, { yPercent: 40, scale: 1.15, duration: 1 }, 0);
    if (contenido) tl.to(contenido, { y: () => -hero.offsetHeight * 0.35, autoAlpha: 0, duration: 0.7 }, 0);
    if (oscuro) tl.fromTo(oscuro, { opacity: 0 }, { opacity: 0.7, duration: 1 }, 0);
  });
});
