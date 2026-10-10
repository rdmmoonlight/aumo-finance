import react from "@vitejs/plugin-react";
import { glob } from "glob";
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

// Pindai semua file .html di root proyek dan subfoldernya (mengabaikan node_modules & dist)
const getHtmlEntries = () => {
  const htmlFiles = glob.sync("**/*.html", {
    cwd: __dirname,
    ignore: ["node_modules/**", "dist/**"],
  });

  return Object.fromEntries(
    htmlFiles.map((file) => {
      // Membuat key nama entry berdasarkan path file (misal: "about/index" atau "main")
      const entryName =
        file === "index.html" ? "main" : file.replace(/\.html$/, "");
      return [entryName, path.resolve(__dirname, file)];
    }),
  );
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const backendTarget = getBackendTarget(env);

  return {
    // Tetapkan root proyek ke folder utama tempat index.html berada
    root: __dirname,
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"), // Menghapus spasi berlebih pada alias
      },
    },
    build: {
      outDir: path.resolve(__dirname, "dist"),
      emptyOutDir: true,
      rollupOptions: {
        input: getHtmlEntries(), // Otomatis mendaftarkan semua file .html
      },
    },
  };
});
