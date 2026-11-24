import * as React from "react";
import { createPortal } from "react-dom";
import FondoSello from "../../compartidos/FondoSello";
import AnimacionCorreoEnviado, { type CargadorAnimacion } from "./AnimacionCorreoEnviado";

interface Props {
  abierto: boolean;
  onCerrar: () => void;
  titulo?: string;
  texto?: string;
  cargarAnimacion?: CargadorAnimacion;
}

const bloquearScroll = (bloquear: boolean) => {
  document.documentElement.style.overflow = bloquear ? "hidden" : "";
  if (bloquear) window.lenis?.stop();
  else window.lenis?.start();
};

const OverlayMensajeEnviado = ({
  abierto,
  onCerrar,
  titulo = "¡Mensaje enviado con éxito!",
  texto = "Gracias por escribirnos. Hemos recibido su mensaje y pronto nos pondremos en contacto.",
  cargarAnimacion,
}: Props) => {
  const [montado, setMontado] = React.useState(false);
  const [haAbierto, setHaAbierto] = React.useState(false);
  const [desplegado, setDesplegado] = React.useState(false);
  const botonCerrar = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => setMontado(true), []);

  React.useEffect(() => {
    if (!abierto) {
      setDesplegado(false);
      return;
    }
    setHaAbierto(true);
    bloquearScroll(true);
    botonCerrar.current?.focus({ preventScroll: true });
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setDesplegado(true);

    const alTeclear = (e: KeyboardEvent) => e.key === "Escape" && onCerrar();
    document.addEventListener("keydown", alTeclear);
    return () => {
      document.removeEventListener("keydown", alTeclear);
      bloquearScroll(false);
    };
  }, [abierto, onCerrar]);

  if (!montado) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-mensaje-enviado"
      aria-hidden={!abierto}
      inert={!abierto}
      onTransitionEnd={(e) => {
        if (e.target === e.currentTarget && e.propertyName === "height" && abierto) setDesplegado(true);
      }}
      className={`fixed inset-x-0 top-0 z-[60] overflow-hidden bg-white shadow-[0_20px_60px_-20px_rgb(15_23_42/0.35)] transition-[height] duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] motion-reduce:transition-none ${
        abierto ? "h-dvh" : "h-0"
      }`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-dvh">
        <FondoSello lado="derecha" abajo fijo={false} opacidad={0.3} />
      </div>

      <button
        type="button"
        onClick={onCerrar}
        aria-label="Cerrar"
        className="absolute right-4 top-4 grid size-11 place-items-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2780c9] sm:right-8 sm:top-8"
      >
        <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      </button>

      <div
        className={`flex h-dvh flex-col items-center justify-center px-6 text-center transition-opacity duration-300 motion-reduce:transition-none ${
          desplegado ? "opacity-100" : "opacity-0"
        }`}
      >
        {haAbierto && <AnimacionCorreoEnviado reproducir={desplegado} cargarAnimacion={cargarAnimacion} className="size-64 sm:size-80" />}
        <h2 id="titulo-mensaje-enviado" className="text-2xl font-bold text-slate-950 sm:text-3xl">
          {titulo}
        </h2>
        <p className="mt-3 max-w-md text-base leading-relaxed text-slate-600">
          {texto}
        </p>
        <button
          ref={botonCerrar}
          type="button"
          onClick={onCerrar}
          className="mt-8 flex h-12 items-center justify-center rounded-lg bg-[#2780c9] px-10 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#1d6aa8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2780c9] focus-visible:ring-offset-2"
        >
          Aceptar
        </button>
      </div>
    </div>,
    document.body,
  );
};

export default OverlayMensajeEnviado;
