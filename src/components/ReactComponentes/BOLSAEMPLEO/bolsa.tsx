import BolsaStepper from "./bolsa-stepper";

const Bolsa = () => (
  <section className="flex items-center bg-white p-4 sm:p-8 lg:p-10">
    <div className="mx-auto w-full max-w-5xl">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
          Oportunidades laborales
        </p>
        <h1 className="mt-3 text-3xl font-bold uppercase leading-tight text-[#2780c9] sm:text-4xl">
          ¡Bienvenido a la Bolsa de Empleo de la Cámara de Comercio,
          <br className="hidden sm:block" /> Industria y Turismo de Quepos!
        </h1>
        <div className="mx-auto mt-8 max-w-5xl space-y-1 text-sm leading-6 text-slate-600">
          <p className="font-semibold">¿En qué consiste nuestro servicio?</p>
          <p>Nuestra Bolsa de Empleo busca promover y facilitar la vinculación laboral entre nuestros asociados y las personas en situación de desempleo.</p>
          <p>Brindamos un servicio de Intermediación (o Bolsa de Empleo) buscando promover entre nuestros asociados, las necesidades de las personas que buscan trabajo.</p>
          <p>Es importante aclarar que la Cámara de Comercio, Industria y Turismo de Quepos no busca colaboradores, sino solamente facilita las solicitudes de empleo a los asociados que lo requieren.</p>
          <p>Agradecemos la acogida a este nuevo programa de oferta y demanda laboral en nuestro cantón.</p>
        </div>
      </header>
      <div className="rounded-3xl bg-white p-7 shadow-xl ring-1 ring-slate-200 sm:p-10 lg:p-12">
        <BolsaStepper />
      </div>
    </div>
  </section>
);

export default Bolsa;
