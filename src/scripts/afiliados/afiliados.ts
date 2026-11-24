import { ScrollTrigger } from "gsap/ScrollTrigger";

const normalizar = (texto: string) =>
  texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

const ESPERA_AL_ESCRIBIR = 300;
const MAXIMO_ESCALONADAS = 8;

document.querySelectorAll<HTMLElement>("[data-afiliados]").forEach((seccion) => {
  const buscador = seccion.querySelector<HTMLInputElement>("[data-afiliados-buscar]");
  const limpiar = seccion.querySelector<HTMLButtonElement>("[data-afiliados-limpiar]");
  const chips = Array.from(seccion.querySelectorAll<HTMLButtonElement>("[data-cat-chip]"));
  const tarjetas = Array.from(seccion.querySelectorAll<HTMLElement>("[data-afiliado]"));
  const cuenta = seccion.querySelector<HTMLElement>("[data-afiliados-cuenta]");
  const vacio = seccion.querySelector<HTMLElement>("[data-afiliados-vacio]");
  let categoria = "";
  let remedir = 0;
  let espera = 0;

  const actualizar = () => {
    window.clearTimeout(espera);
    const texto = normalizar(buscador?.value ?? "");
    let visibles = 0;
    tarjetas.forEach((tarjeta) => {
      const ver =
        (!categoria || tarjeta.dataset.categoria === categoria) && (tarjeta.dataset.nombre ?? "").includes(texto);
      tarjeta.hidden = !ver;
      tarjeta.classList.remove("afiliado-entra");
      if (ver) {
        tarjeta.style.setProperty("--orden", String(Math.min(visibles, MAXIMO_ESCALONADAS)));
        void tarjeta.offsetWidth;
        tarjeta.classList.add("afiliado-entra");
        visibles++;
      }
    });
    if (cuenta) cuenta.textContent = `${visibles} ${visibles === 1 ? "afiliado" : "afiliados"}`;
    if (vacio) vacio.hidden = visibles > 0;
    if (limpiar) limpiar.hidden = !buscador?.value;
    if (!remedir) remedir = requestAnimationFrame(() => {
      remedir = 0;
      ScrollTrigger.refresh();
    });
  };

  buscador?.addEventListener("input", () => {
    if (limpiar) limpiar.hidden = !buscador.value;
    if (cuenta && !espera) cuenta.textContent = "Buscando…";
    window.clearTimeout(espera);
    espera = window.setTimeout(() => {
      espera = 0;
      actualizar();
    }, ESPERA_AL_ESCRIBIR);
  });

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      categoria = chip.dataset.valor ?? "";
      chips.forEach((c) => c.setAttribute("aria-pressed", String(c === chip)));
      espera = 0;
      actualizar();
    });
  });

  const borrar = () => {
    if (!buscador) return;
    buscador.value = "";
    espera = 0;
    actualizar();
    buscador.focus();
  };
  limpiar?.addEventListener("click", borrar);
  buscador?.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && buscador.value) {
      e.preventDefault();
      borrar();
    }
  });
});
