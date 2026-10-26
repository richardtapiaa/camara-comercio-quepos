import * as React from "react";
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import StepContent from "@mui/material/StepContent";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

type Formulario = {
  nombre: string; apellido: string; cedula: string; direccion: string; telefono: string; email: string;
  profesion: string; otraProfesion: string; estudios: string[]; cursosEstudios: string; carnetManipulacion: string;
  licencia: string; tipoLicencia: string; zafarrancho: string; otrosCursos: string;
  cursosAdicionales: string; experiencia: string; lugarExperiencia: string; cv: File | null;
};

const VACIO: Formulario = {
  nombre: "", apellido: "", cedula: "", direccion: "", telefono: "", email: "", profesion: "",
  otraProfesion: "", estudios: [], cursosEstudios: "", carnetManipulacion: "", licencia: "", tipoLicencia: "",
  zafarrancho: "", otrosCursos: "", cursosAdicionales: "", experiencia: "", lugarExperiencia: "", cv: null,
};

const CAMPO = "w-full rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-800 ring-1 ring-slate-200 outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-[#2780c9]";
const ETIQUETA = "grid self-start content-start gap-2 text-sm font-semibold text-slate-700";
const OBLIGATORIO = <span className="text-[#2780c9]">(*)</span>;
const pasos = ["Datos personales", "Estudios y experiencia", "Documentos y envío"];

const BolsaStepper = () => {
  const [activeStep, setActiveStep] = React.useState(0);
  const [datos, setDatos] = React.useState<Formulario>(VACIO);
  const [error, setError] = React.useState("");
  const [enviado, setEnviado] = React.useState(false);

  const cambiar = (campo: keyof Formulario) =>
    (evento: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setDatos((anterior) => ({ ...anterior, [campo]: evento.target.value }));
      setError("");
      setEnviado(false);
    };

  const cambiarEstudios = (evento: React.ChangeEvent<HTMLSelectElement>) => {
    setDatos((anterior) => ({ ...anterior, estudios: Array.from(evento.target.selectedOptions, (opcion) => opcion.value) }));
    setError("");
  };

  const cambiarArchivo = (evento: React.ChangeEvent<HTMLInputElement>) => {
    setDatos((anterior) => ({ ...anterior, cv: evento.target.files?.[0] ?? null }));
    setError("");
  };

  const validarPaso = () => {
    if (activeStep === 0) {
      const requeridos = [datos.nombre, datos.apellido, datos.cedula, datos.direccion, datos.telefono, datos.email, datos.profesion];
      if (requeridos.some((valor) => !valor.trim()) || (datos.profesion === "otro" && !datos.otraProfesion.trim())) return "Complete todos los campos obligatorios de sus datos personales.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.email)) return "Por favor ingrese un correo electrónico válido.";
    }
    if (activeStep === 1) {
      if (datos.estudios.length === 0 || !datos.carnetManipulacion || !datos.licencia || !datos.zafarrancho || !datos.otrosCursos || !datos.experiencia) return "Complete todos los campos obligatorios de estudios y experiencia.";
      if (datos.estudios.includes("ina") && !datos.cursosEstudios.trim()) return "Indique cuáles cursos realizó en el INA.";
      if (datos.licencia === "si" && !datos.tipoLicencia.trim()) return "Indique qué tipo de licencia tiene.";
      if (datos.otrosCursos === "si" && !datos.cursosAdicionales.trim()) return "Indique cuáles cursos adicionales realizó.";
      if (datos.experiencia === "si" && !datos.lugarExperiencia.trim()) return "Indique dónde tiene experiencia.";
    }
    return "";
  };

  const avanzar = () => {
    const mensajeError = validarPaso();
    if (mensajeError) {
      setError(mensajeError);
      return;
    }
    if (activeStep < pasos.length - 1) {
      setError("");
      setActiveStep((prev) => prev + 1);
      return;
    }
    setError("");
    setEnviado(true);
    setDatos(VACIO);
    setActiveStep(pasos.length);
  };

  const reiniciar = () => {
    setDatos(VACIO);
    setError("");
    setEnviado(false);
    setActiveStep(0);
  };

  const campo = (label: string, contenido: React.ReactNode, obligatorio = false) => (
    <label className={ETIQUETA}>
      <span>{label} {obligatorio && OBLIGATORIO}</span>
      {contenido}
    </label>
  );

  const opcional = (visible: boolean, contenido: React.ReactNode) => (
    <div
      className={`overflow-hidden transition-[max-height,opacity,transform,margin,padding] duration-300 ease-out ${visible ? "my-2 max-h-32 translate-y-0 py-2 opacity-100" : "pointer-events-none my-0 max-h-0 -translate-y-2 py-0 opacity-0"}`}
      aria-hidden={!visible}
    >
      {contenido}
    </div>
  );

  const volver = () => {
    setError("");
    setActiveStep((prev) => prev - 1);
  };

  return (
    <Box sx={{ maxWidth: 820, width: "100%" }}>
      <Stepper activeStep={activeStep} orientation="vertical">
        <Step>
          <StepLabel>{pasos[0]}</StepLabel>
          <StepContent>
            <div className="grid items-start gap-5 pb-3 sm:grid-cols-2">
              {campo("Nombre", <input type="text" value={datos.nombre} onChange={cambiar("nombre")} className={CAMPO} />, true)}
              {campo("Apellido", <input type="text" value={datos.apellido} onChange={cambiar("apellido")} className={CAMPO} />, true)}
              {campo("Cédula", <input type="text" inputMode="numeric" value={datos.cedula} onChange={cambiar("cedula")} className={CAMPO} />, true)}
              {campo("Teléfono", <input type="tel" inputMode="numeric" value={datos.telefono} onChange={cambiar("telefono")} className={CAMPO} />, true)}
              {campo("Email", <input type="email" autoComplete="email" value={datos.email} onChange={cambiar("email")} className={CAMPO} />, true)}
              <div className="sm:col-span-2">{campo("Dirección", <textarea rows={3} value={datos.direccion} onChange={cambiar("direccion")} className={`${CAMPO} resize-y`} />, true)}</div>
              <div className="sm:col-span-2">
                {campo("Profesión", <select value={datos.profesion} onChange={(evento) => {
                  cambiar("profesion")(evento);
                  if (evento.target.value !== "otro") setDatos((anterior) => ({ ...anterior, otraProfesion: "" }));
                }} className={CAMPO}><option value="">Seleccione una profesión</option><option value="salonero">Salonero</option><option value="cocinero">Cocinero(a)</option><option value="recepcionista">Recepcionista</option><option value="administracion">Administración</option><option value="otro">Otra</option></select>, true)}
                {opcional(datos.profesion === "otro", campo("¿Cuál profesión?", <input type="text" value={datos.otraProfesion} onChange={cambiar("otraProfesion")} className={CAMPO} disabled={datos.profesion !== "otro"} />, true))}
              </div>
            </div>
            <Controles activeStep={activeStep} avanzar={avanzar} retroceder={volver} />
          </StepContent>
        </Step>
        <Step>
          <StepLabel>{pasos[1]}</StepLabel>
          <StepContent>
            <div className="grid items-start gap-5 pb-3 sm:grid-cols-2">
              <div className="sm:col-span-2">{campo("Estudios ", <select multiple value={datos.estudios} onChange={cambiarEstudios} className={`${CAMPO} min-h-28`}>{["primaria", "noveno", "bachiller", "universidad", "ina"].map((valor) => <option key={valor} value={valor}>{valor === "ina" ? "INA" : valor[0].toUpperCase() + valor.slice(1)}</option>)}</select>, true)}</div>
              <div className="sm:col-span-2">{opcional(datos.estudios.includes("ina"), campo("¿Cuáles cursos del INA?", <input type="text" value={datos.cursosEstudios} onChange={cambiar("cursosEstudios")} className={CAMPO} disabled={!datos.estudios.includes("ina")} />, true))}</div>
              {campo("Carnet de Manipulación", <Opciones nombre="carnetManipulacion" valor={datos.carnetManipulacion} cambiar={cambiar("carnetManipulacion")} />, true)}
              <div className="self-start">{campo("Licencia", <Opciones nombre="licencia" valor={datos.licencia} cambiar={cambiar("licencia")} />, true)}{opcional(datos.licencia === "si", campo("¿Qué tipo?", <input type="text" value={datos.tipoLicencia} onChange={cambiar("tipoLicencia")} className={CAMPO} disabled={datos.licencia !== "si"} />, true))}</div>
              {campo("Zafarrancho", <Opciones nombre="zafarrancho" valor={datos.zafarrancho} cambiar={cambiar("zafarrancho")} />, true)}
              <div className="self-start">{campo("Otros cursos", <Opciones nombre="otrosCursos" valor={datos.otrosCursos} cambiar={cambiar("otrosCursos")} />, true)}{opcional(datos.otrosCursos === "si", campo("¿Cuáles cursos?", <input type="text" value={datos.cursosAdicionales} onChange={cambiar("cursosAdicionales")} className={CAMPO} disabled={datos.otrosCursos !== "si"} />, true))}</div>
              <div className="self-start">{campo("Experiencia", <Opciones nombre="experiencia" valor={datos.experiencia} cambiar={cambiar("experiencia")} />, true)}{opcional(datos.experiencia === "si", campo("¿Dónde?", <input type="text" value={datos.lugarExperiencia} onChange={cambiar("lugarExperiencia")} className={CAMPO} disabled={datos.experiencia !== "si"} />, true))}</div>
            </div>
            <Controles activeStep={activeStep} avanzar={avanzar} retroceder={volver} />
          </StepContent>
        </Step>
        <Step>
          <StepLabel>{pasos[2]}</StepLabel>
          <StepContent>
            <div className="grid gap-5 pb-2">
              {campo("Adjuntar CV", <input type="file" onChange={cambiarArchivo} className="w-full rounded-xl bg-slate-50 py-2 text-sm text-slate-700 ring-1 ring-slate-200 file:mr-2 file:rounded-lg file:border-0 file:bg-[#2780c9] file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white" />)}
            </div>
            <Controles activeStep={activeStep} avanzar={avanzar} retroceder={volver} />
          </StepContent>
        </Step>
      </Stepper>
      {error && <Typography color="error" role="alert" sx={{ mt: 2, fontSize: "0.875rem" }}>{error}</Typography>}
      {enviado && <Typography sx={{ mt: 2, color: "#2780c9", fontSize: "0.875rem" }}>¡Gracias! Hemos recibido su información.</Typography>}
      {activeStep === pasos.length && <Paper square elevation={0} sx={{ p: 2 }}><Typography>Su información fue enviada correctamente.</Typography><Button onClick={reiniciar} sx={{ mt: 1 }}>Enviar otra solicitud</Button></Paper>}
    </Box>
  );
};

type OpcionesProps = { nombre: string; valor: string; cambiar: (evento: React.ChangeEvent<HTMLInputElement>) => void };
const Opciones = ({ nombre, valor, cambiar }: OpcionesProps) => (
  <div className="flex items-center gap-4 py-2 text-sm">
    <label className="inline-flex items-center gap-1"><input type="radio" name={nombre} value="si" checked={valor === "si"} onChange={cambiar} className="accent-[#2780c9]" /> Sí</label>
    <label className="inline-flex items-center gap-1"><input type="radio" name={nombre} value="no" checked={valor === "no"} onChange={cambiar} className="accent-[#2780c9]" /> No</label>
  </div>
);

interface ControlesProps { activeStep: number; avanzar: () => void; retroceder: () => void; }
const Controles = ({ activeStep, avanzar, retroceder }: ControlesProps) => (
  <Box sx={{ mb: 1 }}>
    <Button variant="contained" onClick={avanzar} sx={{ mt: 1, mr: 1 }}>{activeStep === pasos.length - 1 ? "Enviar solicitud" : "Continuar"}</Button>
    {activeStep > 0 && <Button onClick={retroceder} sx={{ mt: 1 }}>Atrás</Button>}
  </Box>
);

export default BolsaStepper;
