// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from "@tailwindcss/vite";


import react from "@astrojs/react";


export default defineConfig({
  devToolbar: {
    enabled: false,
  },

  // El CSS de cada página va dentro del HTML: son unos 20 KB y así el navegador no espera otros archivos para dibujar
  build: {
    inlineStylesheets: "always",
  },

  vite: {
    plugins: [
      tailwindcss(),
    ],
  },

  integrations: [react()],
});