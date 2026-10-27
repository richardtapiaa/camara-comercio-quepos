// Cada página carga sin errores, sin recursos rotos, con su SEO básico y sin desbordarse a lo ancho
import { expect, test } from "@playwright/test";

const PAGINAS = [
  "/",
  "/afiliados/",
  "/bolsa-de-empleo/",
  "/capacitaciones/",
  "/contacto/",
  "/hospitalidad/",
  "/mapa-afiliados/",
  "/quepos/",
  "/queposgaleria/",
  "/unete/",
  "/visitenos/",
];

for (const ruta of PAGINAS) {
  test(`${ruta} carga bien y tiene su SEO`, async ({ page, baseURL }) => {
    const errores: string[] = [];
    page.on("pageerror", (error) => errores.push(error.message));
    page.on("console", (mensaje) => mensaje.type() === "error" && errores.push(mensaje.text()));
    const rotos: string[] = [];
    page.on("response", (r) => r.status() >= 400 && r.url().startsWith(baseURL!) && rotos.push(`${r.status()} ${r.url()}`));

    const respuesta = await page.goto(ruta, { waitUntil: "load" });
    expect(respuesta?.status()).toBe(200);

    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page).toHaveTitle(/Quepos/);
    const descripcion = await page.locator('meta[name="description"]').getAttribute("content");
    expect(descripcion?.length ?? 0).toBeGreaterThan(50);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://camaraquepos.com${ruta}`);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      "content",
      /^https:\/\/camaraquepos\.com\/_astro\/.+\.jpg$/,
    );
    await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
    // Todas las imágenes con alt (vacío en las decorativas)
    await expect(page.locator("img:not([alt])")).toHaveCount(0);

    const desborde = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(desborde, "la página no debe tener scroll horizontal").toBeLessThanOrEqual(0);

    expect(errores, "errores en la consola").toEqual([]);
    expect(rotos, "recursos que no cargaron").toEqual([]);
  });
}

test("la 404 responde 404 y no se indexa", async ({ page }) => {
  const respuesta = await page.goto("/esta-pagina-no-existe/");
  expect(respuesta?.status()).toBe(404);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex");
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
});

test("robots.txt y el sitemap incluyen todas las páginas", async ({ request }) => {
  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toContain("Sitemap: https://camaraquepos.com/sitemap-index.xml");

  const indice = await (await request.get("/sitemap-index.xml")).text();
  expect(indice).toContain("https://camaraquepos.com/sitemap-0.xml");
  const sitemap = await (await request.get("/sitemap-0.xml")).text();
  for (const ruta of PAGINAS) expect(sitemap).toContain(`<loc>https://camaraquepos.com${ruta}</loc>`);
  expect(sitemap).not.toContain("404");
});

test("el inicio tiene los datos estructurados de la Cámara", async ({ page }) => {
  await page.goto("/");
  const json = await page.locator('script[type="application/ld+json"]').textContent();
  const datos = JSON.parse(json!);
  const organizacion = datos["@graph"].find((nodo: { "@type": string }) => nodo["@type"] === "Organization");
  expect(organizacion.name).toBe("Cámara de Comercio, Industria y Turismo de Quepos");
  expect(organizacion.logo).toMatch(/^https:\/\/camaraquepos\.com\/_astro\/.+\.png$/);
  expect(organizacion.telephone).toBeTruthy();
});
