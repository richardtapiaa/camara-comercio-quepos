import VerticalLinearStepper, { type Datos } from "./unete-stepper";

interface Props {
  onSubmit?: (datos: Datos) => void | Promise<void>;
}

// El título y la frase van en UneteComponentes/FormularioUnete.astro; aquí solo el formulario por pasos.
const FormularioUnete = ({ onSubmit }: Props) => (
  <div className="w-full">
    <VerticalLinearStepper onSubmit={onSubmit} />
  </div>
);

export { FormularioUnete };
export default FormularioUnete;
