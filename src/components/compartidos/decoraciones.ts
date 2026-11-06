import type { ImageMetadata } from "astro";
import iconoLapa from "../../assets/quepos/icono-lapa-color.svg";
import iconoMono from "../../assets/quepos/icono-mono-color.svg";
import iconoPerezoso from "../../assets/quepos/icono-perezoso-color.svg";
import hojas from "../../assets/quepos/hojas-tropicales.svg";

export interface Decoracion {
  letra: number;
  imagen: ImageMetadata;
  clase: string;
  mecer?: boolean;
}

export const lapa = (letra: number, clase: string): Decoracion => ({
  letra,
  imagen: iconoLapa,
  clase: `-translate-x-[46.5%] translate-y-[25.7%] origin-[46.5%_74.3%] ${clase}`,
});

export const mono = (letra: number, clase: string): Decoracion => ({
  letra,
  imagen: iconoMono,
  clase: `-translate-x-1/2 translate-y-[13%] origin-[50%_87%] ${clase}`,
});

export const perezoso = (letra: number, clase: string): Decoracion => ({
  letra,
  imagen: iconoPerezoso,
  clase: `-translate-x-[2.9%] translate-y-[83.3%] origin-[2.9%_16.7%] ${clase}`,
  mecer: true,
});

export const ramito = (letra: number, clase: string): Decoracion => ({
  letra,
  imagen: hojas,
  clase: `-translate-x-1/2 translate-y-[5%] origin-[50%_95%] h-[0.6em] lg:h-[0.75em] ${clase}`,
});
