import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  server: {
    // Permite que Render y cualquier subdominio externo accedan al servidor en producción
    allowedHosts: [
      'habilit.onrender.com',
      '.onrender.com'
    ]
  },
});

