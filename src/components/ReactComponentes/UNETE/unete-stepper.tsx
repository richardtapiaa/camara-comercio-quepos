import * as React from "react";
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import StepContent from "@mui/material/StepContent";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

export type Datos = {
  nombre: string;
  email: string;
  telefono: string;
  otroTelefono: string;
  empresa: string;
  areaComercial: string;
  tipoEmpresa: string;
  otroTipoEmpresa: string;
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
  otroTipoEmpresa: "",
  ubicacion: "",
  mensaje: "",
};

const CAMPO =
  "w-full rounded-xl bg-slate-50 px-5 py-3 text-sm text-slate-800 placeholder-slate-400 ring-1 ring-slate-200 transition focus:outline-none focus:ring-2 focus:ring-[#2780c9]";
const ETIQUETA = "grid gap-2 text-sm font-semibold text-slate-700";

interface Props {
  onSubmit?: (datos: Datos) => void | Promise<void>;
}

const steps = [
  { label: "Datos de contacto" },
  { label: "Información de la empresa" },
  { label: "Información del negocio" },
];

const VerticalLinearStepper = ({ onSubmit }: Props) => {
  const [activeStep, setActiveStep] = React.useState(0);
  const [datos, setDatos] = React.useState<Datos>(VACIO);
  const [error, setError] = React.useState("");
  const [enviado, setEnviado] = React.useState(false);
  const [enviando, setEnviando] = React.useState(false);
  const previousActiveStepRef = React.useRef(activeStep);
  const continueButtonRef = React.useRef<HTMLButtonElement>(null);
  const backButtonRef = React.useRef<HTMLButtonElement>(null);
  const resetButtonRef = React.useRef<HTMLButtonElement>(null);

  const cambiar =
    (campo: keyof Datos, soloNumeros = false) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const valor = soloNumeros ? event.target.value.replace(/\D/g, "") : event.target.value;
      setDatos((prev) => ({ ...prev, [campo]: valor }));
      setError("");
      setEnviado(false);
    };

  const validarPaso = () => {
    if (activeStep === 0) {
      if (!datos.nombre.trim() || !datos.email.trim() || !datos.telefono) {
        return "Complete nombre, correo y teléfono de contacto para continuar.";
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.email)) {
        return "Ingrese un correo electrónico válido.";
      }
    }

    if (
      activeStep === 1 &&
      (!datos.empresa.trim() ||
        !datos.tipoEmpresa ||
        !datos.ubicacion.trim() ||
        (datos.tipoEmpresa === "otro" && !datos.otroTipoEmpresa.trim()))
    ) {
      return "Complete los campos obligatorios de la empresa para continuar.";
    }

    return "";
  };

  const handleNext = async () => {
    const mensajeError = validarPaso();
    if (mensajeError) {
      setError(mensajeError);
      return;
    }

    if (activeStep < steps.length - 1) {
      setError("");
      setActiveStep((prev) => prev + 1);
      return;
    }

    setError("");
    setEnviando(true);
    try {
      await onSubmit?.(datos);
      setEnviado(true);
      setDatos(VACIO);
      setActiveStep(steps.length);
    } catch {
      setError("No se pudo enviar la solicitud. Inténtelo de nuevo.");
    } finally {
      setEnviando(false);
    }
  };

  const handleBack = () => {
    setError("");
    setActiveStep((prev) => prev - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setDatos(VACIO);
    setError("");
    setEnviado(false);
  };

  React.useEffect(() => {
    const previousActiveStep = previousActiveStepRef.current;
    previousActiveStepRef.current = activeStep;

    if (activeStep === steps.length) {
      resetButtonRef.current?.focus();
    } else if (previousActiveStep < activeStep) {
      continueButtonRef.current?.focus();
    } else if (activeStep === 0) {
      continueButtonRef.current?.focus();
    } else {
      backButtonRef.current?.focus();
    }
  }, [activeStep]);

  const campo = (label: string, contenido: React.ReactNode, obligatorio = false) => (
    <label className={ETIQUETA}>
      <span>
        {label} {obligatorio && <span className="text-[#2780c9]">(*)</span>}
      </span>
      {contenido}
    </label>
  );

  return (
    <Box sx={{ maxWidth: 760, width: "100%" }}>
      <Stepper activeStep={activeStep} orientation="vertical">
        <Step>
          <StepLabel>{steps[0].label}</StepLabel>
          <StepContent>
            <div className="grid gap-5 pb-2 sm:grid-cols-2">
              {campo("Nombre", <input name="nombre" type="text" autoComplete="name" value={datos.nombre} onChange={cambiar("nombre")} className={CAMPO} />, true)}
              {campo("Correo electrónico", <input name="email" type="email" autoComplete="email" value={datos.email} onChange={cambiar("email")} className={CAMPO} />, true)}
              {campo("Teléfono de contacto", <input name="telefono" type="tel" inputMode="numeric" autoComplete="tel" value={datos.telefono} onChange={cambiar("telefono", true)} className={CAMPO} />, true)}
              {campo("Otro teléfono", <input name="otro-telefono" type="tel" inputMode="numeric" autoComplete="tel" value={datos.otroTelefono} onChange={cambiar("otroTelefono", true)} className={CAMPO} />)}
            </div>
            <Controles
              activeStep={activeStep}
              onNext={handleNext}
              onBack={handleBack}
              continueButtonRef={continueButtonRef}
              backButtonRef={backButtonRef}
              enviando={enviando}
            />
          </StepContent>
        </Step>

        <Step>
          <StepLabel>{steps[1].label}</StepLabel>
          <StepContent>
            <div className="grid gap-5 pb-2 sm:grid-cols-2">
              {campo("Nombre de su empresa", <input name="empresa" type="text" autoComplete="organization" value={datos.empresa} onChange={cambiar("empresa")} className={CAMPO} />, true)}
              {campo("Área comercial", <input name="area-comercial" type="text" value={datos.areaComercial} onChange={cambiar("areaComercial")} className={CAMPO} />)}
              {campo(
                "Tipo de empresa",
                <select
                  name="tipo-empresa"
                  value={datos.tipoEmpresa}
                  onChange={(event) => {
                    cambiar("tipoEmpresa")(event);
                    if (event.target.value !== "otro") {
                      setDatos((prev) => ({ ...prev, otroTipoEmpresa: "" }));
                    }
                  }}
                  className={CAMPO}
                >
                  <option value="">Seleccione una opción</option>
                  <option value="pymes">Pymes</option>
                  <option value="mediana">Mediana empresa</option>
                  <option value="grande">Gran empresa</option>
                  <option value="otro">Otro</option>
                </select>,
                true,
              )}
              <div
                className={`overflow-hidden transition-[max-height,opacity,transform] duration-300 ease-out ${
                  datos.tipoEmpresa === "otro"
                    ? "max-h-24 translate-y-0 opacity-100"
                    : "pointer-events-none max-h-0 -translate-y-2 opacity-0"
                }`}
                aria-hidden={datos.tipoEmpresa !== "otro"}
              >
                {campo(
                  "Especifique el tipo de empresa",
                  <input
                    name="otro-tipo-empresa"
                    type="text"
                    value={datos.otroTipoEmpresa}
                    onChange={cambiar("otroTipoEmpresa")}
                    className={CAMPO}
                    disabled={datos.tipoEmpresa !== "otro"}
                  />,
                  true,
                )}
              </div>
              {campo("Ubicación del negocio", <input name="ubicacion" type="text" autoComplete="address-level2" value={datos.ubicacion} onChange={cambiar("ubicacion")} className={CAMPO} />, true)}
            </div>
            <Controles
              activeStep={activeStep}
              onNext={handleNext}
              onBack={handleBack}
              continueButtonRef={continueButtonRef}
              backButtonRef={backButtonRef}
              enviando={enviando}
            />
          </StepContent>
        </Step>

        <Step>
          <StepLabel>{steps[2].label}</StepLabel>
          <StepContent>
            {campo("Mensaje sobre su negocio", <textarea name="mensaje" rows={6} value={datos.mensaje} onChange={cambiar("mensaje")} className={`${CAMPO} resize-y`} />)}
            <Controles
              activeStep={activeStep}
              onNext={handleNext}
              onBack={handleBack}
              continueButtonRef={continueButtonRef}
              backButtonRef={backButtonRef}
              enviando={enviando}
            />
          </StepContent>
        </Step>
      </Stepper>

      {error && <Typography color="error" role="alert" sx={{ mt: 2, fontSize: "0.875rem" }}>{error}</Typography>}
      {enviado && <Typography sx={{ mt: 2, color: "#2780c9", fontSize: "0.875rem" }}>¡Gracias! Hemos recibido su solicitud y pronto nos pondremos en contacto.</Typography>}
      {activeStep === steps.length && (
        <Paper square elevation={0} sx={{ p: 2 }}>
          <Typography>Todos los pasos fueron completados.</Typography>
          <Button onClick={handleReset} sx={{ mt: 1 }} ref={resetButtonRef}>Llenar de nuevo</Button>
        </Paper>
      )}
    </Box>
  );
};

interface ControlesProps {
  activeStep: number;
  onNext: () => void;
  onBack: () => void;
  continueButtonRef: React.RefObject<HTMLButtonElement | null>;
  backButtonRef: React.RefObject<HTMLButtonElement | null>;
  enviando: boolean;
}

const Controles = ({ activeStep, onNext, onBack, continueButtonRef, backButtonRef, enviando }: ControlesProps) => (
  <Box sx={{ mb: 1 }}>
    <Button variant="contained" onClick={onNext} sx={{ mt: 1, mr: 1 }} ref={continueButtonRef} disabled={enviando}>
      {activeStep === steps.length - 1 ? (enviando ? "Enviando..." : "Enviar solicitud") : "Continuar"}
    </Button>
    {activeStep > 0 && <Button onClick={onBack} sx={{ mt: 1 }} ref={backButtonRef} disabled={enviando}>Atrás</Button>}
  </Box>
);

export { VerticalLinearStepper };
export default VerticalLinearStepper;
