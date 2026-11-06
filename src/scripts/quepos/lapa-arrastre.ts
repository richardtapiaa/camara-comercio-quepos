const sinMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const ancla = document.querySelector<HTMLElement>("[data-lapa-ancla]");
const pista = ancla?.querySelector<HTMLElement>("[data-lapa-pista]");
const grupo = ancla?.querySelector<HTMLElement>("[data-lapa-grupo]");
const lapa = ancla?.querySelector<HTMLImageElement>("[data-lapa-arrastre]");
const tira = ancla?.querySelector<HTMLElement>("[data-lapa-tira]");
const pegada = tira?.querySelector<HTMLElement>("[data-tira-pegada]");

if (!sinMovimiento && ancla && pista && grupo && lapa && tira && pegada) {
  const entre = (a: number, b: number, t: number) => a + (b - a) * t;

  let vw = 0;
  let vh = 0;
  let bajada = 0;
  let ancho = 0;
  const medir = () => {
    const antes = `${vw} ${vh} ${ancho}`;
    vw = ancla.clientWidth;
    bajada = pista.offsetHeight;
    vh = bajada / 0.35;
    ancho = lapa.offsetWidth;
    return antes !== `${vw} ${vh} ${ancho}`;
  };

  const estado = (p: number) => {
    const alto = (ancho * 360) / 639;
    const largo = ancho * 0.45;
    const total = vh + bajada;
    const borde = total * (1 - p);
    const inicioArrastre = bajada / total;
    if (p < inicioArrastre) {
      const b = p / inicioArrastre;
      const t = 1 - (1 - b) * (1 - b);
      const pataY = entre(-alto * 0.4, vh - largo, t) - vh * 0.08 * Math.sin(Math.PI * t);
      return {
        x: entre(vw / 2 + ancho * 0.6, 0, t),
        y: pataY - borde,
        giro: entre(-20, 18, t),
        opacidad: 1,
        angulo: 90,
        pegada: 0,
      };
    }
    const d = 1 - borde / vh;
    const k = Math.min(1, Math.max(0, (d - 0.7) / 0.2));
    return {
      x: vw * 0.01 * Math.sin(4 * Math.PI * d) - k * k * vw * 0.4,
      y: -largo - k * vh * 0.35,
      giro: 18 + 5 * Math.sin(6 * Math.PI * d),
      opacidad: d >= 0.9 ? 0 : 1 - k,
      angulo: 90 - 30 * Math.min(1, k * 2),
      pegada: k === 0 ? 1 : 0,
    };
  };

  const aplicar = (e: ReturnType<typeof estado>) => ({
    grupo: { transform: `translate3d(${e.x}px, ${e.y}px, 0)`, opacity: String(e.opacidad) },
    lapa: { transform: `rotate(${e.giro}deg) scale(-1, 1)` },
    tira: { transform: `translateY(-50%) rotate(${e.angulo}deg)` },
    pegada: { opacity: String(e.pegada) },
  });

  type Pieza = "grupo" | "lapa" | "tira" | "pegada";
  const piezas: Record<Pieza, HTMLElement> = { grupo, lapa, tira, pegada };

  const ViewTimelineCtor = (window as unknown as { ViewTimeline?: new (o: { subject: Element }) => AnimationTimeline })
    .ViewTimeline;

  if (ViewTimelineCtor) {
    let animaciones: Animation[] = [];
    const crear = () => {
      animaciones.forEach((a) => a.cancel());
      const PUNTOS = 72;
      const muestras = Array.from({ length: PUNTOS + 1 }, (_, i) => i / PUNTOS);
      const inicioArrastre = bajada / (vh + bajada);
      muestras.push(inicioArrastre - 0.001, inicioArrastre);
      muestras.sort((a, b) => a - b);
      const cuadros = muestras.map((p) => ({ offset: p, ...aplicar(estado(p)) }));
      const timeline = new ViewTimelineCtor({ subject: pista });
      animaciones = (Object.keys(piezas) as Pieza[]).map((pieza) =>
        piezas[pieza].animate(
          cuadros.map((c) => ({ offset: c.offset, ...c[pieza] })),
          { timeline, rangeStart: "cover 0%", rangeEnd: "cover 100%", fill: "none" } as KeyframeAnimationOptions,
        ),
      );
    };
    const actualizar = () => medir() && crear();
    window.addEventListener("resize", actualizar);
    lapa.addEventListener("load", actualizar);
    medir();
    crear();
  } else {
    let cuadro = 0;
    let visible = false;
    const mover = () => {
      cuadro = 0;
      const { top } = pista.getBoundingClientRect();
      const p = (window.innerHeight - top) / (window.innerHeight + bajada);
      if (p <= 0 || p >= 1) {
        if (visible) grupo.style.opacity = "";
        visible = false;
        return;
      }
      visible = true;
      const valores = aplicar(estado(p));
      (Object.keys(piezas) as Pieza[]).forEach((pieza) => Object.assign(piezas[pieza].style, valores[pieza]));
    };
    const pedir = () => (cuadro ||= requestAnimationFrame(mover));
    window.addEventListener("scroll", pedir, { passive: true });
    window.addEventListener("resize", () => medir() && pedir());
    lapa.addEventListener("load", () => medir() && pedir());
    medir();
    mover();
  }
}
