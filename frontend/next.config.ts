import type { NextConfig } from "next";

const getBackendTarget = (): string => {
  // Hirarki penentuan URL backend (Render env vars / fallback)
  let target =
    process.env.NEXT_PUBLIC__WEB_API_URL ||
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

const nextConfig: NextConfig = {
  // Diperlukan agar Dockerfile bisa membungkus Next.js menjadi paket standalone yang ringan
  output: "standalone",

  // Mengekspos hasil kalkulasi backendTarget ke runtime Next.js (Client & Server)
  env: {
    NEXT_PUBLIC_BACKEND_URL: backendTarget,
  },
};

export default nextConfig;