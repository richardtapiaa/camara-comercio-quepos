import * as React from "react";
import type { AnimationItem } from "lottie-web";

export type CargadorAnimacion = () => Promise<{ default: unknown }>;

const cargarCorreoEnviado: CargadorAnimacion = () => import("../../../assets/contacto/email-send.json");

interface Props {
  reproducir: boolean;
  className?: string;
  cargarAnimacion?: CargadorAnimacion;
}

const reducirMovimiento = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const AnimacionCorreoEnviado = ({ reproducir, className = "", cargarAnimacion = cargarCorreoEnviado }: Props) => {
  const contenedor = React.useRef<HTMLDivElement>(null);
  const animacion = React.useRef<AnimationItem | null>(null);
  const cargada = React.useRef(false);
  const debeReproducir = React.useRef(reproducir);

  const mostrar = React.useCallback(() => {
    const anim = animacion.current;
    if (!anim || !cargada.current || !debeReproducir.current) return;
    if (reducirMovimiento()) anim.goToAndStop(anim.totalFrames - 1, true);
    else anim.goToAndPlay(0, true);
  }, []);

  React.useEffect(() => {
    let cancelado = false;

    Promise.all([import("lottie-web/build/player/lottie_light"), cargarAnimacion()]).then(
      ([{ default: lottie }, { default: datos }]) => {
        if (cancelado || !contenedor.current) return;
        const anim = lottie.loadAnimation({
          container: contenedor.current,
          renderer: "svg",
          loop: true,
          autoplay: false,
          animationData: datos,
        });
        animacion.current = anim;
        anim.addEventListener("DOMLoaded", () => {
          cargada.current = true;
          mostrar();
        });
      },
    );

    return () => {
      cancelado = true;
      animacion.current?.destroy();
      animacion.current = null;
      cargada.current = false;
    };
  }, [mostrar, cargarAnimacion]);

  React.useEffect(() => {
    debeReproducir.current = reproducir;
    if (reproducir) mostrar();
  }, [reproducir, mostrar]);

  return <div ref={contenedor} aria-hidden="true" className={className} />;
};

export default AnimacionCorreoEnviado;
