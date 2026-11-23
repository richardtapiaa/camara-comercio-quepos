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

async function enviar(ruta: string, opciones: RequestInit): Promise<void> {
  let respuesta: Response;
  try {
    respuesta = await fetch(`${BASE_API}/api/${ruta}`, { method: "POST", ...opciones });
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

// Formularios sin archivos: se envían como JSON
export const enviarFormulario = (ruta: string, datos: unknown) =>
  enviar(ruta, { headers: { "Content-Type": "application/json" }, body: JSON.stringify(datos) });

// Formularios con archivos (por ejemplo, el currículum de la Bolsa de Empleo): se envían como multipart/form-data.
// No se pone Content-Type a mano: el navegador lo arma con el "boundary" correcto.
export const enviarFormularioConArchivos = (ruta: string, datos: FormData) => enviar(ruta, { body: datos });
