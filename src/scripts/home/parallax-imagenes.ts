import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const imagenes = document.querySelectorAll<HTMLElement>("[data-parallax-img]");
const conCss = CSS.supports("animation-timeline: view()");

// Cuánto baja la imagen, en % de su propio alto: 50 si mide el doble que su marco (lo normal). Una imagen más baja
// lo indica con data-parallax-recorrido (y el mismo valor en --parallax-y-fin para la versión con CSS)
const recorrido = (img: HTMLElement) => Number(img.dataset.parallaxRecorrido ?? 50);

// Panel con sticky nativo: es el primer hijo de un contenedor que no es sticky,
// así que ese contenedor da su posición natural aunque el panel esté fijo
const baseSticky = (panel: HTMLElement) => panel.parentElement!.getBoundingClientRect().top + window.scrollY;
// Scroll en el que el panel sticky queda fijo (su "top" lo calcula paneles.ts según su alto)
const inicioSticky = (panel: HTMLElement) => baseSticky(panel) - parseFloat(getComputedStyle(panel).top);

// Sin animación si el usuario prefiere menos movimiento
if (imagenes.length && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  if (conCss) congelarEnPanelesSticky();
  else parallaxConGsap();
}

// Cuando un panel sticky queda fijo su marco ya no sube, pero la línea de tiempo de CSS no lo sabe:
// se corta la animación en ese punto y se deja la imagen donde iba
function congelarEnPanelesSticky() {
  document.querySelectorAll<HTMLElement>("[data-panel-sticky]").forEach((panel) => {
    const imgs = panel.querySelectorAll<HTMLElement>("[data-parallax-img]");
    if (!imgs.length) return;
    let cuadro = 0;

    // En el siguiente cuadro, cuando paneles.ts ya actualizó el alto del panel
    const calcular = () => {
      cancelAnimationFrame(cuadro);
      cuadro = requestAnimationFrame(() => {
        const alto = window.innerHeight;
        const topPanel = panel.getBoundingClientRect().top;
        const base = baseSticky(panel);
        const fijo = inicioSticky(panel);
        // Lo que el panel puede quedarse fijo; el navegador lo suma al rango de la línea de tiempo
        const recorridoSticky = panel.parentElement!.offsetHeight - panel.offsetHeight;
        imgs.forEach((img) => {
          const marco = img.parentElement!;
          const topMarco = base + marco.getBoundingClientRect().top - topPanel;
          // Rango "cover": desde que el marco asoma por abajo hasta que sale por arriba
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
      // Cuando el panel queda fijo su marco ya no sube; se congela el parallax en ese punto
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
      // En un panel sticky se mide desde su posición natural (si está fijo, la real ya no sirve)
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
