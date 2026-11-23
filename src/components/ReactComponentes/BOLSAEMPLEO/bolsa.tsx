import BolsaStepper from "./bolsa-stepper";
import logo from "../../../assets/compartido/logo-camara-nav-400.webp";

// Tarjeta del formulario con el logo de la Cámara centrado arriba, igual que en contacto y Únete
const Bolsa = () => (
  <section className="flex items-start px-4 py-8 sm:px-8 lg:px-6 lg:pt-20 xl:px-10">
    <div className="mx-auto w-full max-w-[38rem]">
      <div className="rounded-[2rem] bg-white px-5 py-6 shadow-[0_24px_60px_-24px_rgba(15,40,70,0.3)] ring-1 ring-slate-200/80 sm:px-8 sm:py-8">
        <img
          src={logo.src}
          width={logo.width}
          height={logo.height}
          alt="Cámara de Comercio, Industria y Turismo de Quepos"
          loading="lazy"
          decoding="async"
          className="mx-auto mb-8 h-[4.5rem] w-auto sm:h-[5.25rem]"
        />
        <BolsaStepper />
      </div>
    </div>
  </section>
);

export default Bolsa;
