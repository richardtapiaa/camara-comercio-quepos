// Animaciones e interacciones: el menú, el video del inicio, las animaciones del malecón y el FAQ.
// No compara píxel a píxel: comprueba que cada animación arranca, avanza al hacer scroll y respeta "reducir movimiento".
import { expect, test, type Page } from "@playwright/test";

const esCelular = (nombre: string) => nombre === "celular";

// Lleva el scroll a una fracción del recorrido de una sección (0 = su borde de arriba llega arriba, 1 = su final)
const bajarA = (page: Page, selector: string, fraccion: number) =>
  page.evaluate(
    ([selector, fraccion]) => {
      const seccion = document.querySelector<HTMLElement>(selector)!;
      // offsetTop acumulado: no lo afecta position: sticky
      let arriba = 0;
      for (let el: HTMLElement | null = seccion; el; el = el.offsetParent as HTMLElement | null) arriba += el.offsetTop;
      window.scrollTo(0, arriba + (seccion.offsetHeight - window.innerHeight) * fraccion);
    },
    [selector, fraccion] as const,
  );

// Suma de algunos píxeles del lienzo: 0 mientras está vacío, cambia cuando se dibuja otro cuadro
const firmaLienzo = (page: Page, selector: string) =>
  page.evaluate((selector) => {
    const lienzo = document.querySelector<HTMLCanvasElement>(`${selector} [data-malecon-lienzo]`)!;
    const { data } = lienzo.getContext("2d")!.getImageData(0, 0, lienzo.width, lienzo.height);
    let suma = 0;
    for (let i = 0; i < data.length; i += 4 * 997) suma += data[i] + data[i + 1] * 3 + data[i + 2] * 7 + data[i + 3];
    return suma;
  }, selector);

test.describe("menú", () => {
  test("en celular se abre y se cierra con el botón, Escape y el fondo", async ({ page }, info) => {
    test.skip(!esCelular(info.project.name), "solo en celular");
    await page.goto("/");
    const boton = page.locator("#nav-toggle");
    const menu = page.locator("#nav-menu");

    await boton.click();
    await expect(boton).toHaveAttribute("aria-expanded", "true");
    await expect(menu).toBeInViewport();
    await expect(page.locator("#nav-close")).toBeFocused();

    await page.keyboard.press("Escape");
    await expect(boton).toHaveAttribute("aria-expanded", "false");
    await expect(menu).not.toBeInViewport();
    await expect(boton).toBeFocused();

    await boton.click();
    await expect(menu).toBeInViewport();
    await page.locator("#nav-overlay").click({ position: { x: 10, y: 300 } });
    await expect(boton).toHaveAttribute("aria-expanded", "false");
    await expect(menu).not.toBeInViewport();
  });

  test("en escritorio los submenús se abren y se cierran al hacer clic afuera o con Escape", async ({ page }, info) => {
    test.skip(esCelular(info.project.name), "solo en escritorio");
    await page.goto("/");
    const desplegable = page.locator("[data-nav-dropdown]").nth(1);
    const boton = desplegable.locator("[data-nav-dropdown-toggle]");
    const submenu = desplegable.locator("[data-nav-dropdown-menu]");

    await boton.click();
    await expect(submenu).toBeVisible();
    await expect(submenu.getByRole("link", { name: "Quepos", exact: true })).toBeVisible();
    await page.mouse.click(700, 600);
    await expect(submenu).toBeHidden();

    await boton.click();
    await expect(submenu).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(submenu).toBeHidden();
    await expect(boton).toBeFocused();
  });
});

test.describe("video del inicio", () => {
  test("empieza a reproducirse después de cargar la página", async ({ page }) => {
    await page.goto("/");
    await expect
      .poll(() => page.locator("video[data-video-diferido]").evaluate((v: HTMLVideoElement) => !v.paused), {
        timeout: 15_000,
      })
      .toBe(true);
  });

  test("con reducir movimiento se queda en el póster sin descargar el video", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    const videos: string[] = [];
    page.on("request", (r) => /\.(mp4|webm)$/.test(new URL(r.url()).pathname) && videos.push(r.url()));
    await page.goto("/", { waitUntil: "load" });
    await page.waitForTimeout(1000);
    await expect(page.locator("video[data-video-diferido]")).toHaveJSProperty("paused", true);
    expect(videos).toEqual([]);
  });
});

test.describe("malecón (página Quepos)", () => {
  test("los cuadros avanzan al bajar, en AVIF y sin cuadros que falten", async ({ page }) => {
    const cuadros: string[] = [];
    const rotos: string[] = [];
    page.on("response", (r) => {
      const ruta = new URL(r.url()).pathname;
      if (!/^\/malecon/.test(ruta)) return;
      cuadros.push(ruta);
      if (r.status() >= 400) rotos.push(`${r.status()} ${ruta}`);
    });
    await page.goto("/quepos/", { waitUntil: "load" });

    // Primer malecón: se dibuja un cuadro y al seguir bajando se dibuja otro distinto
    await bajarA(page, "#malecon-paseo", 0.2);
    await expect.poll(() => firmaLienzo(page, "#malecon-paseo"), { timeout: 15_000 }).toBeGreaterThan(0);
    const antes = await firmaLienzo(page, "#malecon-paseo");
    await bajarA(page, "#malecon-paseo", 0.6);
    await expect.poll(() => firmaLienzo(page, "#malecon-paseo"), { timeout: 15_000 }).not.toBe(antes);

    // Segundo malecón: llega hasta su último cuadro
    await bajarA(page, "#malecon-lateral", 1);
    await expect.poll(() => firmaLienzo(page, "#malecon-lateral"), { timeout: 15_000 }).toBeGreaterThan(0);
    const carpeta = esCelular(test.info().project.name) ? "malecon-2-mobile" : "malecon-2";
    await expect.poll(() => cuadros.includes(`/${carpeta}/frame_143.avif`), { timeout: 30_000 }).toBe(true);

    // Chrome lee AVIF: no debe pedir los WebP de respaldo
    expect(cuadros.filter((c) => c.endsWith(".webp"))).toEqual([]);
    expect(rotos).toEqual([]);
  });

  test("con reducir movimiento solo descarga el primer cuadro de cada animación", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    const cuadros: string[] = [];
    page.on("request", (r) => /^\/malecon/.test(new URL(r.url()).pathname) && cuadros.push(new URL(r.url()).pathname));
    await page.goto("/quepos/", { waitUntil: "load" });
    await bajarA(page, "#malecon-paseo", 0.5);
    await expect.poll(() => firmaLienzo(page, "#malecon-paseo"), { timeout: 15_000 }).toBeGreaterThan(0);
    await page.waitForTimeout(1000);
    expect(cuadros.every((c) => c.endsWith("/frame_001.avif"))).toBe(true);
    expect(cuadros).toHaveLength(2);
  });
});

test("el video de la galería no se descarga al abrir la página y carga al acercarse", async ({ page }) => {
  const videos: string[] = [];
  page.on("request", (r) => /\.(mp4|webm)$/.test(new URL(r.url()).pathname) && videos.push(r.url()));
  await page.goto("/queposgaleria/", { waitUntil: "load" });
  await page.waitForTimeout(1000);
  expect(videos, "no debe pedir el video al cargar").toEqual([]);

  const reproductor = page.getByRole("group", { name: "Reproductor de video" });
  await reproductor.scrollIntoViewIfNeeded();
  // Ya activo, baja lo suficiente para mostrar el primer cuadro y la duración
  await expect
    .poll(() => page.locator("#videos-quepos video").evaluate((v: HTMLVideoElement) => v.readyState), { timeout: 15_000 })
    .toBeGreaterThanOrEqual(1);
  await expect(page.locator("#videos-quepos video")).toHaveAttribute("preload", "metadata");

  // Todos los controles tienen nombre para los lectores de pantalla
  for (const nombre of ["Reproducir", "Retroceder 10 segundos", "Adelantar 10 segundos", "Silenciar", "Pantalla completa"]) {
    await expect(reproductor.getByRole("button", { name: nombre }).first()).toBeAttached();
  }
  await expect(reproductor.getByRole("slider", { name: "Posición del video" })).toBeAttached();
  await expect(reproductor.getByRole("slider", { name: "Volumen" })).toBeAttached();
});

test("el mapa de afiliados se dibuja con el worker de MapLibre del propio sitio", async ({ page, baseURL }) => {
  const workers: string[] = [];
  page.on("request", (r) => /maplibre-gl-worker/.test(r.url()) && workers.push(r.url()));
  await page.goto("/mapa-afiliados/");
  await expect(page.locator("canvas.maplibregl-canvas")).toBeVisible({ timeout: 15_000 });
  // Los marcadores de los afiliados aparecen sobre el mapa
  await expect(page.locator(".maplibregl-marker").first()).toBeVisible({ timeout: 15_000 });
  expect(workers.length).toBeGreaterThan(0);
  expect(workers.every((url) => url.startsWith(baseURL!))).toBe(true);
});

test("el FAQ de Quepos abre y cierra las respuestas", async ({ page }) => {
  await page.goto("/quepos/");
  const pregunta = page.getByRole("button", { name: "¿Es seguro visitar Quepos?" });
  await pregunta.scrollIntoViewIfNeeded();
  // Es un componente de React que se activa al verse (client:visible): se reintenta hasta que responde
  await expect(async () => {
    await pregunta.click();
    await expect(pregunta).toHaveAttribute("aria-expanded", "true", { timeout: 500 });
  }).toPass({ timeout: 10_000 });
  await expect(page.getByText("En caso de emergencia, llama al 911.")).toBeVisible();

  await pregunta.click();
  await expect(pregunta).toHaveAttribute("aria-expanded", "false");
});
