
const BASE_API = (import.meta.env.PUBLIC_API_URL ?? "").replace(/\/+$/, "");

export class ErrorApi extends Error {
  constructor(
    mensaje: string,
    public estado: number,
    public campos: Record<string, string> = {},
  ) {
    super(mensaje);
    this.name = "ErrorApi";
  }
}

export async function enviarFormulario(ruta: string, datos: unknown): Promise<void> {
  let respuesta: Response;
  try {
    respuesta = await fetch(`${BASE_API}/api/${ruta}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });
  } catch {
    throw new ErrorApi("No hay conexión con el servidor. Revise su internet e inténtelo de nuevo.", 0);
  }

  if (respuesta.ok) return;

  const cuerpo = await respuesta.json().catch(() => null);
  throw new ErrorApi(
    cuerpo?.error ?? "No se pudo enviar el formulario. Inténtelo de nuevo.",
    respuesta.status,
    cuerpo?.campos ?? {},
  );
}
