import * as React from "react";
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import StepContent from "@mui/material/StepContent";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

export type DatosContacto = {
  nombre: string;
  email: string;
  asunto: string;
  telefono: string;
  mensaje: string;
};

const VACIO: DatosContacto = { nombre: "", email: "", asunto: "", telefono: "", mensaje: "" };
const CAMPO = "w-full rounded-xl bg-slate-50 px-5 py-3 text-sm text-slate-800 ring-1 ring-slate-200 transition focus:outline-none focus:ring-2 focus:ring-[#2780c9]";
const ETIQUETA = "grid gap-2 text-sm font-semibold text-slate-700";
const steps = ["Datos de contacto", "Motivo de contacto", "Mensaje"];

interface Props {
  onSubmit?: (datos: DatosContacto) => void | Promise<void>;
}

const ContactoStepper = ({ onSubmit }: Props) => {
  const [activeStep, setActiveStep] = React.useState(0);
  const [datos, setDatos] = React.useState(VACIO);
  const [error, setError] = React.useState("");
  const [enviado, setEnviado] = React.useState(false);
  const [enviando, setEnviando] = React.useState(false);

  const cambiar = (campo: keyof DatosContacto, soloNumeros = false) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const valor = soloNumeros ? event.target.value.replace(/\D/g, "") : event.target.value;
      setDatos((prev) => ({ ...prev, [campo]: valor }));
      setError("");
      setEnviado(false);
    };

  const validarPaso = () => {
    if (activeStep === 0 && (!datos.nombre.trim() || !datos.email.trim())) {
      return "Complete su nombre y correo electrónico para continuar.";
    }
    if (activeStep === 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.email)) {
      return "Ingrese un correo electrónico válido.";
    }
    if (activeStep === 1 && !datos.asunto.trim()) {
      return "Ingrese el asunto de su mensaje para continuar.";
    }
    if (activeStep === 2 && !datos.mensaje.trim()) {
      return "Escriba un mensaje para poder enviarlo.";
    }
    return "";
  };

  const avanzar = async () => {
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
    setEnviando(true);
    setError("");
    try {
      await onSubmit?.(datos);
      setDatos(VACIO);
      setEnviado(true);
      setActiveStep(steps.length);
    } catch {
      setError("No se pudo enviar el mensaje. Inténtelo de nuevo.");
    } finally {
      setEnviando(false);
    }
  };

  const retroceder = () => {
    setError("");
    setActiveStep((prev) => prev - 1);
  };

  const reiniciar = () => {
    setActiveStep(0);
    setDatos(VACIO);
    setError("");
    setEnviado(false);
  };

  const campo = (label: string, contenido: React.ReactNode, obligatorio = false) => (
    <label className={ETIQUETA}>
      <span>{label} {obligatorio && <span className="text-[#2780c9]">(*)</span>}</span>
      {contenido}
    </label>
  );

  return (
    <Box sx={{ maxWidth: 760, width: "100%" }}>
      <Stepper activeStep={activeStep} orientation="vertical">
        <Step>
          <StepLabel>{steps[0]}</StepLabel>
          <StepContent>
            <div className="grid gap-5 pb-2 sm:grid-cols-2">
              {campo("Nombre", <input name="nombre" type="text" autoComplete="name" value={datos.nombre} onChange={cambiar("nombre")} className={CAMPO} />, true)}
              {campo("Correo electrónico", <input name="email" type="email" autoComplete="email" value={datos.email} onChange={cambiar("email")} className={CAMPO} />, true)}
              {campo("Teléfono", <input name="telefono" type="tel" inputMode="numeric" autoComplete="tel" value={datos.telefono} onChange={cambiar("telefono", true)} className={CAMPO} />)}
            </div>
            <Controles activeStep={activeStep} avanzar={avanzar} retroceder={retroceder} enviando={enviando} />
          </StepContent>
        </Step>
        <Step>
          <StepLabel>{steps[1]}</StepLabel>
          <StepContent>
            {campo("Asunto", <input name="asunto" type="text" value={datos.asunto} onChange={cambiar("asunto")} className={CAMPO} />, true)}
            <Controles activeStep={activeStep} avanzar={avanzar} retroceder={retroceder} enviando={enviando} />
          </StepContent>
        </Step>
        <Step>
          <StepLabel>{steps[2]}</StepLabel>
          <StepContent>
            {campo("Mensaje", <textarea name="mensaje" rows={7} value={datos.mensaje} onChange={cambiar("mensaje")} className={`${CAMPO} resize-y`} />, true)}
            <Controles activeStep={activeStep} avanzar={avanzar} retroceder={retroceder} enviando={enviando} />
          </StepContent>
        </Step>
      </Stepper>
      {error && <Typography color="error" role="alert" sx={{ mt: 2, fontSize: "0.875rem" }}>{error}</Typography>}
      {enviado && <Typography sx={{ mt: 2, color: "#2780c9", fontSize: "0.875rem" }}>¡Gracias! Hemos recibido tu mensaje y pronto nos pondremos en contacto.</Typography>}
      {activeStep === steps.length && (
        <Paper square elevation={0} sx={{ p: 2 }}>
          <Typography>Tu mensaje fue enviado correctamente.</Typography>
          <Button onClick={reiniciar} sx={{ mt: 1 }}>Enviar otro mensaje</Button>
        </Paper>
      )}
    </Box>
  );
};

interface ControlesProps {
  activeStep: number;
  avanzar: () => void;
  retroceder: () => void;
  enviando: boolean;
}

const Controles = ({ activeStep, avanzar, retroceder, enviando }: ControlesProps) => (
  <Box sx={{ mb: 1 }}>
    <Button variant="contained" onClick={avanzar} sx={{ mt: 1, mr: 1 }} disabled={enviando}>
      {activeStep === steps.length - 1 ? (enviando ? "Enviando..." : "Enviar mensaje") : "Continuar"}
    </Button>
    {activeStep > 0 && <Button onClick={retroceder} sx={{ mt: 1 }} disabled={enviando}>Atrás</Button>}
  </Box>
);

export { ContactoStepper };
export default ContactoStepper;
