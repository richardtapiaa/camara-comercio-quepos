import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

const sinMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const trazar = (ancho: number, alto: number) => {
  const ondas = ancho < 700 ? 3 : 5;
  const amplitud = alto * (ancho < 700 ? 0.08 : 0.1);
  const puntos = 160;
  let d = "";
  for (let i = 0; i <= puntos; i++) {
    const t = i / puntos;
    const x = -0.1 * ancho + t * 1.2 * ancho;
    const y = alto * (0.78 - 0.56 * t) - amplitud * Math.sin(t * ondas * 2 * Math.PI);
    d += `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return d;
};

if (!sinMovimiento) {
  document.querySelectorAll<HTMLElement>("[data-mariposa-scroll]").forEach((recuadro) => {
    const mariposa = recuadro.querySelector<HTMLElement>("[data-mariposa]");
    const rastro = recuadro.querySelector<SVGSVGElement>("[data-mariposa-rastro]");
    const camino = recuadro.querySelector<SVGPathElement>("[data-mariposa-camino]");
    const mascara = recuadro.querySelector<SVGPathElement>("[data-mariposa-mascara]");
    if (!mariposa || !rastro || !camino || !mascara) return;

    mariposa.style.left = "0";
    mariposa.style.top = "0";
    rastro.style.display = "block";

    let tl: gsap.core.Timeline | undefined;
    let anchoAnterior = 0;

    const construir = () => {
      const ancho = recuadro.offsetWidth;
      const alto = recuadro.offsetHeight;
      anchoAnterior = ancho;

      const d = trazar(ancho, alto);
      rastro.setAttribute("viewBox", `0 0 ${ancho} ${alto}`);
      camino.setAttribute("d", d);
      mascara.setAttribute("d", d);

      const largo = mascara.getTotalLength();
      mascara.style.strokeDasharray = `${largo}`;

      const progreso = tl?.scrollTrigger?.progress ?? 0;
      tl?.scrollTrigger?.kill();
      tl?.kill();

      tl = gsap
        .timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: recuadro, start: "top bottom", end: "bottom top", scrub: 0.6 },
        })
        .to(mariposa, { motionPath: { path: camino, align: camino, alignOrigin: [0.5, 0.5] } }, 0)
        .fromTo(mascara, { strokeDashoffset: largo }, { strokeDashoffset: 0 }, 0);
      tl.progress(progreso);
    };

    construir();

    let espera: number | undefined;
    window.addEventListener("resize", () => {
      window.clearTimeout(espera);
      espera = window.setTimeout(() => {
        if (recuadro.offsetWidth !== anchoAnterior) {
          construir();
          ScrollTrigger.refresh();
        }
      }, 200);
    });
  });
}
