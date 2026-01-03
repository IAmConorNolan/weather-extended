import { defineConfig } from "vite";
import { resolve } from "path";
import react from "@vitejs/plugin-react";
import glsl from "vite-plugin-glsl";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/weather-extended/",
  plugins: [react(), glsl()],
  build: {
    assetsInlineLimit: 0,
    rollupOptions: {
      input: {
        menu: resolve(__dirname, "menu.html"),
        background: resolve(__dirname, "background.html"),
      },
    },
  },
  server: {
    cors: {
      origin: "https://www.owlbear.rodeo",
    },
  },
});
