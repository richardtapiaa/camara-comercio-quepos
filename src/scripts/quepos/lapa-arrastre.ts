// Lapa de LapaArrastre.astro: entra por arriba a la derecha mientras se ve biodiversidad, con una tira de papel
// colgando de la pata, y baja hasta el centro. Cuando el borde de arriba de NahomiScroll asoma por abajo, la tira se le
// pega y la lapa lo va jalando hacia arriba. Antes de que llegue arriba, la tira se despega y la lapa se va volando.
//
// Todo se mide desde el borde de NahomiScroll, donde está el ancla, que el navegador mueve con el scroll. Donde hay
// ViewTimeline (Chrome, Android, Safari 26) la animación corre en el compositor, sin esperar al JavaScript: antes se
// movía en cada evento de scroll y en Android, con los cuadros del malecón cargando, la lapa iba a saltos.
// Sin ViewTimeline se calcula lo mismo en cada scroll.

const sinMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const ancla = document.querySelector<HTMLElement>("[data-lapa-ancla]");
const pista = ancla?.querySelector<HTMLElement>("[data-lapa-pista]");
const grupo = ancla?.querySelector<HTMLElement>("[data-lapa-grupo]");
const lapa = ancla?.querySelector<HTMLImageElement>("[data-lapa-arrastre]");
const tira = ancla?.querySelector<HTMLElement>("[data-lapa-tira]");
const pegada = tira?.querySelector<HTMLElement>("[data-tira-pegada]");

if (!sinMovimiento && ancla && pista && grupo && lapa && tira && pegada) {
  const entre = (a: number, b: number, t: number) => a + (b - a) * t;

  // Medidas en px; solo cambian al cambiar el tamaño de pantalla. La altura sale de la pista (35svh), que no cambia
  // cuando el celular esconde su barra
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

  // p: de 0 a 1 desde que el borde está a 1,35 pantallas de arriba (la pista entra por abajo) hasta que llega arriba
  const estado = (p: number) => {
    const alto = (ancho * 360) / 639;
    const largo = ancho * 0.45;
    const total = vh + bajada;
    const borde = total * (1 - p);
    const inicioArrastre = bajada / total;
    if (p < inicioArrastre) {
      // Bajando desde afuera, arriba a la derecha, hasta quedar en el centro justo encima de donde asomará el borde
      const b = p / inicioArrastre;
      const t = 1 - (1 - b) * (1 - b);
      const pataY = entre(-alto * 0.4, vh - largo, t) - vh * 0.08 * Math.sin(Math.PI * t);
      return {
        x: entre(vw / 2 + ancho * 0.6, 0, t),
        y: pataY - borde,
        // Volteada mira a la izquierda: girar a la izquierda le baja el pico, a la derecha se lo sube
        giro: entre(-20, 18, t),
        opacidad: 1,
        angulo: 90,
        pegada: 0,
      };
    }
    // Jalando hacia arriba desde el centro (d: de 0 a 1 mientras el borde sube desde abajo de la pantalla hasta
    // arriba); entre el 70 % y el 90 % la tira se despega, se inclina y la lapa se va hacia arriba a la izquierda
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
      // Cuadros clave a lo largo del recorrido; el navegador interpola entre ellos
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
