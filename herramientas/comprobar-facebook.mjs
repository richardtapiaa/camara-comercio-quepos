import { setDefaultResultOrder } from "node:dns";
import { fileURLToPath } from "node:url";
import { loadEnv } from "vite";

const INTENTOS = 3;
const ESPERA_ENTRE_INTENTOS_MS = 1500;
const LIMITE_POR_INTENTO_MS = 15000;

const consultar = async (url) => {
  const respuesta = await fetch(url, { signal: AbortSignal.timeout(LIMITE_POR_INTENTO_MS) });
  const datos = await respuesta.json();
  if (respuesta.ok && !datos.error) return { correcto: true };
  return {
    correcto: false,
    temporal: respuesta.status >= 500 || respuesta.status === 429 || datos.error?.is_transient === true,
    motivo: datos.error?.message ?? `HTTP ${respuesta.status}`,
  };
};

// Astro vacía dist/ al empezar a compilar. Esta comprobación corre antes, para que un fallo de Facebook
// detenga la compilación sin borrar la última versión buena del sitio.
export default function comprobarFacebook() {
  let raiz;
  return {
    name: "comprobar-facebook",
    hooks: {
      "astro:config:done": ({ config }) => {
        raiz = fileURLToPath(config.root);
      },
      "astro:build:start": async () => {
        const { FB_PAGE_ID: idPagina, FB_PAGE_TOKEN: token } = loadEnv("production", raiz, "FB_");
        if (!idPagina || !token) return;

        setDefaultResultOrder("ipv4first");
        const url = new URL(`https://graph.facebook.com/${idPagina}/posts`);
        url.searchParams.set("fields", "id");
        url.searchParams.set("limit", "1");
        url.searchParams.set("access_token", token);

        let motivo;
        for (let intento = 1; intento <= INTENTOS; intento++) {
          try {
            const resultado = await consultar(url);
            if (resultado.correcto) return;
            motivo = resultado.motivo;
            if (!resultado.temporal) break;
          } catch (error) {
            motivo = error.cause?.code ?? error.message;
          }
          if (intento < INTENTOS) await new Promise((listo) => setTimeout(listo, ESPERA_ENTRE_INTENTOS_MS * intento));
        }
        throw new Error(`[facebook] No se pudieron cargar las noticias: ${motivo}. La compilación se detuvo y dist/ quedó intacta.`);
      },
    },
  };
}
