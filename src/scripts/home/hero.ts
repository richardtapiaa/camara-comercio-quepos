
if (!CSS.supports("animation-timeline: scroll()")) {
  const hero = document.getElementById("hero");
  const capa = document.querySelector<HTMLElement>("[data-hero-oscuro]");
  if (hero && capa) {
    let cuadro = 0;
    const actualizar = () => {
      cuadro = 0;
      const progreso = Math.min(1, Math.max(0, window.scrollY / hero.offsetHeight));
      capa.style.opacity = String(progreso * 0.75);
    };
    window.addEventListener("scroll", () => (cuadro ||= requestAnimationFrame(actualizar)), { passive: true });
    actualizar();
  }
}
