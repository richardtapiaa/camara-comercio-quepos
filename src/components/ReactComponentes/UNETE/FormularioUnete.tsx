import { enviarFormulario } from "../../../lib/api";
import VerticalLinearStepper, { type DatosEnvio } from "./unete-stepper";

interface Props {
  onSubmit?: (datos: DatosEnvio) => void | Promise<void>;
}

const enviarAfiliacion = (datos: DatosEnvio) => enviarFormulario("afiliacion", datos);


const FormularioUnete = ({ onSubmit = enviarAfiliacion }: Props) => (
  <div className="w-full">
    <VerticalLinearStepper onSubmit={onSubmit} />
  </div>
);

export { FormularioUnete };
export default FormularioUnete;
