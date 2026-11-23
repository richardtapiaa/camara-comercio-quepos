import { svgFondoTopografico } from "../lib/fondo-topografico";

export const GET = () => new Response(svgFondoTopografico(), { headers: { "Content-Type": "image/svg+xml" } });
