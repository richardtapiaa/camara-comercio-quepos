import { setDefaultResultOrder } from "node:dns";
import { getImage, inferRemoteSize } from "astro:assets";

const VERSION_API = "v23.0";
const ANCHO_IMAGEN = 1200;
const ANCHO_MINIATURA = 720;

const INTENTOS = import.meta.env.PROD ? 3 : 1;
const ESPERA_ENTRE_INTENTOS_MS = 1500;
const LIMITE_POR_INTENTO_MS = 15000;
const REVISAR_TRAS_FALLO_MS = 30000;

setDefaultResultOrder("ipv4first");

export interface PostFacebook {
  id: string;
  texto: string;
  imagen: string | null;
  miniatura: string | null;
  enlace: string;
  fecha: string;
}

interface RespuestaGraph {
  data?: {
    id: string;
    message?: string;
    full_picture?: string;
    permalink_url: string;
    created_time: string;
  }[];
  error?: { message: string; is_transient?: boolean };
}

class ErrorFacebook extends Error {
  temporal: boolean;

  constructor(mensaje: string, temporal: boolean) {
    super(mensaje);
    this.temporal = temporal;
  }
}

const detalleError = (error: unknown) => {
  if (!(error instanceof Error)) return String(error);
  return (error.cause as { code?: string } | undefined)?.code ?? error.message;
};

async function conReintentos<T>(tarea: () => Promise<T>): Promise<T> {
  for (let intento = 1; ; intento++) {
    try {
      return await tarea();
    } catch (error) {
      const definitivo = error instanceof ErrorFacebook && !error.temporal;
      if (definitivo || intento >= INTENTOS) throw error;
      await new Promise((listo) => setTimeout(listo, ESPERA_ENTRE_INTENTOS_MS * intento));
    }
  }
}

const cache = new Map<number, Promise<PostFacebook[]>>();

export function obtenerPostsFacebook(limite = 6): Promise<PostFacebook[]> {
  let posts = cache.get(limite);
  if (!posts) {
    posts = pedirPostsFacebook(limite).catch((error: unknown) => {
      const mensaje = `[facebook] No se pudieron cargar las noticias: ${detalleError(error)}`;
      if (import.meta.env.PROD) {
        throw new Error(`${mensaje}. La compilación se detuvo para no generar el sitio sin noticias.`);
      }
      console.error(mensaje);
      setTimeout(() => cache.delete(limite), REVISAR_TRAS_FALLO_MS);
      return [];
    });
    cache.set(limite, posts);
  }
  return posts;
}

async function guardarImagen(url: string) {
  try {
    const { width, height } = await conReintentos(() => inferRemoteSize(url));
    const version = (ancho: number) => {
      const anchoFinal = Math.min(ancho, width);
      return getImage({
        src: url,
        width: anchoFinal,
        height: Math.round((height * anchoFinal) / width),
        format: "webp",
        quality: 72,
      });
    };
    const [imagen, miniatura] = await Promise.all([version(ANCHO_IMAGEN), version(ANCHO_MINIATURA)]);
    return { imagen: imagen.src, miniatura: miniatura.src };
  } catch (error) {
    console.warn("[facebook] No se pudo guardar una imagen; se usará la URL de Facebook:", error);
    return { imagen: url, miniatura: url };
  }
}

async function pedirPostsFacebook(limite: number): Promise<PostFacebook[]> {
  const idPagina = import.meta.env.FB_PAGE_ID;
  const token = import.meta.env.FB_PAGE_TOKEN;

  if (!idPagina || !token) {
    console.warn("[facebook] Faltan FB_PAGE_ID o FB_PAGE_TOKEN en .env");
    return [];
  }

  const url = new URL(`https://graph.facebook.com/${VERSION_API}/${idPagina}/posts`);
  url.searchParams.set("fields", "message,full_picture,permalink_url,created_time");
  url.searchParams.set("limit", String(limite));
  url.searchParams.set("access_token", token);

  const json = await conReintentos(async () => {
    const respuesta = await fetch(url, { signal: AbortSignal.timeout(LIMITE_POR_INTENTO_MS) });
    const datos: RespuestaGraph = await respuesta.json();

    if (!respuesta.ok || datos.error) {
      const temporal = respuesta.status >= 500 || respuesta.status === 429 || datos.error?.is_transient === true;
      throw new ErrorFacebook(datos.error?.message ?? `HTTP ${respuesta.status}`, temporal);
    }
    return datos;
  });

  return Promise.all(
    (json.data ?? []).map(async (post) => ({
      id: post.id,
      texto: post.message ?? "",
      ...(post.full_picture ? await guardarImagen(post.full_picture) : { imagen: null, miniatura: null }),
      enlace: post.permalink_url,
      fecha: post.created_time,
    })),
  );
}
