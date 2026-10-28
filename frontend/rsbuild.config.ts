import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { tanstackRouter } from '@tanstack/router-plugin/rspack';

const getBackendTarget = (): string => {
  // Hirarki penentuan URL backend
  let target =
    process.env.PUBLIC_WEB_API_URL ||
    process.env.WEB_API_URL ||
    process.env.NEXT_PUBLIC_WEB_API_URL ||
    "http://localhost:5000";

  // Memastikan slash di akhir dihapus agar pemanggilan URL konsisten
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
  tools: {
    rspack: {
      node: {
        __dirname: false,
      },
      plugins: [
        tanstackRouter({
          target: 'react',
          autoCodeSplitting: true,
          routesDirectory: './src/routes',
          generatedRouteTree: './src/routeTree.gen.ts',
        }),
      ],
    },
  },

  // Menyuntikkan variabel runtime ke kode Client (bisa diakses via process.env.PUBLIC_BACKEND_URL)
  source: {
    define: {
      "process.env.PUBLIC_BACKEND_URL": JSON.stringify(backendTarget),
    },
  },

  // Pengganti output: "standalone" (Rsbuild menghasilkan build statis murni di folder dist/)
  output: {
    distPath: {
      root: "dist",
    },
  },

  // Opsional: Setup Proxy untuk Dev Server agar menghindari CORS saat development lokal
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