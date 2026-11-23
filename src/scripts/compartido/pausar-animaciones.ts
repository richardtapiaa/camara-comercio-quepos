// Las animaciones infinitas gastan CPU y batería aunque no se vean. Se pausan mientras su sección está fuera de
// pantalla y siguen donde iban al volver.
const fueraDePantalla = new Set<Element>();
const animadosPorSeccion = new Map<Element, Set<Element>>();

const observador = new IntersectionObserver(
  (entradas) => {
    for (const { target, isIntersecting } of entradas) {
      if (isIntersecting) fueraDePantalla.delete(target);
      else fueraDePantalla.add(target);
      animadosPorSeccion.get(target)?.forEach((elemento) => elemento.toggleAttribute("data-animacion-pausada", !isIntersecting));
    }
  },
  { rootMargin: "200px 0px" },
);

const registrar = (animacion: Animation) => {
  if (!(animacion instanceof CSSAnimation)) return;
  const efecto = animacion.effect as KeyframeEffect | null;
  const elemento = efecto?.target;
  if (!elemento || efecto.getComputedTiming().iterations !== Infinity) return;

  const seccion = elemento.closest("section") ?? elemento;
  let animados = animadosPorSeccion.get(seccion);
  if (!animados) {
    animados = new Set();
    animadosPorSeccion.set(seccion, animados);
    observador.observe(seccion);
  }
  animados.add(elemento);
  elemento.toggleAttribute("data-animacion-pausada", fueraDePantalla.has(seccion));
};

document.getAnimations().forEach(registrar);
document.addEventListener("animationstart", ({ target }) => {
  if (target instanceof Element) target.getAnimations({ subtree: true }).forEach(registrar);
});
