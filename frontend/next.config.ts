import type { NextConfig } from "next";

// Helper untuk mendapatkan URL backend yang bersih dan terformat
const getBackendTarget = (): string => {
  let target =
    process.env.WEB_API_URL ||
    process.env.NEXT_PUBLIC_WEB_API_URL ||
    "http://localhost:5000";

  // Hapus trailing slash jika ada
  target = target.replace(/\/+$/, "");

  // Paksa HTTPS jika menembak server remote (Production / Render)
  if (!target.includes("localhost") && target.startsWith("http://")) {
    target = target.replace("http://", "https://");
  }

  return target;
};

const backendTarget = getBackendTarget();

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${backendTarget}/api/v1/:path*`,
      },
      {
        source: "/api/:path*",
        destination: `${backendTarget}/api/:path*`,
      },
    ];
  },
  experimental: {
    cacheComponents: true,
  },
};

export default nextConfig;
