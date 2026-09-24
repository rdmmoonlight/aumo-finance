import path from "node:path";

export const aumoConfig = {
  envPrefix: ["WEB_"],

  get backendTarget() {
    let target =
      process.env.WEB_API_URL ||
      "http://localhost:5000";

    // Hapus trailing slash jika ada
    target = target.replace(/\/+$/, "");

    // Paksa HTTPS jika menembak server remote (Render/Production)
    if (!target.includes("localhost") && target.startsWith("http://")) {
      target = target.replace("http://", "https://");
    }

    return target;
  },

  alias: {
    "@": path.resolve(process.cwd(), "./src"),
  },

  // Konfigurasi domain gambar eksternal (Supabase Storage & Backend)
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co", // FIX: Menggunakan '**' agar mencakup seluruh subdomain Supabase
        port: "",
        pathname: "/**", // FIX: Diperluas agar mencakup /object/public/, /render/image/, dll.
      },
      {
        protocol: "https",
        hostname: "aumonext-api.onrender.com", // Jaga-jaga jika gambar disajikan langsung dari backend
        port: "",
        pathname: "/**",
      },
    ],
  },

  getRewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${this.backendTarget}/api/v1/:path*`,
      },
      {
        source: "/api/:path*",
        destination: `${this.backendTarget}/api/:path*`,
      },
    ];
  },

  // Menyambungkan rewrites ke dalam spesifikasi Next.js Config
  async rewrites() {
    return this.getRewrites();
  },
};

export default aumoConfig;
