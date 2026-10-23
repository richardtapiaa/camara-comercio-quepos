import { defineCollection } from "astro:content";
import { file } from "astro/loaders";
import { z } from "astro/zod";

export const categoriasAfiliados = [
  "Hospedaje",
  "Tours y aventura",
  "Transporte",
  "Comercio",
  "Gastronomía",
  "Bienes raíces",
  "Servicios",
  "Otros",
] as const;

const afiliados = defineCollection({
  loader: file("src/data/afiliados.yaml"),
  schema: ({ image }) =>
    z.object({
      nombre: z.string(),
      categoria: z.enum(categoriasAfiliados),
      descripcion: z.string().optional(),
      logo: image(),
      telefonos: z.array(z.string()).optional(),
      whatsapp: z.string().optional(),
      correo: z.string().email().optional(),
      correos: z.array(z.string().email()).optional(),
      web: z.string().url().optional(),
      facebook: z.string().url().optional(),
      instagram: z.string().url().optional(),
    }),
});

// Lo que solo usa el mapa de afiliados; cada id es el mismo que en afiliados.yaml
const mapaAfiliados = defineCollection({
  loader: file("src/data/mapa-afiliados.yaml"),
  schema: ({ image }) =>
    z.object({
      ubicacion: z.object({ lat: z.number(), lng: z.number() }),
      foto: image().optional(),
      info: z.string().optional(),
    }),
});

export const collections = { afiliados, mapaAfiliados };
