// Inclina el plato hacia el puntero (hasta 10°) y mueve un poco la comida, como si estuviera más cerca; al salir
// vuelve a quedar plano. Solo con mouse y si no se pidió reducir el movimiento
if (window.matchMedia("(hover: hover) and (prefers-reduced-motion: no-preference)").matches) {
  document.querySelectorAll<HTMLElement>("[data-plato]").forEach((plato) => {
    plato.addEventListener("pointermove", (e) => {
      const caja = plato.getBoundingClientRect();
      const x = (e.clientX - caja.left) / caja.width - 0.5;
      const y = (e.clientY - caja.top) / caja.height - 0.5;
      plato.style.setProperty("--giro-x", `${-y * 20}deg`);
      plato.style.setProperty("--giro-y", `${x * 20}deg`);
      plato.style.setProperty("--mover-x", `${x * 6}px`);
      plato.style.setProperty("--mover-y", `${y * 6}px`);
    });
    plato.addEventListener("pointerleave", () => {
      ["--giro-x", "--giro-y", "--mover-x", "--mover-y"].forEach((v) => plato.style.removeProperty(v));
    });
  });
}
