import path from "node:path";

export const aumoConfig = {
  envPrefix: ["WEB_"],

  // Getter sebagai sumber kebenaran (source of truth) URL Backend tanpa manipulasi string otomatis
  get backendTarget(): string {
    return (
      process.env.WEB_API_URL ||
      process.env.NEXT_PUBLIC_WEB_API_URL ||
      "http://localhost:3000"
    );
  },

  alias: {
    "@": path.resolve(process.cwd(), "./src"),
  },

  getRewrites() {
    return [
      {
        // Menangani semua endpoint API V1 (misal: /api/v1/periods, /api/v1/auth, dll)
        source: "/api/v1/:path*",
        destination: `${this.backendTarget}/api/v1/:path*`,
      },
      {
        // Fallback untuk endpoint API tanpa prefix v1 jika ada
        source: "/api/:path*",
        destination: `${this.backendTarget}/api/:path*`,
      },
    ];
  },
};

export default aumoConfig;
