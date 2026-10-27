import type { NextConfig } from "next";

const getBackendTarget = (): string => {
  // Hirarki penentuan URL backend
  let target =
    process.env.NEXT_PUBLIC__WEB_API_URL ||
    process.env.WEB_API_URL ||
    process.env.NEXT_PUBLIC_WEB_API_URL ||
    "http://localhost:5000";

  // Hapus trailing slash di akhir URL
  target = target.replace(/\/+$/, "");

  // Paksa HTTPS jika bukan di localhost
  if (!target.includes("localhost") && target.startsWith("http://")) {
    target = target.replace("http://", "https://");
  }

  return target;
};

const backendTarget = getBackendTarget();

const nextConfig: NextConfig = {
  // Mode standalone untuk build Docker yang efisien
  output: "standalone",

  // Variabel lingkungan runtime
  env: {
    NEXT_PUBLIC_BACKEND_URL: backendTarget,
  },

  // Support import file .html di Next.js App Router terbaru (Turbopack)
  experimental: {
    turbo: {
      rules: {
        "*.html": {
          loaders: ["raw-loader"],
          as: "*.js",
        },
      },
    },
  },

  // Support import file .html saat build produksi (Webpack)
  webpack: (config) => {
    config.module.rules.push({
      test: /\.html$/,
      use: "raw-loader",
    });
    return config;
  },
};

export default nextConfig;
