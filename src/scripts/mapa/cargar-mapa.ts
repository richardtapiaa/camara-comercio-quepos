// Carga el mapa interactivo de afiliados (components/MapaComponentes/MapaAfiliadosMapcn.astro) con la primera
// interacción, en vez de al abrir la página: así su JavaScript no bloquea la carga en el celular
const contenedor = document.querySelector<HTMLElement>("[data-mapa-afiliados]");
const montaje = contenedor?.querySelector<HTMLElement>("[data-mapa-montaje]");
const datos = contenedor?.querySelector<HTMLScriptElement>("[data-mapa-datos]");

if (contenedor && montaje && datos) {
  const eventos = ["pointermove", "pointerdown", "touchstart", "wheel", "keydown", "scroll"] as const;
  let cargado = false;

  const cargar = async () => {
    if (cargado) return;
    cargado = true;
    eventos.forEach((evento) => window.removeEventListener(evento, cargar));
    contenedor.querySelector("[data-mapa-aviso]")?.remove();

    // En desarrollo, @vitejs/plugin-react necesita su preámbulo de Fast Refresh, que Astro solo agrega a las páginas
    // con islas de React (esta ya no tiene). En el build no hace falta
    if (import.meta.env.DEV) {
      const { default: refresco } = await import(/* @vite-ignore */ "/@react-refresh");
      refresco.injectIntoGlobalHook(window);
      Object.assign(window, {
        $RefreshReg$: () => {},
        $RefreshSig$: () => (tipo: unknown) => tipo,
        __vite_plugin_react_preamble_installed__: true,
      });
    }

    const [{ createElement }, { createRoot }, { default: MapaAfiliadosMapcn }] = await Promise.all([
      import("react"),
      import("react-dom/client"),
      import("../../components/ReactComponentes/MAPA/MapaAfiliadosMapcn"),
    ]);
    createRoot(montaje).render(createElement(MapaAfiliadosMapcn, { afiliados: JSON.parse(datos.textContent ?? "[]") }));
  };

  eventos.forEach((evento) => window.addEventListener(evento, cargar, { once: true, passive: true }));
  contenedor.querySelector("[data-mapa-cargar]")?.addEventListener("click", cargar);
}
