// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from "@tailwindcss/vite";


import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";


export default defineConfig({
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

  integrations: [react(), sitemap({ filter: (pagina) => !pagina.endsWith("/404/") })],
});