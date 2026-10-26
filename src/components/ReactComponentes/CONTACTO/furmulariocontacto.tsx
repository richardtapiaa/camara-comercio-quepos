import ContactoStepper, { type DatosContacto } from "./contacto-stepper";

interface Props {
  onSubmit?: (datos: DatosContacto) => void | Promise<void>;
}

const FurmulairoContacto = ({ onSubmit }: Props) => (
  <section className="order-2 flex items-center p-4 sm:p-8 lg:order-2 lg:p-10">
    <div className="mx-auto w-full max-w-5xl rounded-3xl bg-white p-8 shadow-xl ring-1 ring-slate-200 sm:p-12 lg:p-14">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
        Estamos para ayudarte
      </p>
      <h1 className="mb-8 mt-3 text-3xl font-bold uppercase leading-tight text-[#2780c9] sm:text-4xl">
        Contáctanos
      </h1>
      <ContactoStepper onSubmit={onSubmit} />
    </div>
  </section>
);

export { FurmulairoContacto };
export default FurmulairoContacto;
