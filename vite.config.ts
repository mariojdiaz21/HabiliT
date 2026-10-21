import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirige la entrada del servidor
    server: { entry: "server" },
  },
  // Forzar preset compatible con contenedores de Node/Bun (Render)
  nitro: {
    preset: "node-server",
  },
  server: {
    // Permitir acceso desde los dominios de Render
    allowedHosts: [
      "habilit.onrender.com",
      ".onrender.com",
    ],
  },
});

