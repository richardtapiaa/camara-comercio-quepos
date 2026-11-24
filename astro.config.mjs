// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from "@tailwindcss/vite";


import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import comprobarFacebook from "./herramientas/comprobar-facebook.mjs";


export default defineConfig({
  site: "https://camaraquepos.com",

  devToolbar: {
    enabled: false,
  },

  build: {
    inlineStylesheets: "always",
  },

  image: {
    remotePatterns: [{ protocol: "https", hostname: "**.fbcdn.net" }],
  },

  vite: {
    plugins: [
      tailwindcss(),
    ],
  },

  integrations: [comprobarFacebook(), react(), sitemap({ filter: (pagina) => !pagina.endsWith("/404/") })],
});