import { defineConfig, loadEnv } from "@rsbuild/core";
import { pluginVue } from "@rsbuild/plugin-vue";
import { fileURLToPath, URL } from "node:url";
import { pluginTailwindcss } from '@rsbuild/plugin-tailwindcss';

export default defineConfig(() => {
  const env = loadEnv().parsed;
  const target = (env.PUBLIC_API_BASE_URL || "https://aumoweb.onrender.com").replace(/\/+$/, "");

  return {
    plugins: [pluginVue(), pluginTailwindcss()],
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
