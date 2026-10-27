// Pruebas de las páginas ya compiladas (dist/), servidas como en un hosting por herramientas/servidor-estatico.mjs.
// Uso: npm test (compila y prueba) · npx playwright test --project=celular · npx playwright show-report
// Usa el Google Chrome instalado en la computadora, así no hay que descargar navegadores.
import { defineConfig, devices } from "@playwright/test";

const PUERTO = 4330;

export default defineConfig({
  testDir: "pruebas",
  fullyParallel: true,
  reporter: [["list"], ["html", { open: "never", outputFolder: "informes-playwright" }]],
  outputDir: "resultados-playwright",
  use: {
    baseURL: `http://localhost:${PUERTO}`,
    channel: "chrome",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "escritorio", use: { ...devices["Desktop Chrome"], channel: "chrome", viewport: { width: 1440, height: 900 } } },
    { name: "celular", use: { ...devices["Pixel 7"], channel: "chrome" } },
  ],
  webServer: {
    command: `node herramientas/servidor-estatico.mjs ${PUERTO}`,
    url: `http://localhost:${PUERTO}`,
    reuseExistingServer: !process.env.CI,
  },
});
