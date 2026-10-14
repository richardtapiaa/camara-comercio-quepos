"use client";

import * as React from "react";
import contactImage from "../../../../assets/imagenes-svg-formularios/imagen-contacto.svg";

type DatosContacto = {
  nombre: string;
  email: string;
  asunto: string;
  telefono: string;
  mensaje: string;
};

const VACIO: DatosContacto = {
  nombre: "",
  email: "",
  asunto: "",
  telefono: "",
  mensaje: "",
};

const CAMPO =
  "w-full rounded-xl bg-slate-50 px-5 py-3 text-sm text-slate-800 placeholder-slate-400 ring-1 ring-slate-200 transition focus:outline-none focus:ring-2 focus:ring-[#2780c9]";
const ETIQUETA = "grid gap-2 text-sm font-semibold text-slate-700";

interface Props {
  onSubmit?: (datos: DatosContacto) => void | Promise<void>;
}

const FurmulairoContacto = ({ onSubmit }: Props) => {
  const [datos, setDatos] = React.useState<DatosContacto>(VACIO);
  const [error, setError] = React.useState("");
  const [enviado, setEnviado] = React.useState(false);
  const [enviando, setEnviando] = React.useState(false);

  const cambiar =
    (campo: keyof DatosContacto, soloNumeros = false) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const valor = soloNumeros ? e.target.value.replace(/\D/g, "") : e.target.value;
      setDatos((prev) => ({ ...prev, [campo]: valor }));
      setEnviado(false);
    };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { nombre, email, asunto, mensaje } = datos;

    if (!nombre.trim() || !email.trim() || !asunto.trim() || !mensaje.trim()) {
      setError("Por favor complete todos los campos obligatorios (*).");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Por favor ingrese un correo electrónico válido.");
      return;
    }

    setError("");
    setEnviando(true);
    try {
      await onSubmit?.(datos);
      setEnviado(true);
      setDatos(VACIO);
    } catch {
      setError("No se pudo enviar el mensaje. Inténtelo de nuevo.");
    } finally {
      setEnviando(false);
    }
  };

  const limpiar = () => {
    setDatos(VACIO);
    setError("");
    setEnviado(false);
  };

  return (
    <div className="relative grid min-h-[42rem] w-full overflow-hidden bg-white pt-24 lg:pt-28 lg:grid-cols-[0.82fr_1.18fr]">
      <aside className="relative z-10 order-1 min-h-[42rem] overflow-hidden bg-white text-white lg:order-1">
        <svg
          className="pointer-events-none absolute -left-px -top-px h-[calc(100%+2px)] w-[calc(100%+2px)] origin-left scale-x-[1.2]"
          viewBox="0 0 500 800"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            transform="translate(500 0) scale(-1 1)"
            d="M0 0H500V760C465 736 437 738 405 756C370 776 339 792 306 778C273 765 258 731 226 712C194 693 161 695 136 667C108 636 107 608 81 583C55 558 23 554 10 520C0 494 0 460 0 430V0Z"
            fill="#2780c9"
          />
        </svg>
        <div className="relative z-10 flex flex-col items-end p-6 pt-5 text-right sm:p-10 sm:pt-8 lg:p-12 lg:pt-10">
          <img
            src={contactImage.src}
            alt="Personas comunicándose con el equipo de atención"
            className="mb-4 w-full max-w-[24rem] self-start sm:max-w-[28rem] lg:-ml-16"
          />
          <h2 className="-mt-36 text-3xl font-bold uppercase leading-tight sm:text-4xl">Contáctanos</h2>
          <p className="mt-2 text-xl font-semibold">Estamos para ayudarte</p>
          <ul className="mt-4 w-full space-y-2 border-t border-white/30 pt-4 text-sm leading-6 text-white/90 sm:text-base">
            <li className="flex justify-end gap-3">
              <span>Envíanos tus consultas y comentarios.</span>
              <span aria-hidden="true">•</span>
            </li>
            <li className="flex justify-end gap-3">
              <span>Te responderemos lo antes posible.</span>
              <span aria-hidden="true">•</span>
            </li>
            <li className="flex justify-end gap-3">
              <span>Estamos disponibles para atenderte.</span>
              <span aria-hidden="true">•</span>
            </li>
          </ul>
        </div>
      </aside>

      <section className="order-2 flex items-center p-4 sm:p-8 lg:order-2 lg:p-10">
        <div className="mx-auto w-full max-w-5xl rounded-3xl bg-white p-8 shadow-xl ring-1 ring-slate-200 sm:p-12 lg:p-14">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            Estamos para ayudarte
          </p>
          <h1 className="mb-8 mt-3 text-3xl font-bold uppercase leading-tight text-[#2780c9] sm:text-4xl">
            Contáctanos
          </h1>

          <form onSubmit={handleSubmit} noValidate className="grid w-full gap-5 sm:grid-cols-2">
            <label className={ETIQUETA}>
              <span>
                Nombre <span className="text-[#2780c9]">(*)</span>
              </span>
              <input
                name="nombre"
                type="text"
                autoComplete="name"
                value={datos.nombre}
                onChange={cambiar("nombre")}
                className={CAMPO}
              />
            </label>
            <label className={ETIQUETA}>
              <span>
                Email <span className="text-[#2780c9]">(*)</span>
              </span>
              <input
                name="email"
                type="email"
                autoComplete="email"
                value={datos.email}
                onChange={cambiar("email")}
                className={CAMPO}
              />
            </label>
            <label className={ETIQUETA}>
              <span>
                Asunto <span className="text-[#2780c9]">(*)</span>
              </span>
              <input
                name="asunto"
                type="text"
                value={datos.asunto}
                onChange={cambiar("asunto")}
                className={CAMPO}
              />
            </label>
            <label className={ETIQUETA}>
              Teléfono
              <input
                name="telefono"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                value={datos.telefono}
                onChange={cambiar("telefono", true)}
                className={CAMPO}
              />
            </label>
            <label className={`${ETIQUETA} sm:col-span-2`}>
              <span>
                Mensaje <span className="text-[#2780c9]">(*)</span>
              </span>
              <textarea
                name="mensaje"
                rows={7}
                value={datos.mensaje}
                onChange={cambiar("mensaje")}
                className={`${CAMPO} resize-y`}
              />
            </label>

            <div className="flex flex-col gap-3 sm:col-span-2" aria-live="polite">
              {error && <div className="text-left text-sm text-red-500">{error}</div>}
              {enviado && (
                <div className="text-left text-sm font-medium text-[#2780c9]">
                  ¡Gracias! Hemos recibido tu mensaje y pronto nos pondremos en contacto.
                </div>
              )}
            </div>

            <hr className="border-slate-200 sm:col-span-2" />

            <div className="flex flex-wrap gap-3 sm:col-span-2">
              <button
                type="submit"
                disabled={enviando}
                className="rounded-full bg-[#2780c9] px-8 py-3 text-sm font-bold text-white shadow transition hover:-translate-y-0.5 hover:bg-[#1f6eae] disabled:opacity-60"
              >
                {enviando ? "Enviando..." : "Enviar mensaje"}
              </button>
              <button
                type="button"
                onClick={limpiar}
                className="rounded-full border border-slate-300 px-8 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
              >
                Limpiar formulario
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
};

export { FurmulairoContacto };

export default FurmulairoContacto;