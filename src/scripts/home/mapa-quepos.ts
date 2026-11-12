// Mapa del cantón en el inicio: al tocar un distrito, una copia de su forma se
// agranda hasta el centro de la pantalla y luego se abre su página. Con
// "reducir movimiento", o con Ctrl/Cmd/Shift/Alt o clic del medio, el enlace
// funciona normal. La página del distrito se precarga al pasar el mouse o al
// enfocarlo con el teclado (salvo con ahorro de datos o conexión 2G).
const DURACION = 750;
const ESPERA_PRECARGA = 80;

const sinMovimiento = matchMedia("(prefers-reduced-motion: reduce)");
let capa: HTMLDivElement | null = null;
let respaldo = 0;

const mapa = document.querySelector<SVGSVGElement>("[data-mapa-quepos]");
if (mapa) {
  mapa.querySelectorAll<SVGAElement>("a[data-distrito]").forEach((enlace) => activarDistrito(mapa, enlace));
  // Al volver con el botón "atrás", el navegador puede restaurar la página
  // con la copia agrandada todavía encima: se quita.
  addEventListener("pageshow", (e) => {
    if (e.persisted) limpiar();
  });
}

function limpiar() {
  clearTimeout(respaldo);
  capa?.remove();
  capa = null;
}

function activarDistrito(mapa: SVGSVGElement, enlace: SVGAElement) {
  const destino = enlace.getAttribute("href");
  const id = enlace.dataset.distrito;
  if (!destino || !id) return;

  let precargado = false;
  let esperaPrecarga = 0;
  const precargar = () => {
    clearTimeout(esperaPrecarga);
    if (precargado) return;
    precargado = true;
    const conexion = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    if (conexion?.saveData || conexion?.effectiveType?.includes("2g")) return;
    document.head.append(Object.assign(document.createElement("link"), { rel: "prefetch", href: destino }));
  };

  enlace.addEventListener("pointerenter", (e) => {
    if (e.pointerType === "mouse") esperaPrecarga = window.setTimeout(precargar, ESPERA_PRECARGA);
    else precargar();
  });
  enlace.addEventListener("pointerleave", () => clearTimeout(esperaPrecarga));
  enlace.addEventListener("focus", precargar);

  enlace.addEventListener("click", (e) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || sinMovimiento.matches) return;
    e.preventDefault();
    if (capa) return;
    precargar();
    acercar(mapa, enlace, destino, id);
  });
}

function acercar(mapa: SVGSVGElement, enlace: SVGAElement, destino: string, id: string) {
  const forma = enlace.querySelector("path");
  if (!forma) {
    location.assign(destino);
    return;
  }
  const nombre = mapa.querySelector(`text[data-distrito='${id}']`);
  const caja = forma.getBBox();
  const vb = mapa.viewBox.baseVal;
  const rm = mapa.getBoundingClientRect();
  const k = Math.min(rm.width / vb.width, rm.height / vb.height);
  const x = rm.left + (rm.width - vb.width * k) / 2 + (caja.x - vb.x) * k;
  const y = rm.top + (rm.height - vb.height * k) / 2 + (caja.y - vb.y) * k;
  const ancho = caja.width * k;
  const alto = caja.height * k;
  const pantallaAncho = document.documentElement.clientWidth;
  const arriba = Math.max(0, document.getElementById("site-header")?.getBoundingClientRect().bottom ?? 0);
  const pantallaAlto = document.documentElement.clientHeight - arriba;
  const fondo = getComputedStyle(mapa.closest("section") ?? document.body).backgroundColor;
  const letra = getComputedStyle(mapa).fontFamily;
  const filtro = getComputedStyle(forma).filter;
  const dx = pantallaAncho / 2 - (x + ancho / 2);
  const dy = arriba + pantallaAlto / 2 - (y + alto / 2);
  const escala = Math.min(2.4, Math.max(1.3, 0.9 * Math.min(pantallaAncho / ancho, pantallaAlto / alto)));

  capa = document.createElement("div");
  capa.setAttribute("aria-hidden", "true");
  Object.assign(capa.style, { position: "fixed", inset: "0", zIndex: "40", overflow: "hidden" });

  const velo = document.createElement("div");
  Object.assign(velo.style, { position: "absolute", inset: "0", background: fondo, opacity: "0" });

  const copia = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  copia.setAttribute("viewBox", `${caja.x} ${caja.y} ${caja.width} ${caja.height}`);
  Object.assign(copia.style, {
    position: "absolute",
    left: `${x}px`,
    top: `${y}px`,
    width: `${ancho}px`,
    height: `${alto}px`,
    overflow: "visible",
    fontFamily: letra,
  });
  const formaCopia = forma.cloneNode() as SVGPathElement;
  formaCopia.removeAttribute("class");
  formaCopia.style.filter = filtro;
  copia.append(formaCopia);
  if (nombre) copia.append(nombre.cloneNode(true));

  capa.append(velo, copia);
  document.body.append(capa);

  velo.animate({ opacity: [0, 1] }, { duration: DURACION * 0.7, easing: "ease-out", fill: "forwards" });
  copia
    .animate(
      { transform: ["none", `translate(${dx}px, ${dy}px) scale(${escala})`] },
      { duration: DURACION, easing: "cubic-bezier(0.65, 0, 0.35, 1)", fill: "forwards" },
    )
    .finished.then(() => {
      location.assign(destino);
      respaldo = window.setTimeout(limpiar, 5000);
    });
}
