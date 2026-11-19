import * as React from "react";
import { ErrorApi, enviarFormulario } from "../../../lib/api";
import OverlayMensajeEnviado from "./OverlayMensajeEnviado";
import AreaTextoAutoajustable from "../../compartidos/AreaTextoAutoajustable";


export type DatosContacto = {
  nombre: string;
  email: string;
  asunto: string;
  mensaje: string;
};

const VACIO: DatosContacto = { nombre: "", email: "", asunto: "", mensaje: "" };
const CAMPO =
  "w-full rounded-lg bg-slate-100 px-4 py-3 text-sm text-slate-900 ring-1 ring-transparent transition focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2780c9] disabled:cursor-not-allowed";
const ETIQUETA = "grid gap-2 text-sm font-medium text-slate-800";
const CAMPO_INVALIDO = "ring-red-500!";

// Tiempo mínimo del "Enviando…": si la API responde muy rápido, el spinner no alcanza a verse y parece un parpadeo
const ESPERA_MINIMA_MS = 900;

type ErroresCampos = Partial<Record<keyof DatosContacto, string>>;

interface Props {
  onSubmit?: (datos: DatosContacto) => void | Promise<void>;
}

const enviarContacto = (datos: DatosContacto & { sitio_web: string }) => enviarFormulario("contacto", datos);
const esperar = (ms: number) => new Promise((resolver) => setTimeout(resolver, ms));

const FurmulairoContacto = ({ onSubmit }: Props) => {
  const [datos, setDatos] = React.useState(VACIO);
  // Honeypot anti-spam: campo oculto que las personas no ven ni llenan; si llega con texto, el servidor lo descarta
  const [sitioWeb, setSitioWeb] = React.useState("");
  const [error, setError] = React.useState("");
  const [erroresCampos, setErroresCampos] = React.useState<ErroresCampos>({});
  const [enviado, setEnviado] = React.useState(false);
  const [enviando, setEnviando] = React.useState(false);
  const botonEnviar = React.useRef<HTMLButtonElement>(null);

  const cerrarConfirmacion = React.useCallback(() => {
    setEnviado(false);
    botonEnviar.current?.focus({ preventScroll: true });
  }, []);

  const cambiar = (campo: keyof DatosContacto) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setDatos((prev) => ({ ...prev, [campo]: event.target.value }));
    setErroresCampos((prev) => ({ ...prev, [campo]: undefined }));
    setError("");
  };

  const validar = (): ErroresCampos => {
    const errores: ErroresCampos = {};
    const nombre = datos.nombre.trim();
    const asunto = datos.asunto.trim();
    const mensaje = datos.mensaje.trim();
    if (!nombre) errores.nombre = "Escriba su nombre.";
    else if (nombre.length < 2) errores.nombre = "El nombre es muy corto.";
    if (!datos.email.trim()) errores.email = "Escriba su correo electrónico.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.email.trim())) errores.email = "Ingrese un correo electrónico válido.";
    if (!asunto) errores.asunto = "Escriba el asunto.";
    else if (asunto.length < 3) errores.asunto = "El asunto es muy corto.";
    if (!mensaje) errores.mensaje = "Escriba su mensaje.";
    else if (mensaje.length < 10) errores.mensaje = "El mensaje es muy corto (mínimo 10 caracteres).";
    else if (mensaje.length > 5000) errores.mensaje = "El mensaje es muy largo (máximo 5000 caracteres).";
    return errores;
  };

  const enviar = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (enviando) return;
    const errores = validar();
    if (Object.keys(errores).length > 0) {
      setErroresCampos(errores);
      setError("Revise los campos marcados.");
      return;
    }
    setEnviando(true);
    setError("");
    setErroresCampos({});
    try {
      await Promise.all([(onSubmit ?? enviarContacto)({ ...datos, sitio_web: sitioWeb }), esperar(ESPERA_MINIMA_MS)]);
      setDatos(VACIO);
      setEnviado(true);
    } catch (e) {
      if (e instanceof ErrorApi) {
        setErroresCampos(e.campos as ErroresCampos);
        setError(e.message);
      } else {
        setError("No se pudo enviar el mensaje. Inténtelo de nuevo.");
      }
    } finally {
      setEnviando(false);
    }
  };

  const propsCampo = (campo: keyof DatosContacto, extra = "") => ({
    className: `${CAMPO} ${erroresCampos[campo] ? CAMPO_INVALIDO : ""} ${extra}`,
    "aria-invalid": Boolean(erroresCampos[campo]),
    "aria-describedby": erroresCampos[campo] ? `error-contacto-${campo}` : undefined,
  });

  return (
    <>
      <form onSubmit={enviar} noValidate aria-busy={enviando} className="w-full">
        <fieldset disabled={enviando} className="flex flex-col gap-5">
          <div className={`flex flex-col gap-5 transition-opacity duration-300 ${enviando ? "opacity-50" : ""}`}>
            <label className={ETIQUETA}>
              Nombre completo
              <input name="nombre" type="text" autoComplete="name" maxLength={100} value={datos.nombre} onChange={cambiar("nombre")} {...propsCampo("nombre")} />
              <ErrorCampo campo="nombre" mensaje={erroresCampos.nombre} />
            </label>
            <label className={ETIQUETA}>
              Correo electrónico
              <input name="email" type="email" autoComplete="email" maxLength={254} value={datos.email} onChange={cambiar("email")} {...propsCampo("email")} />
              <ErrorCampo campo="email" mensaje={erroresCampos.email} />
            </label>
            <label className={ETIQUETA}>
              Asunto
              <input name="asunto" type="text" maxLength={150} value={datos.asunto} onChange={cambiar("asunto")} {...propsCampo("asunto")} />
              <ErrorCampo campo="asunto" mensaje={erroresCampos.asunto} />
            </label>
            <label className={ETIQUETA}>
              Mensaje
              <AreaTextoAutoajustable name="mensaje" rows={5} maxLength={5000} value={datos.mensaje} onChange={cambiar("mensaje")} {...propsCampo("mensaje", "max-h-[60svh] resize-none")} />
              <ErrorCampo campo="mensaje" mensaje={erroresCampos.mensaje} />
            </label>
          </div>

          {/* Honeypot: fuera de la pantalla, sin tabulación y oculto para lectores de pantalla */}
          <div aria-hidden="true" className="fixed -left-[9999px] h-px w-px overflow-hidden">
            <label>
              Sitio web
              <input type="text" name="sitio_web" tabIndex={-1} autoComplete="off" value={sitioWeb} onChange={(e) => setSitioWeb(e.target.value)} />
            </label>
          </div>

          {error && (
            <p role="alert" className="text-sm font-medium text-red-600">
              {error}
            </p>
          )}

          <button
            ref={botonEnviar}
            type="submit"
            className="mt-1 flex h-12 w-full items-center justify-center gap-3 rounded-lg bg-[#2780c9] text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#1d6aa8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2780c9] focus-visible:ring-offset-2 disabled:cursor-wait disabled:hover:bg-[#2780c9]"
          >
            {enviando && (
              <span aria-hidden="true" className="size-5 animate-spin rounded-full border-2 border-white/35 border-t-white motion-reduce:animate-[spin_1.5s_linear_infinite]" />
            )}
            {enviando ? "Enviando…" : "Enviar mensaje"}
          </button>
        </fieldset>
      </form>
      <OverlayMensajeEnviado abierto={enviado} onCerrar={cerrarConfirmacion} />
    </>
  );
};

const ErrorCampo = ({ campo, mensaje }: { campo: keyof DatosContacto; mensaje?: string }) =>
  mensaje ? (
    <span id={`error-contacto-${campo}`} className="text-xs font-medium text-red-600">
      {mensaje}
    </span>
  ) : null;

export { FurmulairoContacto };
export default FurmulairoContacto;
