const boton = document.querySelector<HTMLButtonElement>("[data-volver-arriba]");

if (boton) {
  const sinMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)");
  const destino = document.getElementById("afiliados");
  let pendiente = false;

  const actualizar = () => {
    pendiente = false;
    const visible = destino
      ? destino.getBoundingClientRect().top < -window.innerHeight * 0.5
      : window.scrollY > window.innerHeight;
    boton.dataset.visible = String(visible);
    boton.inert = !visible;
  };

  window.addEventListener(
    "scroll",
    () => {
      if (pendiente) return;
      pendiente = true;
      requestAnimationFrame(actualizar);
    },
    { passive: true }
  );
  window.addEventListener("resize", actualizar);
  actualizar();

  boton.addEventListener("click", () => {
    const behavior = sinMovimiento.matches ? "auto" : "smooth";
    if (destino) destino.scrollIntoView({ behavior, block: "start" });
    else window.scrollTo({ top: 0, behavior });
  });
}
