import { reactRouter } from "@react-router/dev/vite";
import tailwind from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [reactRouter(), tailwind()],
  resolve: {
    alias: {
      "react-dom/server": "react-dom/server.node",
    },
  },
});
