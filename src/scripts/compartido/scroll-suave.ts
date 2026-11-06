import Lenis from "lenis";
import "lenis/dist/lenis.css";

declare global {
  interface Window {
    lenis?: Lenis;
  }
}

if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  window.lenis = new Lenis({ autoRaf: true, anchors: true, lerp: 0.1 });
}
