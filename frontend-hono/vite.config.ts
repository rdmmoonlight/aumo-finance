import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import { defineConfig, loadEnv } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper penentuan target proxy API
const getBackendTarget = (env: Record<string, string>) => {
  let target = env.VITE_WEB_API_URL || env.WEB_API_URL || "http://localhost:5000";

  // Konversi otomatis HTTP ke HTTPS jika target adalah server remote/production
  if (!target.includes("localhost") && target.startsWith("http://")) {
    target = target.replace("http://", "https://");
  }
  return target;
};

export default defineConfig(({ mode }) => {
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
      port: 3000,
      strictPort: true,
      proxy: {
        "/api": {
          target: backendTarget,
          changeOrigin: true,
          secure: false, // Memastikan proxy tidak error saat berinteraksi dengan HTTPS/self-signed cert
        },
      },
    },
    preview: {
      port: 3000,
      strictPort: true,
    },
    build: {
      outDir: "dist",
      emptyOutDir: true,
    },
  };
});