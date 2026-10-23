import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const imagenes = document.querySelectorAll<HTMLElement>("[data-parallax-img]");
const conCss = CSS.supports("animation-timeline: view()");

const recorrido = (img: HTMLElement) => Number(img.dataset.parallaxRecorrido ?? 50);

const baseSticky = (panel: HTMLElement) => panel.parentElement!.getBoundingClientRect().top + window.scrollY;
const inicioSticky = (panel: HTMLElement) => baseSticky(panel) - parseFloat(getComputedStyle(panel).top);

if (imagenes.length && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  if (conCss) congelarEnPanelesSticky();
  else parallaxConGsap();
}

function congelarEnPanelesSticky() {
  document.querySelectorAll<HTMLElement>("[data-panel-sticky]").forEach((panel) => {
    const imgs = panel.querySelectorAll<HTMLElement>("[data-parallax-img]");
    if (!imgs.length) return;
    let cuadro = 0;

    const calcular = () => {
      cancelAnimationFrame(cuadro);
      cuadro = requestAnimationFrame(() => {
        const alto = window.innerHeight;
        const topPanel = panel.getBoundingClientRect().top;
        const base = baseSticky(panel);
        const fijo = inicioSticky(panel);
        const recorridoSticky = panel.parentElement!.offsetHeight - panel.offsetHeight;
        imgs.forEach((img) => {
          const marco = img.parentElement!;
          const topMarco = base + marco.getBoundingClientRect().top - topPanel;
          const largo = alto + marco.offsetHeight;
          const hastaFijo = gsap.utils.clamp(0.001, largo, fijo - (topMarco - alto));
          img.style.setProperty("--parallax-rango-fin", `cover ${(hastaFijo / (largo + recorridoSticky)) * 100}%`);
          img.style.setProperty("--parallax-y-fin", `${(hastaFijo / largo) * recorrido(img)}%`);
        });
      });
    };

    new ResizeObserver(calcular).observe(panel);
    window.addEventListener("resize", calcular);
  });
}

function parallaxConGsap() {
  imagenes.forEach((img) => {
    const animacion = gsap.to(img, { yPercent: recorrido(img), ease: "none", paused: true });
    const marcoImg = img.parentElement!;
    const panelFijo = img.closest<HTMLElement>(".panel.pinned");
    const panelSticky = img.closest<HTMLElement>("[data-panel-sticky]");
    let inicioFijoSticky: number | undefined;

    const topNatural = () =>
      baseSticky(panelSticky!) + marcoImg.getBoundingClientRect().top - panelSticky!.getBoundingClientRect().top;

    const actualizar = (st: ScrollTrigger) => {
      const inicioFijo = panelSticky
        ? inicioFijoSticky
        : panelFijo
          ? ScrollTrigger.getById("pin-" + panelFijo.id)?.start
          : undefined;
      const scroll = inicioFijo === undefined ? st.scroll() : Math.min(st.scroll(), inicioFijo);
      animacion.progress(gsap.utils.clamp(0, 1, (scroll - st.start) / (st.end - st.start)));
    };

    ScrollTrigger.create({
      trigger: marcoImg,
      start: panelSticky ? () => topNatural() - window.innerHeight : "top bottom",
      end: panelSticky ? () => topNatural() + marcoImg.offsetHeight : "bottom top",
      onUpdate: actualizar,
      onRefresh: (st) => {
        if (panelSticky) inicioFijoSticky = inicioSticky(panelSticky);
        actualizar(st);
      },
    });
  });
}
