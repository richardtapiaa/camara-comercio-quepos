// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from "@tailwindcss/vite";


import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";


export default defineConfig({
  // Dominio del sitio: con él se generan la URL canónica, las de redes sociales (Layout.astro) y el sitemap
  site: "https://camaraquepos.com",

  devToolbar: {
    enabled: false,
  },

  build: {
    inlineStylesheets: "always",
  },

  vite: {
    plugins: [
      tailwindcss(),
    ],
  },

  // sitemap-index.xml para Google y Bing (robots.txt apunta a él)
  integrations: [react(), sitemap({ filter: (pagina) => !pagina.endsWith("/404/") })],
});