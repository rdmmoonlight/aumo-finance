import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import { defineConfig, loadEnv } from "vite";

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
  const env = loadEnv(mode, process.cwd(), "");
  const backendTarget = getBackendTarget(env);

  return {
    appType: "mpa", // biar Vite bisa baca .html sebagai entry
    plugins: [
      react(), // biarin aja kalau masih ada page React lain
      {
        name: "rewrite-root-to-landing",
        configureServer(server) {
          server.middlewares.use((req, _res, next) => {
            if (req.url === "/" || req.url === "") {
              req.url = "/index.html"; // <-- "/" akan serve file ini
            }
            next();
          });
        },
      },
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      port: 3000,
      proxy: {
        "/api": { target: backendTarget, changeOrigin: true, secure: false },
        "/auth": { target: backendTarget, changeOrigin: true, secure: false },
      },
    },
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, "index.html"), // entry "/"
        },
      },
    },
  };
});
