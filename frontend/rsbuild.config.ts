import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { TanStackRouterRspack } from "@tanstack/router-plugin/rspack";

const getBackendTarget = (): string => {
  // Hirarki penentuan URL backend dari environment variabel (Node.js level saat build/dev)
  let target =
    process.env.PUBLIC_WEB_API_URL ||
    process.env.WEB_API_URL ||
    process.env.PUBLIC_BACKEND_URL ||
    "http://localhost:5000";

  // Memastikan slash di akhir dihapus
  target = target.replace(/\/+$/, "");

  // Paksa HTTPS di lingkungan non-localhost jika URL masih HTTP
  if (!target.includes("localhost") && target.startsWith("http://")) {
    target = target.replace("http://", "https://");
  }

  return target;
};

const backendTarget = getBackendTarget();

export default defineConfig({
  plugins: [pluginReact()],
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["postcss-loader"],
        type: "css",
      },
    ],
  },
  tools: {
    rspack: {
      plugins: [
        TanStackRouterRspack({
          target: "react",
          autoCodeSplitting: true,
          routesDirectory: "./src/routes",
          generatedRouteTree: "./src/routeTree.gen.ts",
        }),
      ],
    },
  },

  source: {
    define: {
      "process.env": JSON.stringify({}),
      "process.env.PUBLIC_BACKEND_URL": JSON.stringify(backendTarget),
      "import.meta.env.PUBLIC_BACKEND_URL": JSON.stringify(backendTarget),
    },
  },

  output: {
    distPath: {
      root: "dist",
    },
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
});