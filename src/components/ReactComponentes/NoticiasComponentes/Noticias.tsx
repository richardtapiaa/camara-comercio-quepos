// Publicaciones de Facebook en tarjetas (cuadrícula): imagen, fecha, título, resumen y "Leer más".
// Se usa SIN directiva client:* (ver NoticiasComponentes/Noticias.astro): Astro la convierte en HTML durante el
// build y no manda nada de JavaScript al navegador. "Leer más" usa <details>, que funciona con teclado y lectores
// de pantalla sin JS.
// Buscador y filtro por mes: los controles salen escondidos y los activa un script pequeño (NoticiasComponentes/
// Noticias.astro) que solo muestra u oculta noticias con los datos data-busqueda y data-mes de cada una. Sin ese
// script no aparecen y se ve la lista completa.
import type { ReactNode } from "react";
import type { PostFacebook } from "../../../lib/facebook";
import { formatoFecha, idNoticia, parrafos, recortar, separarTitulo } from "../../../lib/noticias";
// Logo en estilo sello, el mismo del fondo del 404 (se genera con herramientas/logo-sello.mjs)
import logoSello from "../../../assets/compartido/logo-camara-sello.webp";

interface Props {
  posts: PostFacebook[];
  urlFacebook: string;
}

const AVISO_PESTANA = " (se abre en una pestaña nueva)";
// El resumen muestra unas 4 líneas de la tarjeta; si el cuerpo apenas lo pasa, se muestra entero y sin "Leer más"
const LARGO_RESUMEN = 160;

// Convierte las direcciones web del texto en enlaces, sin innerHTML (React escapa todo lo demás)
const patronUrl = /(https?:\/\/[^\s]+)/g;
function conEnlaces(texto: string): ReactNode[] {
  return texto.split(patronUrl).map((trozo, i) =>
    i % 2 === 1 ? (
      <a
        key={i}
        href={trozo}
        target="_blank"
        rel="noopener noreferrer"
        className="break-all font-semibold text-[#1d5a7a] underline underline-offset-2 hover:text-[#2b4a5c]"
      >
        {trozo}
        <span className="sr-only">{AVISO_PESTANA}</span>
      </a>
    ) : (
      trozo
    ),
  );
}

function Parrafo({ texto }: { texto: string }) {
  // whitespace-pre-line respeta los saltos de línea simples dentro del párrafo
  return <p className="whitespace-pre-line">{conEnlaces(texto)}</p>;
}

// Texto para buscar: minúsculas y sin tildes, así "camara" encuentra "Cámara" (el script normaliza igual lo escrito)
const normalizar = (texto: string) =>
  texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

// Mes de cada publicación en la hora de Costa Rica (la misma de formatoFecha): clave "2026-10" y nombre "Octubre de 2026"
const claveMes = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Costa_Rica", year: "numeric", month: "2-digit" });
const nombreMes = new Intl.DateTimeFormat("es-CR", { timeZone: "America/Costa_Rica", year: "numeric", month: "long" });
const mesDe = (fecha: string) => {
  const d = new Date(fecha);
  const nombre = nombreMes.format(d);
  return { clave: claveMes.format(d).slice(0, 7), nombre: nombre.charAt(0).toUpperCase() + nombre.slice(1) };
};

// Temas para filtrar, según palabras del texto (ya normalizado). Una noticia puede tener varios; si no tiene ninguno
// queda en "Avisos y comunicados"
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

// Datos de cada noticia: fecha, título y cuerpo
function datosNoticia(post: PostFacebook) {
  const { titulo, cuerpo } = separarTitulo(post.texto);
  return {
    fechaTexto: formatoFecha.format(new Date(post.fecha)),
    idTitulo: idNoticia(post.id),
    titulo,
    cuerpo,
    parrafosCuerpo: parrafos(cuerpo),
    conLeerMas: cuerpo.length > LARGO_RESUMEN + 60,
  };
}

// Caja con proporción fija: reserva el espacio antes de que cargue la imagen (sin saltos de página).
// Adelante, la imagen completa (object-contain: los afiches con texto no se recortan). Detrás, la misma imagen
// ampliada y difuminada llena los costados con sus propios colores en vez de franjas grises. Es la misma URL, así que
// el navegador la descarga una sola vez.
// alt vacío: Facebook no da una descripción de la imagen y el texto de la publicación ya dice de qué trata
function ImagenNoticia({ src, className = "" }: { src: string; className?: string }) {
  return (
    <div className={`relative isolate overflow-hidden rounded-[1.5rem] bg-slate-200 ${className}`}>
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

// Texto de la noticia: resumen + "Leer más" (con <details>) o el texto entero si es corto.
// Texto a 18 px, interlineado amplio, máximo ~65 caracteres por línea y contraste alto
function CuerpoNoticia({ datos }: { datos: ReturnType<typeof datosNoticia> }) {
  const { cuerpo, parrafosCuerpo, conLeerMas } = datos;
  return (
    <div className="mb-5 mt-3 space-y-4 leading-relaxed text-slate-700">
      {conLeerMas ? (
        <>
          {/* Resumen: se oculta al abrir "Leer más", que muestra el texto completo (sin repetirlo) */}
          <p className="group-has-[details[open]]/nota:hidden">{recortar(cuerpo.replace(/\s+/g, " "), LARGO_RESUMEN)}</p>
          <details className="group">
            <summary
              className={`inline-flex cursor-pointer list-none items-center gap-1 [&::-webkit-details-marker]:hidden ${claseEnlace}`}
            >
              <span className="group-open:hidden">Leer más</span>
              <span className="hidden group-open:inline">Mostrar menos</span>
              <span aria-hidden="true" className="inline-block transition-transform group-open:rotate-180 motion-reduce:transition-none">
                ▾
              </span>
            </summary>
            <div className="mt-4 space-y-4">
              {parrafosCuerpo.map((texto, i) => (
                <Parrafo key={i} texto={texto} />
              ))}
            </div>
          </details>
        </>
      ) : (
        parrafosCuerpo.map((texto, i) => <Parrafo key={i} texto={texto} />)
      )}
    </div>
  );
}

function EnlaceFacebook({ href, titulo }: { href: string; titulo: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-1.5 ${claseEnlace}`}>
      Ver en Facebook
      {/* Ícono decorativo (aria-hidden): el texto del enlace ya dice a dónde lleva. Mismo trazo que el del Navbar */}
      <svg className="size-5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
        <path d="M13.5 22v-8.2h2.8l.5-3.3h-3.3V8.4c0-.9.3-1.6 1.7-1.6h1.7V4a22 22 0 0 0-2.5-.1c-2.5 0-4.2 1.5-4.2 4.3v2.3H7.2v3.3H10V22h3.5Z" />
      </svg>
      <span className="sr-only">: {titulo}{AVISO_PESTANA}</span>
    </a>
  );
}

function Noticia({ post }: { post: PostFacebook }) {
  const datos = datosNoticia(post);

  return (
    <li
      data-noticia=""
      data-busqueda={datosBusqueda(post)}
      data-temas={temasDe(datosBusqueda(post)).join(" ")}
      data-mes={mesDe(post.fecha).clave}
      className="flex"
    >
      {/* Tarjeta como las de "Últimas noticias" del inicio: imagen arriba, fecha, título, texto y enlace a Facebook */}
      <article aria-labelledby={datos.idTitulo} className="group/nota flex w-full flex-col rounded-[2rem] bg-[#f3f5f8] p-5">
        {post.imagen && <ImagenNoticia src={post.imagen} className="aspect-[4/3]" />}
        <div className="flex flex-1 flex-col px-3 pb-2 pt-6">
          <p className="flex items-center gap-2 text-sm font-semibold text-slate-600">
            {/* Reloj decorativo, el mismo de las tarjetas del inicio */}
            <svg
              className="size-4 shrink-0 text-[#2780c9]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
              focusable="false"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" />
            </svg>
            <time dateTime={post.fecha}>{datos.fechaTexto}</time>
          </p>
          <h3 id={datos.idTitulo} className="mt-3 scroll-mt-32 text-xl font-semibold leading-snug text-slate-900">
            {datos.titulo}
          </h3>
          <CuerpoNoticia datos={datos} />
          <div className="mt-auto flex justify-end border-t border-slate-200 pt-4">
            <EnlaceFacebook href={post.enlace} titulo={datos.titulo} />
          </div>
        </div>
      </article>
    </li>
  );
}

// Buscador, temas y filtro por mes (este solo si hay publicaciones de más de un mes). Salen con hidden: el script de Noticias.astro los muestra (sin JS no servirían).
// role="search" para que los lectores de pantalla lo anuncien como buscador; el conteo va en una región aria-live
function Filtros({ posts }: { posts: PostFacebook[] }) {
  // Meses con publicaciones, del más reciente al más antiguo, sin repetir
  const meses = [...new Map(posts.map((post) => mesDe(post.fecha)).map((m) => [m.clave, m.nombre]))].sort((a, b) =>
    b[0].localeCompare(a[0]),
  );
  // Temas que tienen al menos una noticia, con cuántas
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
          {/* Lupa decorativa */}
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
      {/* Temas: botones que se marcan (aria-pressed), uno a la vez */}
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
      // overflow-x-clip y no overflow-hidden: overflow-hidden rompe el position: sticky del fondo
      className="relative isolate overflow-x-clip bg-white px-6 py-16 sm:px-10 sm:py-24"
    >
      {/* Fondo decorativo (aria-hidden): el sello del logo se queda fijo en la pantalla mientras se recorre toda la
          lista. La capa cubre la sección entera y el sello va dentro de un sticky del alto de la pantalla: solo CSS,
          sin JavaScript (background-attachment: fixed no funciona en iPhone). Opacidad baja porque queda detrás del
          texto de las publicaciones */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="sticky top-0 flex h-svh items-center justify-end overflow-hidden">
          <img
            src={logoSello.src}
            width={logoSello.width}
            height={logoSello.height}
            alt=""
            decoding="async"
            draggable={false}
            className="-mr-24 h-auto w-[380px] max-w-none rotate-6 select-none opacity-[0.10] sm:w-[540px] lg:-mr-28 lg:w-[780px]"
          />
        </div>
      </div>
      <div className="mx-auto max-w-6xl">
        <h2 id="titulo-ultimas" className="text-4xl font-bold text-slate-900 sm:text-5xl">
          Últimas publicaciones
        </h2>
        <p className="mt-3 max-w-[65ch] text-lg leading-relaxed text-slate-700">
          Lo más reciente de la Cámara de Comercio de Quepos en Facebook.
        </p>

        {posts.length > 0 && <Filtros posts={posts} />}

        {posts.length > 0 && (
          // Lista ordenada (de la más reciente a la más antigua) en cuadrícula: 1 columna en celular, 2 en tablet, 3 en
          // escritorio. Las tarjetas de una fila miden lo mismo y "Ver en Facebook" queda alineado abajo
          <ol role="list" className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {posts.map((post) => (
              <Noticia key={post.id} post={post} />
            ))}
          </ol>
        )}

        {posts.length > 0 ? (
          // Se muestra cuando la búsqueda o el filtro no dejan ninguna noticia
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
