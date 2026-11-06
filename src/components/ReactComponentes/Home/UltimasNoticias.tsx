import { ArrowRight, Clock } from "lucide-react";
import type { PostFacebook } from "../../../lib/facebook";
import { formatoFecha, idNoticia, recortar, separarTitulo } from "../../../lib/noticias";
import FondoSello from "../../compartidos/FondoSello";

interface Props {
  posts: PostFacebook[];
}

const LARGO_RESUMEN = 140;

function TarjetaNoticia({ post }: { post: PostFacebook }) {
  const { titulo, cuerpo } = separarTitulo(post.texto);
  const resumen = cuerpo ? recortar(cuerpo.replace(/\s+/g, " "), LARGO_RESUMEN) : "";
  const resumenCompleto = cuerpo.length <= LARGO_RESUMEN ? cuerpo.replace(/\s+/g, " ") : resumen;

  return (
    <article className="group relative flex h-full flex-col rounded-[2rem] bg-[#f3f5f8] p-5 transition-colors duration-300 focus-within:ring-2 focus-within:ring-[#2780c9] hover:bg-[#eaeef3] motion-reduce:transition-none">
      <div className="relative isolate aspect-[4/3] overflow-hidden rounded-[1.5rem] bg-slate-200">
        {post.imagen && (
          <>
            <img
              src={post.imagen}
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
              className="absolute inset-0 -z-10 size-full scale-125 object-cover opacity-90 blur-2xl saturate-150"
            />
            <img
              src={post.imagen}
              alt=""
              width={800}
              height={600}
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
              className="size-full object-contain transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            />
          </>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2.5 px-4 pb-4 pt-7">
        <p className="flex items-center gap-2 text-sm font-semibold text-slate-600">
          <Clock className="size-4 shrink-0 text-[#2780c9]" aria-hidden="true" />
          <time dateTime={post.fecha}>{formatoFecha.format(new Date(post.fecha))}</time>
        </p>

        <h3 className="mt-1 text-lg font-semibold leading-snug text-slate-900">
          <a
            href={`/noticias#${idNoticia(post.id)}`}
            className="line-clamp-3 outline-none after:absolute after:inset-0 after:content-['']"
          >
            {titulo}
          </a>
        </h3>

        {resumenCompleto && <p className="line-clamp-3 leading-relaxed text-slate-600">{resumenCompleto}</p>}

        <span className="mt-auto inline-flex items-center gap-1.5 pt-3 font-semibold text-[#1d5a7a]" aria-hidden="true">
          Leer noticia
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none" />
        </span>
      </div>
    </article>
  );
}

export default function UltimasNoticias({ posts }: Props) {
  if (posts.length === 0) return null;

  return (
    <section
      aria-labelledby="titulo-ultimas-noticias"
      className="relative isolate z-10 overflow-x-clip bg-white py-20 sm:py-24"
    >
      <FondoSello />
      <div className="mx-auto max-w-7xl px-6 sm:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <h2 id="titulo-ultimas-noticias" className="text-2xl font-semibold text-slate-900 sm:text-3xl">
            Últimas noticias
          </h2>
          <p className="mx-auto mt-4 max-w-[62ch] text-lg leading-relaxed text-slate-600">
            Lo más reciente de la Cámara de Comercio de Quepos: actividades, capacitaciones y avisos para el cantón.
          </p>
        </div>

        <ul role="list" className="mt-14 grid gap-6 md:grid-cols-3 lg:gap-8">
          {posts.map((post) => (
            <li key={post.id}>
              <TarjetaNoticia post={post} />
            </li>
          ))}
        </ul>

        <div className="mt-12 flex justify-center">
          <a
            href="/noticias"
            className="inline-flex items-center gap-2 rounded-full bg-[#2b4a5c] px-6 py-3.5 font-semibold text-white transition-colors hover:bg-[#1d3542] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2b4a5c] motion-reduce:transition-none"
          >
            Ver todas las noticias
            <ArrowRight className="size-4" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
