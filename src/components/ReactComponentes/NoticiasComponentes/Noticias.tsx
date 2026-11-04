// Lista de publicaciones de Facebook en forma de línea de tiempo: fecha | imagen | título, resumen y "Leer más".
// Se usa SIN directiva client:* (ver NoticiasComponentes/Noticias.astro): Astro la convierte en HTML durante el
// build y no manda nada de JavaScript al navegador. "Leer más" usa <details>, que funciona con teclado y lectores
// de pantalla sin JS.
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
// El resumen muestra unas 3 o 4 líneas; si el cuerpo apenas lo pasa, se muestra entero y sin "Leer más"
const LARGO_RESUMEN = 240;

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
    <div className={`relative isolate overflow-hidden rounded-xl bg-slate-200 ${className}`}>
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
    <div className="mt-4 max-w-[65ch] space-y-4 text-lg leading-relaxed text-slate-700">
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
    <li className="relative pl-10 lg:grid lg:grid-cols-[11rem_minmax(0,20rem)_minmax(0,1fr)] lg:gap-x-12 lg:pl-0">
      {/* Punto sobre la línea de tiempo (decorativo: la fecha ya está escrita) */}
      <span
        aria-hidden="true"
        className="absolute left-0 top-1 size-4 rounded-full border-4 border-[#2780c9] bg-white lg:left-[calc(12.5rem-0.5rem)]"
      />

      <p className="text-sm font-semibold text-slate-600 lg:pt-0.5 lg:text-right">
        <time dateTime={post.fecha}>{datos.fechaTexto}</time>
      </p>

      {post.imagen ? (
        <ImagenNoticia src={post.imagen} className="mt-3 aspect-[4/3] lg:mt-0" />
      ) : (
        <div className="hidden lg:block" />
      )}

      <article aria-labelledby={datos.idTitulo} className="group/nota mt-5 flex flex-col lg:mt-0">
        <h3 id={datos.idTitulo} className="scroll-mt-32 text-2xl font-semibold leading-snug text-slate-900">
          {datos.titulo}
        </h3>
        <CuerpoNoticia datos={datos} />
        <div className="mt-5 flex justify-end border-t border-slate-200 pt-4">
          <EnlaceFacebook href={post.enlace} titulo={datos.titulo} />
        </div>
      </article>
    </li>
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

        {posts.length > 0 ? (
          // Lista ordenada: van de la más reciente a la más antigua. La línea vertical es un ::before decorativo
          <ol
            role="list"
            className="relative mt-12 space-y-16 before:absolute before:inset-y-0 before:left-[7px] before:w-0.5 before:bg-slate-200 lg:before:left-[calc(12.5rem-1px)]"
          >
            {posts.map((post) => (
              <Noticia key={post.id} post={post} />
            ))}
          </ol>
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
