import * as React from "react";
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import StepContent from "@mui/material/StepContent";
import { ErrorApi } from "../../../lib/api";
import OverlayMensajeEnviado from "../CONTACTO/OverlayMensajeEnviado";
import type { CargadorAnimacion } from "../CONTACTO/AnimacionCorreoEnviado";
import AreaTextoAutoajustable from "../../compartidos/AreaTextoAutoajustable";

// Formulario de afiliación por pasos (Stepper de MUI) con el mismo diseño que el formulario de contacto
// (CONTACTO/furmulariocontacto.tsx): campos grises redondeados, error debajo de cada campo, botón con "Enviando…"
// y la pantalla completa de confirmación al terminar.

export type Datos = {
  nombre: string;
  email: string;
  telefono: string;
  otro_telefono: string;
  empresa: string;
  area_comercial: string;
  tipo_empresa: string;
  otro_tipo_empresa: string;
  ubicacion: string;
  mensaje: string;
};

export type DatosEnvio = Datos & { sitio_web: string };

const VACIO: Datos = {
  nombre: "",
  email: "",
  telefono: "",
  otro_telefono: "",
  empresa: "",
  area_comercial: "",
  tipo_empresa: "",
  otro_tipo_empresa: "",
  ubicacion: "",
  mensaje: "",
};

const CAMPO =
  "w-full rounded-lg bg-slate-100 px-4 py-3 text-sm text-slate-900 ring-1 ring-transparent transition focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2780c9] disabled:cursor-not-allowed";
const ETIQUETA = "grid gap-2 text-sm font-medium text-slate-800";
const CAMPO_INVALIDO = "ring-red-500!";
const ESPERA_MINIMA_MS = 900;
const CAMPOS_NUMERICOS: (keyof Datos)[] = ["telefono", "otro_telefono"];

const PASOS: { titulo: string; campos: (keyof Datos)[] }[] = [
  { titulo: "Datos de contacto", campos: ["nombre", "email", "telefono", "otro_telefono"] },
  {
    titulo: "Información de la empresa",
    campos: ["empresa", "area_comercial", "tipo_empresa", "otro_tipo_empresa", "ubicacion"],
  },
  { titulo: "Información del negocio", campos: ["mensaje"] },
];

const TIPOS_EMPRESA = [
  { valor: "pymes", texto: "Pymes" },
  { valor: "mediana", texto: "Mediana empresa" },
  { valor: "grande", texto: "Gran empresa" },
  { valor: "otro", texto: "Otro" },
];

type ErroresCampos = Partial<Record<keyof Datos, string>>;

const cargarAnimacionMano: CargadorAnimacion = () => import("../../../assets/unete/hand-animation.json");

const esperar = (ms: number) => new Promise((resolver) => setTimeout(resolver, ms));

const validarTodo = (datos: Datos): ErroresCampos => {
  const errores: ErroresCampos = {};
  const nombre = datos.nombre.trim();
  const email = datos.email.trim();
  const empresa = datos.empresa.trim();
  if (!nombre) errores.nombre = "Escriba su nombre.";
  else if (nombre.length < 2) errores.nombre = "El nombre es muy corto.";
  if (!email) errores.email = "Escriba su correo electrónico.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errores.email = "Ingrese un correo electrónico válido.";
  if (!datos.telefono) errores.telefono = "Escriba un teléfono de contacto.";
  else if (datos.telefono.length < 8) errores.telefono = "El teléfono debe tener al menos 8 dígitos.";
  if (datos.otro_telefono && datos.otro_telefono.length < 8) errores.otro_telefono = "El teléfono debe tener al menos 8 dígitos.";
  if (!empresa) errores.empresa = "Escriba el nombre de su empresa.";
  else if (empresa.length < 2) errores.empresa = "El nombre de la empresa es muy corto.";
  if (!datos.tipo_empresa) errores.tipo_empresa = "Seleccione el tipo de empresa.";
  if (datos.tipo_empresa === "otro" && !datos.otro_tipo_empresa.trim()) errores.otro_tipo_empresa = "Especifique el tipo de empresa.";
  if (!datos.ubicacion.trim()) errores.ubicacion = "Escriba la ubicación del negocio.";
  else if (datos.ubicacion.trim().length < 2) errores.ubicacion = "La ubicación es muy corta.";
  if (datos.mensaje.trim().length > 5000) errores.mensaje = "El mensaje es muy largo (máximo 5000 caracteres).";
  return errores;
};

const erroresDelPaso = (errores: ErroresCampos, paso: number): ErroresCampos =>
  Object.fromEntries(Object.entries(errores).filter(([campo]) => PASOS[paso].campos.includes(campo as keyof Datos)));

const primerPasoConError = (errores: ErroresCampos) =>
  PASOS.findIndex(({ campos }) => campos.some((campo) => errores[campo]));

// Colores de la Cámara en los círculos y líneas del Stepper, y la letra Poppins del sitio
const estiloStepper = {
  "& .MuiStepLabel-label": { fontFamily: "inherit", fontWeight: 600, fontSize: "0.95rem", color: "#64748b" },
  "& .MuiStepLabel-label.Mui-active, & .MuiStepLabel-label.Mui-completed": { color: "#0f172a", fontWeight: 600 },
  "& .MuiStepIcon-root": { color: "#cbd5e1", width: 30, height: 30 },
  "& .MuiStepIcon-root.Mui-active, & .MuiStepIcon-root.Mui-completed": { color: "#2780c9" },
  "& .MuiStepIcon-text": { fontFamily: "inherit", fontWeight: 600 },
  "& .MuiStepConnector-line": { borderColor: "#e2e8f0", minHeight: 16 },
  "& .MuiStepContent-root, & .MuiStepConnector-root": { ml: "15px" },
  "& .MuiStepContent-root": { borderColor: "#e2e8f0", pl: { xs: "18px", sm: "26px" }, pr: 0 },
  "& .MuiStep-root:focus": { outline: "none" },
};

const reducirMovimiento = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Desplaza la página hasta el paso (debajo de la barra de navegación fija) si no se ve completo, y mueve el foco:
// al primer campo con mouse o teclado; en pantallas táctiles, al paso en sí para no abrir el teclado de golpe.
const llevarAlPaso = (paso: HTMLElement | null | undefined) => {
  if (!paso) return;
  const cabecera = document.getElementById("site-header");
  const margen = (cabecera?.offsetHeight ?? 0) + 24;
  const { top, bottom } = paso.getBoundingClientRect();
  if (top < margen || bottom > window.innerHeight) {
    const destino = Math.max(0, window.scrollY + top - margen);
    if (window.lenis) window.lenis.scrollTo(destino, { duration: 0.9, immediate: reducirMovimiento() });
    else window.scrollTo({ top: destino, behavior: reducirMovimiento() ? "auto" : "smooth" });
  }
  const primerCampo = paso.querySelector<HTMLElement>("input:not([disabled]), select, textarea");
  if (primerCampo && window.matchMedia("(pointer: fine)").matches) primerCampo.focus({ preventScroll: true });
  else paso.focus({ preventScroll: true });
};

interface Props {
  onSubmit: (datos: DatosEnvio) => void | Promise<void>;
}

const VerticalLinearStepper = ({ onSubmit }: Props) => {
  const [pasoActivo, setPasoActivo] = React.useState(0);
  const [datos, setDatos] = React.useState<Datos>(VACIO);
  const [sitioWeb, setSitioWeb] = React.useState("");
  const [error, setError] = React.useState("");
  const [erroresCampos, setErroresCampos] = React.useState<ErroresCampos>({});
  const [enviado, setEnviado] = React.useState(false);
  const [enviando, setEnviando] = React.useState(false);
  const pasos = React.useRef<(HTMLDivElement | null)[]>([]);
  const pasoPorMostrar = React.useRef<number | null>(null);
  const volverAlInicio = React.useRef(false);
  const esOtroTipo = datos.tipo_empresa === "otro";

  const irAlPaso = (indice: number) => {
    pasoPorMostrar.current = indice;
    setPasoActivo(indice);
  };

  // Se llama cuando el paso termina de abrirse (y el anterior de cerrarse): recién ahí las alturas son las finales
  const alAbrirPaso = (indice: number) => {
    if (pasoPorMostrar.current !== indice) return;
    pasoPorMostrar.current = null;
    llevarAlPaso(pasos.current[indice]);
  };

  // Al cerrar la confirmación se vuelve al primer paso. Va en un efecto porque corre después de que la pantalla de
  // confirmación libera el scroll de la página.
  React.useEffect(() => {
    if (enviado || !volverAlInicio.current) return;
    volverAlInicio.current = false;
    llevarAlPaso(pasos.current[0]);
  }, [enviado]);

  const cerrarConfirmacion = React.useCallback(() => {
    volverAlInicio.current = true;
    setEnviado(false);
  }, []);

  const cambiar =
    (campo: keyof Datos) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const valor = CAMPOS_NUMERICOS.includes(campo) ? event.target.value.replace(/\D/g, "") : event.target.value;
      setDatos((prev) => ({
        ...prev,
        [campo]: valor,
        ...(campo === "tipo_empresa" && valor !== "otro" ? { otro_tipo_empresa: "" } : {}),
      }));
      setErroresCampos((prev) => ({ ...prev, [campo]: undefined }));
      setError("");
    };

  const enviar = async () => {
    setEnviando(true);
    setError("");
    try {
      await Promise.all([onSubmit({ ...datos, sitio_web: sitioWeb }), esperar(ESPERA_MINIMA_MS)]);
      setDatos(VACIO);
      setPasoActivo(0);
      setEnviado(true);
    } catch (e) {
      if (e instanceof ErrorApi) {
        const errores = e.campos as ErroresCampos;
        setErroresCampos(errores);
        setError(e.message);
        const paso = primerPasoConError(errores);
        if (paso >= 0 && paso !== pasoActivo) irAlPaso(paso);
      } else {
        setError("No se pudo enviar la solicitud. Inténtelo de nuevo.");
      }
    } finally {
      setEnviando(false);
    }
  };

  const continuar = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (enviando) return;
    const errores = erroresDelPaso(validarTodo(datos), pasoActivo);
    if (Object.keys(errores).length > 0) {
      setErroresCampos(errores);
      setError("Revise los campos marcados.");
      return;
    }
    setErroresCampos({});
    setError("");
    if (pasoActivo < PASOS.length - 1) irAlPaso(pasoActivo + 1);
    else void enviar();
  };

  const atras = () => {
    setError("");
    setErroresCampos({});
    irAlPaso(pasoActivo - 1);
  };

  const propsPaso = (indice: number) => ({
    ref: (elemento: HTMLDivElement | null) => {
      pasos.current[indice] = elemento;
    },
    tabIndex: -1,
  });

  const propsContenido = (indice: number) => ({
    slotProps: { transition: { onEntered: () => alAbrirPaso(indice) } },
  });

  const propsCampo = (campo: keyof Datos, extra = "") => ({
    className: `${CAMPO} ${erroresCampos[campo] ? CAMPO_INVALIDO : ""} ${extra}`,
    "aria-invalid": Boolean(erroresCampos[campo]),
    "aria-describedby": erroresCampos[campo] ? `error-unete-${campo}` : undefined,
  });

  const controles = (
    <Controles pasoActivo={pasoActivo} enviando={enviando} error={error} onAtras={atras} />
  );

  return (
    <>
      <form onSubmit={continuar} noValidate aria-busy={enviando} className="w-full">
        <fieldset disabled={enviando}>
          <Box sx={{ width: "100%" }}>
            <Stepper activeStep={pasoActivo} orientation="vertical" sx={estiloStepper}>
              <Step {...propsPaso(0)}>
                <StepLabel>{PASOS[0].titulo}</StepLabel>
                <StepContent {...propsContenido(0)}>
                  <div className={`grid gap-5 pt-3 transition-opacity duration-300 sm:grid-cols-2 ${enviando ? "opacity-50" : ""}`}>
                    <label className={`${ETIQUETA} sm:col-span-2`}>
                      <Etiqueta texto="Nombre completo" obligatorio />
                      <input name="nombre" type="text" autoComplete="name" maxLength={100} value={datos.nombre} onChange={cambiar("nombre")} {...propsCampo("nombre")} />
                      <ErrorCampo campo="nombre" mensaje={erroresCampos.nombre} />
                    </label>
                    <label className={`${ETIQUETA} sm:col-span-2`}>
                      <Etiqueta texto="Correo electrónico" obligatorio />
                      <input name="email" type="email" autoComplete="email" maxLength={254} value={datos.email} onChange={cambiar("email")} {...propsCampo("email")} />
                      <ErrorCampo campo="email" mensaje={erroresCampos.email} />
                    </label>
                    <label className={ETIQUETA}>
                      <Etiqueta texto="Teléfono de contacto" obligatorio />
                      <input name="telefono" type="tel" inputMode="numeric" autoComplete="tel" placeholder="8888 8888" maxLength={15} value={datos.telefono} onChange={cambiar("telefono")} {...propsCampo("telefono")} />
                      <ErrorCampo campo="telefono" mensaje={erroresCampos.telefono} />
                    </label>
                    <label className={ETIQUETA}>
                      <Etiqueta texto="Otro teléfono" />
                      <input name="otro_telefono" type="tel" inputMode="numeric" autoComplete="tel" placeholder="Opcional" maxLength={15} value={datos.otro_telefono} onChange={cambiar("otro_telefono")} {...propsCampo("otro_telefono")} />
                      <ErrorCampo campo="otro_telefono" mensaje={erroresCampos.otro_telefono} />
                    </label>
                  </div>
                  {controles}
                </StepContent>
              </Step>

              <Step {...propsPaso(1)}>
                <StepLabel>{PASOS[1].titulo}</StepLabel>
                <StepContent {...propsContenido(1)}>
                  <div className={`grid gap-5 pt-3 transition-opacity duration-300 sm:grid-cols-2 ${enviando ? "opacity-50" : ""}`}>
                    <label className={ETIQUETA}>
                      <Etiqueta texto="Nombre de su empresa" obligatorio />
                      <input name="empresa" type="text" autoComplete="organization" maxLength={150} value={datos.empresa} onChange={cambiar("empresa")} {...propsCampo("empresa")} />
                      <ErrorCampo campo="empresa" mensaje={erroresCampos.empresa} />
                    </label>
                    <label className={ETIQUETA}>
                      <Etiqueta texto="Área comercial" />
                      <input name="area_comercial" type="text" placeholder="Ej. turismo, comercio, servicios" maxLength={100} value={datos.area_comercial} onChange={cambiar("area_comercial")} {...propsCampo("area_comercial")} />
                      <ErrorCampo campo="area_comercial" mensaje={erroresCampos.area_comercial} />
                    </label>
                    <label className={ETIQUETA}>
                      <Etiqueta texto="Tipo de empresa" obligatorio />
                      <select name="tipo_empresa" value={datos.tipo_empresa} onChange={cambiar("tipo_empresa")} {...propsCampo("tipo_empresa", datos.tipo_empresa ? "" : "text-slate-400")}>
                        <option value="">Seleccione una opción</option>
                        {TIPOS_EMPRESA.map(({ valor, texto }) => (
                          <option key={valor} value={valor} className="text-slate-900">
                            {texto}
                          </option>
                        ))}
                      </select>
                      <ErrorCampo campo="tipo_empresa" mensaje={erroresCampos.tipo_empresa} />
                    </label>
                    <label className={ETIQUETA}>
                      <Etiqueta texto="Ubicación del negocio" obligatorio />
                      <input name="ubicacion" type="text" autoComplete="address-level2" placeholder="Ej. Quepos centro" maxLength={150} value={datos.ubicacion} onChange={cambiar("ubicacion")} {...propsCampo("ubicacion")} />
                      <ErrorCampo campo="ubicacion" mensaje={erroresCampos.ubicacion} />
                    </label>
                    <div
                      aria-hidden={!esOtroTipo}
                      className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none sm:col-span-2 ${
                        esOtroTipo ? "grid-rows-[1fr] opacity-100" : "pointer-events-none -mt-5 grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <label className={ETIQUETA}>
                          <Etiqueta texto="Especifique el tipo de empresa" obligatorio />
                          <input name="otro_tipo_empresa" type="text" maxLength={100} disabled={!esOtroTipo} value={datos.otro_tipo_empresa} onChange={cambiar("otro_tipo_empresa")} {...propsCampo("otro_tipo_empresa")} />
                          <ErrorCampo campo="otro_tipo_empresa" mensaje={erroresCampos.otro_tipo_empresa} />
                        </label>
                      </div>
                    </div>
                  </div>
                  {controles}
                </StepContent>
              </Step>

              <Step {...propsPaso(2)}>
                <StepLabel>{PASOS[2].titulo}</StepLabel>
                <StepContent {...propsContenido(2)}>
                  <div className={`pt-3 transition-opacity duration-300 ${enviando ? "opacity-50" : ""}`}>
                    <label className={ETIQUETA}>
                      <Etiqueta texto="Mensaje sobre su negocio" />
                      <AreaTextoAutoajustable name="mensaje" rows={5} maxLength={5000} placeholder="Cuéntenos brevemente sobre su negocio" value={datos.mensaje} onChange={cambiar("mensaje")} {...propsCampo("mensaje", "max-h-[60svh] resize-none")} />
                      <ErrorCampo campo="mensaje" mensaje={erroresCampos.mensaje} />
                    </label>
                  </div>
                  {controles}
                </StepContent>
              </Step>
            </Stepper>
          </Box>

          <div aria-hidden="true" className="fixed -left-[9999px] h-px w-px overflow-hidden">
            <label>
              Sitio web
              <input type="text" name="sitio_web" tabIndex={-1} autoComplete="off" value={sitioWeb} onChange={(e) => setSitioWeb(e.target.value)} />
            </label>
          </div>
        </fieldset>
      </form>
      <OverlayMensajeEnviado
        abierto={enviado}
        onCerrar={cerrarConfirmacion}
        titulo="¡Solicitud enviada con éxito!"
        cargarAnimacion={cargarAnimacionMano}
        texto="Gracias por su interés en afiliarse. Hemos recibido su solicitud y la Cámara se pondrá en contacto con usted pronto."
      />
    </>
  );
};

interface ControlesProps {
  pasoActivo: number;
  enviando: boolean;
  error: string;
  onAtras: () => void;
}

const Controles = ({ pasoActivo, enviando, error, onAtras }: ControlesProps) => {
  const esUltimo = pasoActivo === PASOS.length - 1;
  return (
    <div className="mt-6 flex flex-col gap-4">
      {error && (
        <p role="alert" className="text-sm font-medium text-red-600">
          {error}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          className="flex h-12 min-w-40 items-center justify-center gap-3 rounded-lg bg-[#2780c9] px-7 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#1d6aa8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2780c9] focus-visible:ring-offset-2 disabled:cursor-wait disabled:hover:bg-[#2780c9]"
        >
          {enviando && (
            <span aria-hidden="true" className="size-5 animate-spin rounded-full border-2 border-white/35 border-t-white motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          )}
          {esUltimo ? (enviando ? "Enviando…" : "Enviar solicitud") : "Continuar"}
        </button>
        {pasoActivo > 0 && (
          <button
            type="button"
            onClick={onAtras}
            className="h-12 rounded-lg px-5 text-sm font-semibold text-[#1d6aa8] transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2780c9] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Atrás
          </button>
        )}
      </div>
    </div>
  );
};

const Etiqueta = ({ texto, obligatorio = false }: { texto: string; obligatorio?: boolean }) => (
  <span>
    {texto}
    {obligatorio && (
      <span aria-hidden="true" className="ml-0.5 text-[#2780c9]">
        *
      </span>
    )}
  </span>
);

const ErrorCampo = ({ campo, mensaje }: { campo: keyof Datos; mensaje?: string }) =>
  mensaje ? (
    <span id={`error-unete-${campo}`} className="text-xs font-medium text-red-600">
      {mensaje}
    </span>
  ) : null;

export { VerticalLinearStepper };
export default VerticalLinearStepper;
