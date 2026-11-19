import BolsaStepper from "./bolsa-stepper";

const Bolsa = () => (
  <section className="flex items-start px-4 py-8 sm:px-8 lg:px-6 lg:pt-[12.5rem] xl:px-10">
    <div className="mx-auto w-full max-w-[38rem]">
      <div className="rounded-[1.25rem] bg-white px-5 py-6 shadow-[0_18px_45px_rgba(0,22,40,0.22)] sm:px-8 sm:py-8">
        <BolsaStepper />
      </div>
    </div>
  </section>
);

export default Bolsa;
