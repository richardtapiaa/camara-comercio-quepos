import ContactoStepper, { type DatosContacto } from "./contacto-stepper";

interface Props {
  onSubmit?: (datos: DatosContacto) => void | Promise<void>;
}

const FurmulairoContacto = ({ onSubmit }: Props) => (
  <div className="w-full">
    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Estamos para ayudarte</p>
    <h2 className="mb-8 mt-3 text-3xl font-bold uppercase leading-tight text-[#2780c9] sm:text-4xl">Contáctanos</h2>
    <ContactoStepper onSubmit={onSubmit} />
  </div>
);

export { FurmulairoContacto };
export default FurmulairoContacto;
