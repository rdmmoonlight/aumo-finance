import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import { defineConfig, loadEnv } from "vite";

// Mengakomodasi __dirname jika import.meta.dirname belum tersedia di versi Node.js tertentu
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getBackendTarget = (env: Record<string, string>): string => {
  let target =
    env.VITE_WEB_API_URL ||
    env.WEB_API_URL ||
    process.env.VITE_WEB_API_URL ||
    process.env.WEB_API_URL ||
    "http://localhost:5000";

  if (!target.includes("localhost") && target.startsWith("http://")) {
    target = target.replace("http://", "https://");
  }

  return target;
};

export default defineConfig(({ mode }) => {
  // Argumentasi ketiga `""` memuat semua env (termasuk tanpa awalan VITE_)
  const env = loadEnv(mode, process.cwd(), "");
  const backendTarget = getBackendTarget(env);

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      port: 5173,
      proxy: {
        "/api": {
          target: backendTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});