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
