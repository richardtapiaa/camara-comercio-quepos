import VerticalLinearStepper, { type Datos } from "./unete-stepper";

interface Props {
  onSubmit?: (datos: Datos) => void | Promise<void>;
}

const FormularioUnete = ({ onSubmit }: Props) => (
  <section className="flex items-center p-4 sm:p-8 lg:p-10">
    <div className="mx-auto w-full max-w-5xl rounded-3xl bg-white p-8 shadow-xl ring-1 ring-slate-200 sm:p-12 lg:p-14">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Únete a nosotros</p>
      <h1 className="mb-8 mt-3 text-3xl font-bold uppercase leading-tight text-[#2780c9] sm:text-4xl">
        Únete, no esperes más
      </h1>
      <VerticalLinearStepper onSubmit={onSubmit} />
    </div>
  </section>
);

export { FormularioUnete };
export default FormularioUnete;
