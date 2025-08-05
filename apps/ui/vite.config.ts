import { reactRouter } from "@react-router/dev/vite";
import tailwind from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [reactRouter(), tailwind()],
  ssr: {
    external: ["react-dom/server"],
  },
  build: {
    target: "esnext", // or 'node16' if Node
  },
  server: {
    port: 3000,
    hmr: {
      host: "localhost",
      overlay: false,
    },
  },
  resolve: {
    alias: {
      // "react-dom/server": "react-dom/server.node",
    },
  },
});
