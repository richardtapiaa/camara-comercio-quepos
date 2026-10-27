import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const conCss = CSS.supports("animation-timeline: view()");
const sinMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const medirSubida = (recuadro: HTMLElement, lapa: HTMLElement) => {
  const nube = recuadro.querySelector<SVGElement>("svg.nube-svg");
  const bordeNubes = nube ? nube.getBoundingClientRect().height : 0;
  return Math.max(0, lapa.offsetTop - bordeNubes + lapa.offsetHeight * 0.7);
};

if (conCss && !sinMovimiento) {
  document.querySelectorAll<HTMLElement>("[data-lapa-scroll]").forEach((recuadro) => {
    const lapa = recuadro.querySelector<HTMLElement>("[data-lapa]");
    if (!lapa) return;
    const actualizar = () => lapa.style.setProperty("--subida", `${medirSubida(recuadro, lapa)}px`);
    actualizar();
    new ResizeObserver(actualizar).observe(recuadro);
    lapa.addEventListener("load", actualizar);
  });
}

if (!conCss && !sinMovimiento) {
  document.querySelectorAll<HTMLElement>("[data-lapa-scroll]").forEach((recuadro) => {
    const lapa = recuadro.querySelector<HTMLElement>("[data-lapa]");
    if (!lapa) return;

    lapa.style.left = "0";
    lapa.style.translate = "none";

    const PUNTOS = 16;
    const punto = (i: number) => {
      const t = i / PUNTOS;
      const altura = 0.5 - 0.5 * Math.cos(3 * Math.PI * t);
      // De derecha a izquierda, con la imagen volteada
      return {
        x: () => recuadro.offsetWidth * (1 - t),
        xPercent: -100 * t,
        y: () => lapa.offsetHeight * 0.05 - medirSubida(recuadro, lapa) * altura,
        rotate: 16 * Math.sin(3 * Math.PI * t),
        scaleX: -1,
      };
    };
    const vuelo = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: recuadro,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
        invalidateOnRefresh: true,
      },
    });
    gsap.set(lapa, punto(0));
    for (let i = 1; i <= PUNTOS; i++) vuelo.to(lapa, { ...punto(i), duration: 1 });

    recuadro.querySelectorAll<Element>(".nube-capa, .selva-capa").forEach((capa) => {
      const estilo = getComputedStyle(capa);
      const dx = parseFloat(estilo.getPropertyValue("--nube-x"));
      const dy = parseFloat(estilo.getPropertyValue("--nube-y"));
      gsap.fromTo(
        capa,
        { x: dx * -0.5, y: -dy },
        {
          x: dx * 0.5,
          y: dy,
          ease: "none",
          scrollTrigger: { trigger: recuadro, start: "top bottom", end: "bottom top", scrub: true },
        }
      );
    });
  });
}

// Después de irse por la izquierda, una copia fija de la lapa cruza la sección de biodiversidad de derecha a izquierda
// y se esconde por la izquierda justo antes de que el malecón llegue arriba. Más abajo vuelve a aparecer agarrada
// del borde del segundo malecón con una tira de papel amarrada a la pata, lo trae desde la derecha y, cuando termina
// de entrar, la tira se despega y la lapa se va volando.
if (!sinMovimiento) {
  document.querySelectorAll<HTMLElement>("[data-lapa-scroll]").forEach((recuadro) => {
    const lapa = recuadro.querySelector<HTMLElement>("[data-lapa]");
    const viajera = document.querySelector<HTMLElement>("[data-lapa-viajera]");
    const destino = recuadro.dataset.lapaDestino && document.querySelector<HTMLElement>(recuadro.dataset.lapaDestino);
    if (!lapa || !viajera || !destino) return;
    const arrastre = recuadro.dataset.lapaArrastre && document.querySelector<HTMLElement>(recuadro.dataset.lapaArrastre);
    const tira = document.querySelector<HTMLElement>("[data-lapa-tira]");
    const pegada = tira?.querySelector<HTMLElement>("[data-tira-pegada]");

    const entre = (a: number, b: number, t: number) => a + (b - a) * t;

    // Medidas que solo cambian al cambiar el tamaño de pantalla: se leen aquí y no en cada cuadro del scroll,
    // para que mover() solo escriba transform y opacity (lo que el navegador anima sin recalcular el layout).
    // La altura de pantalla sale de un contenedor de 100svh, que no cambia cuando el celular esconde su barra.
    const referencia = destino.querySelector<HTMLElement>("[data-malecon-lienzo]")?.parentElement;
    let vw = 0;
    let vh = 0;
    let ancho = 0;
    let alto = 0;
    let altoTira = 0;
    const medir = () => {
      vw = document.documentElement.clientWidth;
      vh = referencia?.clientHeight || window.innerHeight;
      ancho = lapa.offsetWidth;
      viajera.style.width = `${ancho}px`;
      alto = viajera.offsetHeight;
      altoTira = tira?.offsetHeight ?? 0;
    };

    // Solo se tocan visibility y la cinta pegada cuando cambian, no en cada cuadro
    let viajeraVisible = false;
    let tiraVisible = false;
    let cintaPegada = true;
    const verViajera = (ver: boolean) => {
      if (ver !== viajeraVisible) viajera.style.visibility = (viajeraVisible = ver) ? "visible" : "";
    };
    const verTira = (ver: boolean) => {
      if (tira && ver !== tiraVisible) tira.style.visibility = (tiraVisible = ver) ? "visible" : "";
    };
    const mostrar = (x: number, y: number, giro: number, volteada: boolean, escala = 1, opacidad = 1) => {
      verViajera(true);
      viajera.style.opacity = String(opacidad);
      viajera.style.transform =
        `translate3d(${x - ancho / 2}px, ${y - alto / 2}px, 0) rotate(${giro}deg) ` +
        `scale(${volteada ? -escala : escala}, ${escala})`;
    };

    let cuadro = 0;
    const mover = () => {
      cuadro = 0;
      const fin = recuadro.getBoundingClientRect().bottom;
      const meta = destino.getBoundingClientRect().top;
      const angosta = vw < 768;

      // Biodiversidad: desde que la sección de la lapa casi salió por arriba hasta que el malecón casi llega arriba
      const desde = vh * 0.3;
      const hasta = vh * 0.1;
      if (fin <= desde && meta > hasta) {
        const p = (desde - fin) / (desde - fin + meta - hasta);
        const x = entre(vw + ancho / 2, -ancho / 2, p);
        const y = vh * 0.5 - vh * 0.12 * Math.sin(2 * Math.PI * p);
        // Volteada mira a la izquierda: girar a la derecha le sube el pico cuando va subiendo
        mostrar(x, y, 14 * Math.cos(2 * Math.PI * p), true, angosta ? 0.8 : 1);
        verTira(false);
        return;
      }

      // Segundo malecón: mientras entra desde la derecha (data-entrada-lateral pantallas de scroll) la lapa va delante,
      // jalándolo con una tira de papel que va de su pata al borde de la sección
      if (arrastre && tira) {
        const e = -arrastre.getBoundingClientRect().top / (vh * (Number(arrastre.dataset.entradaLateral) || 1));
        if (e > 0 && e < 1) {
          const escala = angosta ? 0.8 : 0.7;
          // El borde arranca fuera de la pantalla (data-entrada-holgura) para que la lapa entre volando desde la derecha
          const borde = (1 - e) * vw * (1 + (Number(arrastre.dataset.entradaHolgura) || 0));
          const giro = 8 + 4 * Math.sin(6 * Math.PI * e);
          // Al final la tira se despega y la lapa se va hacia arriba a la izquierda
          const k = Math.max(0, (e - 0.85) / 0.15);
          const largo = ancho * escala * 0.45;
          const pataX = borde - largo - k * k * vw * 0.5;
          const pataY = vh * 0.38 + vh * 0.02 * Math.sin(6 * Math.PI * e) - k * vh * 0.18;

          // La pata está en el 53 % del ancho y 75 % del alto de la imagen (sin voltear); se calcula dónde cae
          // el centro de la lapa para que la pata quede en (pataX, pataY) con el giro y el volteo aplicados
          const dx = -escala * 0.035 * ancho;
          const dy = escala * 0.255 * alto;
          const rad = (giro * Math.PI) / 180;
          const x = pataX - (dx * Math.cos(rad) - dy * Math.sin(rad));
          const y = pataY - (dx * Math.sin(rad) + dy * Math.cos(rad));
          mostrar(x, y, giro, true, escala, 1 - k);

          // Pegada: va tensa hasta el borde, un poco más abajo que la pata. Despegada: queda colgando de la pata.
          // El largo no cambia mientras dura el arrastre, así que el ancho de la tira solo se escribe si cambió
          const tramo = `${Math.round(Math.hypot(largo + 10, 12))}px`;
          if (tira.style.width !== tramo) tira.style.width = tramo;
          const tensa = Math.atan2(12, largo + 10);
          const angulo = entre(tensa, (65 * Math.PI) / 180, Math.min(1, k * 2));
          verTira(true);
          tira.style.opacity = String(1 - k);
          tira.style.transform = `translate3d(${pataX}px, ${pataY - altoTira / 2}px, 0) rotate(${angulo}rad)`;
          if (pegada && cintaPegada !== (k === 0)) pegada.style.opacity = (cintaPegada = k === 0) ? "1" : "0";
          return;
        }
      }

      verViajera(false);
      verTira(false);
    };

    const pedir = () => (cuadro ||= requestAnimationFrame(mover));
    const remedir = () => {
      medir();
      pedir();
    };
    window.addEventListener("scroll", pedir, { passive: true });
    window.addEventListener("resize", remedir);
    lapa.addEventListener("load", remedir);
    viajera.addEventListener("load", remedir);
    medir();
    mover();
  });
}
