// Publicaciones de la página de Facebook mediante la Graph API de Meta.
// Se ejecuta en el servidor/build: FB_PAGE_TOKEN no lleva prefijo PUBLIC_, así que nunca llega al navegador.

const VERSION_API = "v23.0";

export interface PostFacebook {
  id: string;
  texto: string;
  imagen: string | null;
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
  error?: { message: string };
}

// Caché por cantidad: durante el build varias páginas piden las publicaciones (el inicio y /noticias). Así se hace
// una sola petición a Facebook por build en vez de una por página
const cache = new Map<number, Promise<PostFacebook[]>>();

export function obtenerPostsFacebook(limite = 6): Promise<PostFacebook[]> {
  if (!cache.has(limite)) cache.set(limite, pedirPostsFacebook(limite));
  return cache.get(limite)!;
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

  try {
    const respuesta = await fetch(url);
    const json: RespuestaGraph = await respuesta.json();

    if (!respuesta.ok || json.error) {
      console.error("[facebook] Error de la Graph API:", json.error?.message ?? respuesta.status);
      return [];
    }

    return (json.data ?? []).map((post) => ({
      id: post.id,
      texto: post.message ?? "",
      imagen: post.full_picture ?? null,
      enlace: post.permalink_url,
      fecha: post.created_time,
    }));
  } catch (error) {
    console.error("[facebook] No se pudo conectar con Facebook:", error);
    return [];
  }
}
