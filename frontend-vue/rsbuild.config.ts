import { defineConfig, loadEnv } from "@rsbuild/core";
import { pluginVue } from "@rsbuild/plugin-vue";
import { fileURLToPath, URL } from "node:url";

export default defineConfig(() => {
  const env = loadEnv().parsed;
  const target = (env.PUBLIC_WEB_API_URL || "http://localhost:5000").replace(/\/+$/, "");

  return {
    plugins: [pluginVue()],
    html: {
      template: './index.html',
    },
    source: {
      entry: {
        index: './src/main.ts',
      },
    },
    resolve: {
      alias: {
        "#": fileURLToPath(new URL("./src", import.meta.url)),
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    output: {
      distPath: {
        root: "dist",
      },
    },
    server: {
      port: 5174,
      open: true,
      proxy: {
        "/api": {
          target,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});