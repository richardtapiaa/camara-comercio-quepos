"use client";

import * as React from "react";
import logo from "../../../assets/imagenes/logo-camara.webp";

type Datos = {
  nombre: string;
  email: string;
  telefono: string;
  otroTelefono: string;
  empresa: string;
  areaComercial: string;
  tipoEmpresa: string;
  ubicacion: string;
  mensaje: string;
};

const VACIO: Datos = {
  nombre: "",
  email: "",
  telefono: "",
  otroTelefono: "",
  empresa: "",
  areaComercial: "",
  tipoEmpresa: "",
  ubicacion: "",
  mensaje: "",
};

const CAMPO =
  "w-full rounded-xl bg-slate-100 px-5 py-3 text-sm text-slate-800 placeholder-slate-400 ring-1 ring-slate-200 transition focus:outline-none focus:ring-2 focus:ring-[#2780c9]";
const ETIQUETA = "grid gap-2 text-sm font-semibold text-slate-700";

interface Props {
  // Recibe los datos validados; si no se pasa, solo se muestra la confirmación en pantalla
  onSubmit?: (datos: Datos) => void | Promise<void>;
}

const FormularioUnete = ({ onSubmit }: Props) => {
  const [datos, setDatos] = React.useState<Datos>(VACIO);
  const [error, setError] = React.useState("");
  const [enviado, setEnviado] = React.useState(false);
  const [enviando, setEnviando] = React.useState(false);

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const cambiar =
    (campo: keyof Datos, soloNumeros = false) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const valor = soloNumeros ? e.target.value.replace(/\D/g, "") : e.target.value;
      setDatos((prev) => ({ ...prev, [campo]: valor }));
      setEnviado(false);
    };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { nombre, email, telefono, empresa, tipoEmpresa, ubicacion } = datos;

    if (!nombre.trim() || !email.trim() || !telefono || !empresa.trim() || !tipoEmpresa || !ubicacion.trim()) {
      setError("Por favor complete todos los campos obligatorios (*).");
      return;
    }
    if (!validateEmail(email)) {
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
      setError("No se pudo enviar la solicitud. Inténtelo de nuevo.");
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
    <div className="relative flex w-full flex-col items-center justify-center overflow-hidden bg-white px-6 py-16 sm:py-24">
      {/* Tarjeta centrada */}
      <div className="relative z-10 flex w-full max-w-3xl flex-col items-center rounded-3xl bg-white p-8 shadow-2xl ring-1 ring-slate-200 sm:p-12">
        {/* Logo */}
        <img src={logo.src} alt="Cámara de Comercio, Industria y Turismo de Quepos" className="mb-6 h-24 w-auto" />

        {/* Título */}
        <p className="text-center text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
          Cámara de Comercio de Quepos
        </p>
        <h2 className="mb-8 mt-3 text-center text-3xl font-bold uppercase leading-tight text-[#2780c9] sm:text-4xl">
          Únete, no esperes más
        </h2>

        {/* Formulario */}
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
              Teléfono de contacto <span className="text-[#2780c9]">(*)</span>
            </span>
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
          <label className={ETIQUETA}>
            Otro número de contacto
            <input
              name="otro-telefono"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              value={datos.otroTelefono}
              onChange={cambiar("otroTelefono", true)}
              className={CAMPO}
            />
          </label>
          <label className={ETIQUETA}>
            <span>
              Nombre de su empresa <span className="text-[#2780c9]">(*)</span>
            </span>
            <input
              name="empresa"
              type="text"
              autoComplete="organization"
              value={datos.empresa}
              onChange={cambiar("empresa")}
              className={CAMPO}
            />
          </label>
          <label className={ETIQUETA}>
            Área comercial
            <input
              name="area-comercial"
              type="text"
              value={datos.areaComercial}
              onChange={cambiar("areaComercial")}
              className={CAMPO}
            />
          </label>
          <label className={ETIQUETA}>
            <span>
              Tipo de empresa <span className="text-[#2780c9]">(*)</span>
            </span>
            <select
              name="tipo-empresa"
              value={datos.tipoEmpresa}
              onChange={cambiar("tipoEmpresa")}
              className={CAMPO}
            >
              <option value="">Seleccione una opción</option>
              <option value="pymes">Pymes</option>
              <option value="mediana">Mediana empresa</option>
              <option value="grande">Gran empresa</option>
              <option value="otro">Otro</option>
            </select>
          </label>
          <label className={ETIQUETA}>
            <span>
              Ubicación del negocio <span className="text-[#2780c9]">(*)</span>
            </span>
            <input
              name="ubicacion"
              type="text"
              autoComplete="address-level2"
              value={datos.ubicacion}
              onChange={cambiar("ubicacion")}
              className={CAMPO}
            />
          </label>
          <label className={`${ETIQUETA} sm:col-span-2`}>
            Cuéntenos sobre su negocio
            <textarea
              name="mensaje"
              rows={5}
              value={datos.mensaje}
              onChange={cambiar("mensaje")}
              className={`${CAMPO} resize-y`}
            />
          </label>

          <div className="flex flex-col gap-3 sm:col-span-2" aria-live="polite">
            {error && <div className="text-left text-sm text-red-500">{error}</div>}
            {enviado && (
              <div className="text-left text-sm font-medium text-emerald-600">
                ¡Gracias! Hemos recibido su solicitud y pronto nos pondremos en contacto.
              </div>
            )}
          </div>

          <hr className="border-slate-200 sm:col-span-2" />

          <div className="flex flex-wrap gap-3 sm:col-span-2">
            <button
              type="submit"
              disabled={enviando}
              className="rounded-full bg-[#f43f62] px-8 py-3 text-sm font-bold text-white shadow transition hover:-translate-y-0.5 hover:bg-[#d93455] disabled:opacity-60"
            >
              {enviando ? "Enviando..." : "Enviar solicitud"}
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
    </div>
  );
};

export { FormularioUnete };

export default FormularioUnete;
