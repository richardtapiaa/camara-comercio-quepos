// Filtra las tarjetas por categoría y por nombre (sin importar mayúsculas ni tildes)
const normalizar = (texto: string) =>
  texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

document.querySelectorAll<HTMLElement>("[data-afiliados]").forEach((seccion) => {
  const buscador = seccion.querySelector<HTMLInputElement>("[data-afiliados-buscar]");
  const desplegable = seccion.querySelector<HTMLElement>("[data-afiliados-categoria]");
  const tarjetas = Array.from(seccion.querySelectorAll<HTMLElement>("[data-afiliado]"));
  const cuenta = seccion.querySelector<HTMLElement>("[data-afiliados-cuenta]");
  const vacio = seccion.querySelector<HTMLElement>("[data-afiliados-vacio]");
  let categoria = "";

  const actualizar = () => {
    const texto = normalizar(buscador?.value ?? "");
    let visibles = 0;
    tarjetas.forEach((tarjeta) => {
      const ver =
        (!categoria || tarjeta.dataset.categoria === categoria) && (tarjeta.dataset.nombre ?? "").includes(texto);
      tarjeta.hidden = !ver;
      if (ver) visibles++;
    });
    if (cuenta) cuenta.textContent = `${visibles} ${visibles === 1 ? "afiliado" : "afiliados"}`;
    if (vacio) vacio.hidden = visibles > 0;
  };

  // Desplegable de categoría con íconos
  if (desplegable) {
    const boton = desplegable.querySelector<HTMLButtonElement>("[data-cat-boton]")!;
    const lista = desplegable.querySelector<HTMLUListElement>("[data-cat-lista]")!;
    const opciones = Array.from(lista.querySelectorAll<HTMLLIElement>("[role=option]"));
    const iconoBoton = boton.querySelector<HTMLElement>("[data-cat-icono]")!;
    const textoBoton = boton.querySelector<HTMLElement>("[data-cat-texto]")!;
    const flecha = boton.querySelector<SVGElement>("[data-cat-flecha]");

    const abierta = () => lista.dataset.abierto === "true";
    const abrir = (enfocar = true) => {
      lista.dataset.abierto = "true";
      boton.setAttribute("aria-expanded", "true");
      flecha?.classList.add("rotate-180");
      if (enfocar) (opciones.find((o) => o.getAttribute("aria-selected") === "true") ?? opciones[0]).focus();
    };
    const cerrar = (devolverFoco = false) => {
      lista.dataset.abierto = "false";
      boton.setAttribute("aria-expanded", "false");
      flecha?.classList.remove("rotate-180");
      if (devolverFoco) boton.focus();
    };
    const elegir = (opcion: HTMLLIElement) => {
      opciones.forEach((o) => o.setAttribute("aria-selected", String(o === opcion)));
      categoria = opcion.dataset.valor ?? "";
      const nombre = opcion.textContent?.trim() ?? "";
      textoBoton.textContent = nombre;
      iconoBoton.innerHTML = opcion.querySelector("[data-cat-icono-opcion]")?.innerHTML ?? "";
      boton.setAttribute("aria-label", `Filtrar por categoría: ${nombre}`);
      cerrar(true);
      actualizar();
    };

    boton.addEventListener("click", () => (abierta() ? cerrar() : abrir()));
    boton.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        abrir();
      }
    });
    opciones.forEach((opcion, i) => {
      opcion.addEventListener("click", () => elegir(opcion));
      opcion.addEventListener("keydown", (e) => {
        if (e.key === "ArrowDown") opciones[(i + 1) % opciones.length].focus();
        else if (e.key === "ArrowUp") opciones[(i - 1 + opciones.length) % opciones.length].focus();
        else if (e.key === "Home") opciones[0].focus();
        else if (e.key === "End") opciones[opciones.length - 1].focus();
        else if (e.key === "Enter" || e.key === " ") elegir(opcion);
        else if (e.key === "Escape") cerrar(true);
        else if (e.key === "Tab") cerrar();
        else return;
        e.preventDefault();
      });
    });
    // Se cierra al tocar o hacer clic fuera
    document.addEventListener("pointerdown", (e) => {
      if (abierta() && !desplegable.contains(e.target as Node)) cerrar();
    });
  }
  buscador?.addEventListener("input", actualizar);
});
