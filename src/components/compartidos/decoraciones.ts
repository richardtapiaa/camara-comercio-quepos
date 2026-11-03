import type { ImageMetadata } from "astro";
import iconoLapa from "../../assets/quepos/icono-lapa-color.svg";
import iconoMono from "../../assets/quepos/icono-mono-color.svg";
import iconoPerezoso from "../../assets/quepos/icono-perezoso-color.svg";
import hojas from "../../assets/quepos/hojas-tropicales.svg";

// Animal u hoja sobre una letra de FraseDecorada.astro
export interface Decoracion {
  // Posición de la letra en el texto, contando espacios y desde 0
  letra: number;
  imagen: ImageMetadata;
  // Punto de apoyo en la letra (left/bottom, en em para que crezca con ella), tamaño (h-…) y giro
  clase: string;
  // Se mece desde su punto de apoyo (los que cuelgan)
  mecer?: boolean;
}

// Cada dibujo trae el punto con el que se apoya en la letra (las patas, la rama, la base del ramito): con translate se
// lleva ese punto al apoyo que da `clase`, así el tamaño se puede cambiar sin que se despegue. origin-… es ese mismo
// punto: desde ahí crece al aparecer y se mece.
// Medidas de Poppins Black con leading-tight, para ubicar los apoyos: la caja de la letra mide 1.25em, la línea base
// queda a 0.27em del fondo y el tope de las mayúsculas a 0.98em.

// Lapa posada: patas en el 46.5 % del ancho y el 74.3 % del alto
export const lapa = (letra: number, clase: string): Decoracion => ({
  letra,
  imagen: iconoLapa,
  clase: `-translate-x-[46.5%] translate-y-[25.7%] origin-[46.5%_74.3%] ${clase}`,
});

// Mono sentado: apoyado en el centro, al 87 % del alto
export const mono = (letra: number, clase: string): Decoracion => ({
  letra,
  imagen: iconoMono,
  clase: `-translate-x-1/2 translate-y-[13%] origin-[50%_87%] ${clase}`,
});

// Perezoso colgado: la punta izquierda de su rama (2.9 %, 16.7 %) va sobre la letra, y desde ahí se mece
export const perezoso = (letra: number, clase: string): Decoracion => ({
  letra,
  imagen: iconoPerezoso,
  clase: `-translate-x-[2.9%] translate-y-[83.3%] origin-[2.9%_16.7%] ${clase}`,
  mecer: true,
});

// Ramito de hojas y flores: la base, donde se juntan los tallos (50 %, 95 %)
export const ramito = (letra: number, clase: string): Decoracion => ({
  letra,
  imagen: hojas,
  clase: `-translate-x-1/2 translate-y-[5%] origin-[50%_95%] h-[0.6em] lg:h-[0.75em] ${clase}`,
});
