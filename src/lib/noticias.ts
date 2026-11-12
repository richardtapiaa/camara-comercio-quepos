export const formatoFecha = new Intl.DateTimeFormat("es-CR", {
  dateStyle: "long",
  timeZone: "America/Costa_Rica",
});

const LARGO_MAXIMO_TITULO = 140;

export function parrafos(texto: string) {
  return texto
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export function recortar(texto: string, largo: number) {
  const corte = texto.lastIndexOf(" ", largo);
  return `${texto.slice(0, corte > 0 ? corte : largo).replace(/[\s,;:]+$/, "")}…`;
}

export function separarTitulo(texto: string): { titulo: string; cuerpo: string } {
  const limpio = texto.trim();
  if (!limpio) return { titulo: "Publicación con imagen", cuerpo: "" };

  const [primeraLinea, ...otrasLineas] = limpio.split("\n");
  if (primeraLinea.trim().length <= LARGO_MAXIMO_TITULO) {
    return { titulo: primeraLinea.trim(), cuerpo: otrasLineas.join("\n").trim() };
  }
  const oracion = limpio.match(/^.+?(?<!\b(?:Sr|Sra|Srta|Dr|Dra|Lic|Licda|Ing|Arq|Prof|MSc))[.!?](?=\s)/s)?.[0];
  if (oracion && oracion.length <= LARGO_MAXIMO_TITULO) {
    return { titulo: oracion.trim(), cuerpo: limpio.slice(oracion.length).trim() };
  }
  return { titulo: recortar(limpio, LARGO_MAXIMO_TITULO), cuerpo: limpio };
}

export const idNoticia = (idPost: string) => `noticia-${idPost}`;

const LARGO_MAXIMO_SLUG = 60;

/**
 * Dirección de la página de una noticia: el título sin tildes ni símbolos y,
 * al final, los últimos 6 dígitos del id de Facebook para que dos noticias
 * con títulos parecidos no choquen. Ej.: "campana-de-recoleccion-de-residuos-381245".
 */
export function slugNoticia(post: { id: string; texto: string }) {
  const { titulo } = separarTitulo(post.texto);
  const base = titulo
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const corto = base.length > LARGO_MAXIMO_SLUG ? base.slice(0, LARGO_MAXIMO_SLUG).replace(/-[^-]*$/, "") : base;
  const numero = (post.id.split("_").pop() ?? post.id).slice(-6);
  return `${corto || "noticia"}-${numero}`;
}

export const rutaNoticia = (post: { id: string; texto: string }) => `/noticias/${slugNoticia(post)}`;

const patronUrl = /(https?:\/\/[^\s]+)/g;

/** Parte un texto en trozos normales y direcciones web, para mostrar estas como enlaces. */
export function trozosConEnlaces(texto: string) {
  return texto.split(patronUrl).map((valor, i) => ({ valor, esEnlace: i % 2 === 1 }));
}
