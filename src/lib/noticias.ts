// Texto de las publicaciones de Facebook: lo usan la página de Noticias (NoticiasComponentes) y las últimas noticias
// del inicio (Home/UltimasNoticias.tsx), para que las dos muestren el mismo título, fecha y resumen.

export const formatoFecha = new Intl.DateTimeFormat("es-CR", {
  dateStyle: "long",
  timeZone: "America/Costa_Rica",
});

const LARGO_MAXIMO_TITULO = 140;

// Separa el texto en párrafos (las líneas en blanco de Facebook)
export function parrafos(texto: string) {
  return texto
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

// Recorta en la última palabra completa antes de `largo`
export function recortar(texto: string, largo: number) {
  const corte = texto.lastIndexOf(" ", largo);
  return `${texto.slice(0, corte > 0 ? corte : largo).replace(/[\s,;:]+$/, "")}…`;
}

// Las publicaciones de Facebook no tienen título: se usa la primera línea o la primera oración, y lo que sigue es el
// cuerpo. Si ninguna es corta, el título se recorta y el cuerpo es el texto entero (para no perder nada).
export function separarTitulo(texto: string): { titulo: string; cuerpo: string } {
  const limpio = texto.trim();
  if (!limpio) return { titulo: "Publicación con imagen", cuerpo: "" };

  const [primeraLinea, ...otrasLineas] = limpio.split("\n");
  if (primeraLinea.trim().length <= LARGO_MAXIMO_TITULO) {
    return { titulo: primeraLinea.trim(), cuerpo: otrasLineas.join("\n").trim() };
  }
  // El punto de abreviaturas como "Sr." o "Lic." no cuenta como fin de oración
  const oracion = limpio.match(/^.+?(?<!\b(?:Sr|Sra|Srta|Dr|Dra|Lic|Licda|Ing|Arq|Prof|MSc))[.!?](?=\s)/s)?.[0];
  if (oracion && oracion.length <= LARGO_MAXIMO_TITULO) {
    return { titulo: oracion.trim(), cuerpo: limpio.slice(oracion.length).trim() };
  }
  return { titulo: recortar(limpio, LARGO_MAXIMO_TITULO), cuerpo: limpio };
}

// id del título de cada noticia en /noticias: sirve de ancla para enlazar directo a una publicación
export const idNoticia = (idPost: string) => `noticia-${idPost}`;
