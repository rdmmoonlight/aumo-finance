import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const target = (env.PUBLIC_WEB_API_URL || "http://localhost:5000").replace(/\/+$/, "");
  return {
    plugins: [vue(), tailwindcss()],
    resolve: {
      alias: {
        "#": fileURLToPath(new URL("./src", import.meta.url)),
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    build: { outDir: "dist" },
    server: { port: 5174, proxy: { "/api": { target, changeOrigin: true, secure: false } } }, open: 'chrome',
  };
});