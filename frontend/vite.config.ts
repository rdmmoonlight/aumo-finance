import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import checker from "vite-plugin-checker";

const getBackendTarget = (env: Record<string, string>): string => {
  let target =
    env.PUBLIC_WEB_API_URL ||
    env.WEB_API_URL ||
    env.PUBLIC_BACKEND_URL ||
    process.env.PUBLIC_WEB_API_URL ||
    process.env.WEB_API_URL ||
    process.env.PUBLIC_BACKEND_URL ||
    "http://localhost:5000";

  target = target.replace(/\/+$/, "");

  if (!target.includes("localhost") && target.startsWith("http://")) {
    target = target.replace("http://", "https://");
  }

  return target;
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const backendTarget = getBackendTarget(env);

  return {
    plugins: [
      tanstackRouter({
        target: "react",
        autoCodeSplitting: true,
        routesDirectory: "./src/routes",
        generatedRouteTree: "./src/routeTree.gen.ts",
      }),
      react(),
      checker({ typescript: true }),
    ],
    define: {
      "process.env.PUBLIC_BACKEND_URL": JSON.stringify(backendTarget),
      "import.meta.env.PUBLIC_BACKEND_URL": JSON.stringify(backendTarget),
    },
    build: {
      outDir: "dist",
    },
    server: {
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
