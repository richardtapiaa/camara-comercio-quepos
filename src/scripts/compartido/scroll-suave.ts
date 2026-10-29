import Lenis from "lenis";
import "lenis/dist/lenis.css";

// Scroll suave con Lenis en todo el sitio. Solo suaviza la rueda del mouse y el trackpad: en celulares el dedo sigue
// usando el scroll nativo (syncTouch apagado), que ya es suave y no compite con las animaciones en Android.
// Lenis mueve el scroll real de la página, así que sticky, ScrollTrigger y las animaciones con animation-timeline
// siguen funcionando igual. El mapa de afiliados y los paneles con su propio scroll llevan data-lenis-prevent.
// Con "reducir movimiento" no se activa.
declare global {
  interface Window {
    lenis?: Lenis;
  }
}

if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  window.lenis = new Lenis({ autoRaf: true, anchors: true, lerp: 0.1 });
}
