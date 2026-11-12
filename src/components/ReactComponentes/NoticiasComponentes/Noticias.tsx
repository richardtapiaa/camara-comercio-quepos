import type { PostFacebook } from "../../../lib/facebook";
import { formatoFecha, idNoticia, recortar, rutaNoticia, separarTitulo } from "../../../lib/noticias";
import FondoSello from "../../compartidos/FondoSello";

interface Props {
  posts: PostFacebook[];
  urlFacebook: string;
}

const AVISO_PESTANA = " (se abre en una pestaña nueva)";
const LARGO_RESUMEN = 160;

const normalizar = (texto: string) =>
  texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const claveMes = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Costa_Rica", year: "numeric", month: "2-digit" });
const nombreMes = new Intl.DateTimeFormat("es-CR", { timeZone: "America/Costa_Rica", year: "numeric", month: "long" });
const mesDe = (fecha: string) => {
  const d = new Date(fecha);
  const nombre = nombreMes.format(d);
  return { clave: claveMes.format(d).slice(0, 7), nombre: nombre.charAt(0).toUpperCase() + nombre.slice(1) };
};

const temas = [
  { clave: "capacitaciones", nombre: "Capacitaciones", patron: /capacit|taller|curso|aprendizaje|\bina\b/ },
  { clave: "eventos", nombre: "Encuentros y eventos", patron: /encuentro|conversatorio|invita|evento|feria|actividad/ },
];
const temaOtros = { clave: "comunicados", nombre: "Avisos y comunicados" };
const temasDe = (busqueda: string) => {
  const encontrados = temas.filter((tema) => tema.patron.test(busqueda)).map((tema) => tema.clave);
  return encontrados.length ? encontrados : [temaOtros.clave];
};
const datosBusqueda = (post: PostFacebook) => {
  const { titulo, cuerpo } = separarTitulo(post.texto);
  return normalizar(`${titulo} ${cuerpo}`);
};

const claseEnlace =
  "rounded font-semibold text-[#1d5a7a] underline underline-offset-4 hover:text-[#2b4a5c] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1d5a7a]";

const formatoDia = new Intl.DateTimeFormat("es-CR", { day: "numeric", timeZone: "America/Costa_Rica" });
const formatoMesCorto = new Intl.DateTimeFormat("es-CR", { month: "short", timeZone: "America/Costa_Rica" });

function datosNoticia(post: PostFacebook) {
  const { titulo, cuerpo } = separarTitulo(post.texto);
  const fecha = new Date(post.fecha);
  const cuerpoLimpio = cuerpo.replace(/\s+/g, " ").trim();
  return {
    // "14 - jul" a la vista; los lectores de pantalla oyen la fecha completa.
    fechaCorta: `${formatoDia.format(fecha)} - ${formatoMesCorto.format(fecha).replace(".", "")}`,
    fechaTexto: formatoFecha.format(fecha),
    idTitulo: idNoticia(post.id),
    titulo,
    resumen: cuerpoLimpio.length > LARGO_RESUMEN ? recortar(cuerpoLimpio, LARGO_RESUMEN) : cuerpoLimpio,
  };
}

function ImagenNoticia({ src, className = "" }: { src: string; className?: string }) {
  return (
    <div className={`relative isolate overflow-hidden bg-slate-200 ${className}`}>
      <img
        src={src}
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        className="absolute inset-0 -z-10 size-full scale-125 object-cover opacity-90 blur-2xl saturate-150"
      />
      <img
        src={src}
        alt=""
        width={800}
        height={600}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        className="size-full object-contain drop-shadow-[0_6px_18px_rgb(0_0_0/0.25)]"
      />
    </div>
  );
}

/**
 * Tarjeta de una noticia. Toda la tarjeta abre la página de la noticia: el
 * ::after del enlace "Leer más" la cubre entera. Se usa en /noticias y en
 * "Otras noticias" al final de cada noticia.
 */
export function TarjetaNoticia({ post }: { post: PostFacebook }) {
  const datos = datosNoticia(post);

  return (
    <article
      aria-labelledby={datos.idTitulo}
      className="group/nota relative flex w-full flex-col overflow-hidden rounded-[2rem] bg-[#f3f5f8] shadow-[0_18px_40px_-24px_rgb(15_23_42/0.45)] transition-shadow duration-300 hover:shadow-[0_26px_50px_-24px_rgb(15_23_42/0.55)] motion-reduce:transition-none"
    >
      {post.imagen && <ImagenNoticia src={post.imagen} className="aspect-square" />}
      <div className="flex flex-1 flex-col p-6">
        <h3 id={datos.idTitulo} className="scroll-mt-32 text-xl font-bold leading-snug text-slate-900">
          {datos.titulo}
        </h3>
        {datos.resumen && <p className="mt-4 line-clamp-3 leading-relaxed text-slate-700">{datos.resumen}</p>}
        <div className="mt-auto flex items-center justify-between gap-4 pt-8">
          <p className="text-lg font-bold text-slate-900">
            <time dateTime={post.fecha}>
              <span aria-hidden="true">{datos.fechaCorta}</span>
              <span className="sr-only">{datos.fechaTexto}</span>
            </time>
          </p>
          <a
            href={rutaNoticia(post)}
            className="inline-flex items-center gap-3 rounded-full font-semibold text-slate-900 after:absolute after:inset-0 after:content-[''] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1d5a7a]"
          >
            <span>
              Leer más<span className="sr-only">: {datos.titulo}</span>
            </span>
            <span
              aria-hidden="true"
              className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#2b4a5c] text-white transition-[translate,background-color] duration-300 group-hover/nota:translate-x-1 group-hover/nota:bg-[#1d3542] motion-reduce:transition-none"
            >
              <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" focusable="false">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </span>
          </a>
        </div>
      </div>
    </article>
  );
}

function Noticia({ post }: { post: PostFacebook }) {
  return (
    <li
      data-noticia=""
      data-busqueda={datosBusqueda(post)}
      data-temas={temasDe(datosBusqueda(post)).join(" ")}
      data-mes={mesDe(post.fecha).clave}
      className="flex"
    >
      <TarjetaNoticia post={post} />
    </li>
  );
}

function Filtros({ posts }: { posts: PostFacebook[] }) {
  const meses = [...new Map(posts.map((post) => mesDe(post.fecha)).map((m) => [m.clave, m.nombre]))].sort((a, b) =>
    b[0].localeCompare(a[0]),
  );
  const conteoTemas = new Map<string, number>();
  posts.forEach((post) => temasDe(datosBusqueda(post)).forEach((t) => conteoTemas.set(t, (conteoTemas.get(t) ?? 0) + 1)));
  const temasVisibles = [...temas, temaOtros].filter((tema) => conteoTemas.has(tema.clave));
  const claseChip =
    "rounded-full border px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1d5a7a] motion-reduce:transition-none border-slate-300 bg-white text-slate-700 hover:border-[#1d5a7a] hover:text-[#1d5a7a] aria-pressed:border-[#2b4a5c] aria-pressed:bg-[#2b4a5c] aria-pressed:text-white";
  const claseCampo =
    "h-12 w-full rounded-full border border-slate-300 bg-white text-base text-slate-900 shadow-sm transition-colors focus:border-[#1d5a7a] focus:outline-2 focus:outline-offset-2 focus:outline-[#1d5a7a] motion-reduce:transition-none";
  return (
    <div data-filtros-noticias hidden className="mt-10">
      <form role="search" aria-label="Buscar noticias" className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <label htmlFor="buscar-noticia" className="sr-only">
            Buscar una noticia
          </label>
          <svg
            className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
            focusable="false"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            id="buscar-noticia"
            type="search"
            data-buscar-noticia=""
            placeholder="Buscar una noticia…"
            autoComplete="off"
            className={`${claseCampo} pl-12 pr-4`}
          />
        </div>
        {meses.length > 1 && (
          <div className="sm:w-60">
            <label htmlFor="filtrar-mes" className="sr-only">
              Filtrar por mes
            </label>
            <select id="filtrar-mes" data-filtrar-mes="" className={`${claseCampo} cursor-pointer px-5`}>
              <option value="">Todas las fechas</option>
              {meses.map(([clave, nombre]) => (
                <option key={clave} value={clave}>
                  {nombre}
                </option>
              ))}
            </select>
          </div>
        )}
      </form>
      <div role="group" aria-label="Filtrar por tema" className="mt-4 flex flex-wrap gap-2">
        <button type="button" data-tema="" aria-pressed="true" className={claseChip}>
          Todas
        </button>
        {temasVisibles.map((tema) => (
          <button key={tema.clave} type="button" data-tema={tema.clave} aria-pressed="false" className={claseChip}>
            {tema.nombre} <span className="font-normal opacity-80">({conteoTemas.get(tema.clave)})</span>
          </button>
        ))}
      </div>
      <p data-conteo-noticias aria-live="polite" className="mt-3 text-sm text-slate-600"></p>
    </div>
  );
}

export default function Noticias({ posts, urlFacebook }: Props) {
  return (
    <section
      aria-labelledby="titulo-ultimas"
      className="relative isolate overflow-x-clip bg-white px-6 py-16 sm:px-10 sm:py-24"
    >
      <FondoSello />
      <div className="mx-auto max-w-6xl">
        <h2 id="titulo-ultimas" className="text-4xl font-bold text-slate-900 sm:text-5xl">
          Últimas publicaciones
        </h2>
        <p className="mt-3 max-w-[65ch] text-lg leading-relaxed text-slate-700">
          Lo más reciente de la Cámara de Comercio de Quepos en Facebook.
        </p>

        {posts.length > 0 && <Filtros posts={posts} />}

        {posts.length > 0 && (
          <ol role="list" className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-12">
            {posts.map((post) => (
              <Noticia key={post.id} post={post} />
            ))}
          </ol>
        )}

        {posts.length > 0 ? (
          <div data-sin-resultados hidden className="mt-10 rounded-2xl bg-slate-100 p-8 text-lg text-slate-800">
            <p>No encontramos noticias con esa búsqueda.</p>
            <button type="button" data-limpiar-filtros className={`mt-3 ${claseEnlace}`}>
              Ver todas las noticias
            </button>
          </div>
        ) : (
          <p className="mt-10 rounded-2xl bg-slate-100 p-8 text-lg text-slate-800">
            En este momento no pudimos cargar las noticias. Puede verlas en{" "}
            <a href={urlFacebook} target="_blank" rel="noopener noreferrer" className={claseEnlace}>
              nuestra página de Facebook
              <span className="sr-only">{AVISO_PESTANA}</span>
            </a>
            .
          </p>
        )}
      </div>
    </section>
  );
}
