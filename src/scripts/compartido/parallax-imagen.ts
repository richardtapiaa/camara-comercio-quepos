import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Parallax para una foto <img>/<Picture> (a diferencia de foto-quepos.ts, que mueve una imagen de fondo de CSS).
// La sección lleva data-parallax-imagen y overflow-hidden; la foto lleva data-parallax-imagen-capa y es un 30 %
// más alta que la sección (top -15 %, alto 130 %). Mientras la sección cruza la pantalla, la foto baja de -15 % a
// +15 % del alto de la sección (±11,5 % de su propio alto), así que se mueve más lento que el scroll y nunca deja
// ver el borde. Con "reducir movimiento" activado no se anima.
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
