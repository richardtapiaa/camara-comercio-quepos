"use client";

import * as React from "react";

type Formulario = {
  nombre: string;
  apellido: string;
  cedula: string;
  direccion: string;
  telefono: string;
  email: string;
  profesion: string;
  estudios: string[];
  cursosEstudios: string;
  carnetManipulacion: string;
  licencia: string;
  tipoLicencia: string;
  zafarrancho: string;
  otrosCursos: string;
  cursosAdicionales: string;
  experiencia: string;
  lugarExperiencia: string;
  captcha: string;
  cv: File | null;
};

const VACIO: Formulario = {
  nombre: "",
  apellido: "",
  cedula: "",
  direccion: "",
  telefono: "",
  email: "",
  profesion: "",
  estudios: [],
  cursosEstudios: "",
  carnetManipulacion: "",
  licencia: "",
  tipoLicencia: "",
  zafarrancho: "",
  otrosCursos: "",
  cursosAdicionales: "",
  experiencia: "",
  lugarExperiencia: "",
  captcha: "",
  cv: null,
};

const CAMPO =
  "w-full rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-800 ring-1 ring-slate-200 outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-[#2780c9]";
const ETIQUETA = "grid gap-2 text-sm font-semibold text-slate-700";
const OBLIGATORIO = <span className="text-[#2780c9]">(*)</span>;
const CARACTERES_CAPTCHA = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";

const generarCaptcha = () =>
  Array.from({ length: 4 }, () => CARACTERES_CAPTCHA[Math.floor(Math.random() * CARACTERES_CAPTCHA.length)]).join("");

const Bolsa = () => {
  const [datos, setDatos] = React.useState<Formulario>(VACIO);
  const [error, setError] = React.useState("");
  const [enviado, setEnviado] = React.useState(false);
  const [captchaEsperado, setCaptchaEsperado] = React.useState("");

  React.useEffect(() => {
    setCaptchaEsperado(generarCaptcha());
  }, []);

  const cambiar =
    (campo: keyof Formulario) =>
    (evento: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const valor = evento.target.value;
      setDatos((anterior) => ({ ...anterior, [campo]: valor }));
      setError("");
      setEnviado(false);
    };

  const cambiarEstudios = (evento: React.ChangeEvent<HTMLSelectElement>) => {
    setDatos((anterior) => ({
      ...anterior,
      estudios: Array.from(evento.target.selectedOptions, (opcion) => opcion.value),
    }));
    setError("");
    setEnviado(false);
  };

  const cambiarArchivo = (evento: React.ChangeEvent<HTMLInputElement>) => {
    setDatos((anterior) => ({ ...anterior, cv: evento.target.files?.[0] ?? null }));
    setError("");
  };

  const enviar = (evento: React.FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    const requeridos = [
      datos.nombre,
      datos.apellido,
      datos.cedula,
      datos.direccion,
      datos.telefono,
      datos.email,
      datos.profesion,
      datos.estudios.length > 0 ? "estudios" : "",
      datos.carnetManipulacion,
      datos.licencia,
      datos.zafarrancho,
      datos.otrosCursos,
      datos.experiencia,
      datos.captcha,
    ];
    if (datos.estudios.includes("ina")) requeridos.push(datos.cursosEstudios);
    if (datos.licencia === "si") requeridos.push(datos.tipoLicencia);
    if (datos.otrosCursos === "si") requeridos.push(datos.cursosAdicionales);
    if (datos.experiencia === "si") requeridos.push(datos.lugarExperiencia);

    if (requeridos.some((valor) => !valor.trim())) {
      setError("Por favor complete todos los campos obligatorios (*).");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.email)) {
      setError("Por favor ingrese un correo electrónico válido.");
      return;
    }

    if (!captchaEsperado || datos.captcha.trim().toLowerCase() !== captchaEsperado.toLowerCase()) {
      setError("El captcha ingresado no es correcto.");
      return;
    }

    setError("");
    setEnviado(true);
    setDatos(VACIO);
    setCaptchaEsperado(generarCaptcha());
  };

  return (
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
            <p>
              Nuestra Bolsa de Empleo busca promover y facilitar la vinculación laboral entre nuestros asociados y las personas en situación de desempleo.
            </p>
            <p>
              Brindamos un servicio de Intermediación (o Bolsa de Empleo) buscando promover entre nuestros asociados, las necesidades de las personas que buscan trabajo.
            </p>
            <p>
              Es importante aclarar que la Cámara de Comercio, Industria y Turismo de Quepos no busca colaboradores, sino solamente facilita las solicitudes de empleo a los asociados que lo requieren.
            </p>
            <p>Agradecemos la acogida a este nuevo programa de oferta y demanda laboral en nuestro cantón.</p>
          </div>
        </header>

        <form onSubmit={enviar} noValidate className="mx-auto grid w-full gap-x-8 gap-y-5 rounded-3xl bg-white p-7 shadow-xl ring-1 ring-slate-200 sm:grid-cols-[10rem_1fr] sm:p-10 lg:p-12">
          <label className={ETIQUETA}>Nombre {OBLIGATORIO}</label>
          <input name="nombre" type="text" value={datos.nombre} onChange={cambiar("nombre")} className={CAMPO} />

          <label className={ETIQUETA}>Apellido {OBLIGATORIO}</label>
          <input name="apellido" type="text" value={datos.apellido} onChange={cambiar("apellido")} className={CAMPO} />

          <label className={ETIQUETA}>Cédula {OBLIGATORIO}</label>
          <input name="cedula" type="text" inputMode="numeric" value={datos.cedula} onChange={cambiar("cedula")} className={CAMPO} />

          <label className={`${ETIQUETA} sm:pt-3`}>Dirección {OBLIGATORIO}</label>
          <textarea name="direccion" rows={3} value={datos.direccion} onChange={cambiar("direccion")} className={`${CAMPO} resize-y`} />

          <label className={ETIQUETA}>Teléfono {OBLIGATORIO}</label>
          <input name="telefono" type="tel" inputMode="numeric" value={datos.telefono} onChange={cambiar("telefono")} className={CAMPO} />

          <label className={ETIQUETA}>Email {OBLIGATORIO}</label>
          <input name="email" type="email" autoComplete="email" value={datos.email} onChange={cambiar("email")} className={CAMPO} />

          <label className={ETIQUETA}>Profesión {OBLIGATORIO}</label>
          <select name="profesion" value={datos.profesion} onChange={cambiar("profesion")} className={CAMPO}>
            <option value="">Seleccione una profesión</option>
            <option value="salonero">Salonero</option>
            <option value="cocinero">Cocinero(a)</option>
            <option value="recepcionista">Recepcionista</option>
            <option value="administracion">Administración</option>
            <option value="otro">Otra</option>
          </select>

          <label className={`${ETIQUETA} sm:pt-3`}>Estudios {OBLIGATORIO}</label>
          <select name="estudios" multiple value={datos.estudios} onChange={cambiarEstudios} className={`${CAMPO} min-h-28`} aria-describedby="estudios-ayuda">
            <option value="primaria">Primaria</option>
            <option value="noveno">Noveno</option>
            <option value="bachiller">Bachiller</option>
            <option value="universidad">Universidad</option>
            <option value="ina">INA</option>
          </select>

          {datos.estudios.includes("ina") && (
            <>
              <label className={ETIQUETA}>¿Cuáles cursos? {OBLIGATORIO}</label>
              <input name="cursos-estudios" type="text" value={datos.cursosEstudios} onChange={cambiar("cursosEstudios")} className={CAMPO} />
            </>
          )}

          <div className="contents">
            <span className={ETIQUETA}>Carnet de Manipulación {OBLIGATORIO}</span>
            <Opciones nombre="carnetManipulacion" valor={datos.carnetManipulacion} cambiar={cambiar("carnetManipulacion")} />
          </div>
          <div className="contents">
            <span className={ETIQUETA}>Licencia {OBLIGATORIO}</span>
            <Opciones nombre="licencia" valor={datos.licencia} cambiar={cambiar("licencia")} />
          </div>
          {datos.licencia === "si" && (
            <>
              <label className={ETIQUETA}>¿Qué tipo? {OBLIGATORIO}</label>
              <input name="tipo-licencia" type="text" value={datos.tipoLicencia} onChange={cambiar("tipoLicencia")} className={CAMPO} />
            </>
          )}

          <div className="contents">
            <span className={ETIQUETA}>Zafarrancho {OBLIGATORIO}</span>
            <Opciones nombre="zafarrancho" valor={datos.zafarrancho} cambiar={cambiar("zafarrancho")} />
          </div>
          <div className="contents">
            <span className={ETIQUETA}>Otros cursos {OBLIGATORIO}</span>
            <Opciones nombre="otrosCursos" valor={datos.otrosCursos} cambiar={cambiar("otrosCursos")} />
          </div>
          {datos.otrosCursos === "si" && (
            <>
              <label className={ETIQUETA}>¿Cuáles cursos? {OBLIGATORIO}</label>
              <input name="cursos-adicionales" type="text" value={datos.cursosAdicionales} onChange={cambiar("cursosAdicionales")} className={CAMPO} />
            </>
          )}

          <div className="contents">
            <span className={ETIQUETA}>Experiencia {OBLIGATORIO}</span>
            <Opciones nombre="experiencia" valor={datos.experiencia} cambiar={cambiar("experiencia")} />
          </div>
          {datos.experiencia === "si" && (
            <>
              <label className={ETIQUETA}>¿Dónde? {OBLIGATORIO}</label>
              <input name="lugar-experiencia" type="text" value={datos.lugarExperiencia} onChange={cambiar("lugarExperiencia")} className={CAMPO} />
            </>
          )}

          <label className={ETIQUETA}>Captcha {OBLIGATORIO}</label>
          <div>
            <div className="mb-2 inline-flex h-12 items-center rounded-xl bg-slate-100 px-4 text-2xl italic tracking-[0.35em] text-slate-800 ring-1 ring-slate-200" aria-label="Código captcha">
              {captchaEsperado || "----"}
            </div>
            <input name="captcha" type="text" value={datos.captcha} onChange={cambiar("captcha")} className={CAMPO} aria-label="Ingrese el captcha" />
          </div>

          <label className={ETIQUETA}>Adjuntar_CV</label>
          <input name="cv" type="file" onChange={cambiarArchivo} className="w-full rounded-xl bg-slate-50 py-2 text-sm text-slate-700 ring-1 ring-slate-200 file:mr-2 file:rounded-lg file:border-0 file:bg-[#2780c9] file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white" />

          <div className="sm:col-start-2" aria-live="polite">
            {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
            {enviado && <p className="mb-3 text-sm font-medium text-[#2780c9]">¡Gracias! Hemos recibido su información.</p>}
            <button type="submit" className="rounded-full bg-[#2780c9] px-8 py-3 text-sm font-bold text-white shadow transition hover:-translate-y-0.5 hover:bg-[#1f6eae]">
              Enviar
            </button>
          </div>
        </form>
        </div>
      </section>
  );
};

type OpcionesProps = {
  nombre: string;
  valor: string;
  cambiar: (evento: React.ChangeEvent<HTMLInputElement>) => void;
};

const Opciones = ({ nombre, valor, cambiar }: OpcionesProps) => (
  <div className="flex items-center gap-4 py-1 text-sm">
    <label className="inline-flex items-center gap-1">
      <input type="radio" name={nombre} value="si" checked={valor === "si"} onChange={cambiar} className="accent-[#2780c9]" /> Sí
    </label>
    <label className="inline-flex items-center gap-1">
      <input type="radio" name={nombre} value="no" checked={valor === "no"} onChange={cambiar} className="accent-[#2780c9]" /> No
    </label>
  </div>
);

export default Bolsa;