const boton = document.querySelector<HTMLButtonElement>("[data-volver-arriba]");

if (boton) {
  const sinMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)");
  const destino = document.getElementById("afiliados");
  let pendiente = false;

  // Visible cuando el título de "Nuestros afiliados" ya quedó media pantalla por encima (sin la sección: cuando
  // se bajó más de un alto de pantalla)
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

  // scrollIntoView respeta el scroll-margin-top de la sección, que deja el título debajo de la barra de navegación
  boton.addEventListener("click", () => {
    const behavior = sinMovimiento.matches ? "auto" : "smooth";
    if (destino) destino.scrollIntoView({ behavior, block: "start" });
    else window.scrollTo({ top: 0, behavior });
  });
}
