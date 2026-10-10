import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import { defineConfig, loadEnv } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getBackendTarget = (env: Record<string, string>) => {
  let t = env.VITE_WEB_API_URL || env.WEB_API_URL || "http://localhost:5000";
  if (!t.includes("localhost") && t.startsWith("http://"))
    t = t.replace("http://", "https://");
  return t;
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const backendTarget = getBackendTarget(env);

  return {
    // Tentukan root direktori ke folder src
    root: path.resolve(__dirname, "src"),
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      // Karena root pindah ke /src, kembalikan lokasi outDir build ke level root proyek
      outDir: path.resolve(__dirname, "dist"),
      emptyOutDir: true,
      rollupOptions: {
        input: {
          // Arahkan entry point HTML ke src/index.html
          main: path.resolve(__dirname, "src/index.html"),
        },
      },
    },
  };
});
