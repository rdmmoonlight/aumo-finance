import path from "node:path";

export const aumoConfig = {
  envPrefix: ["WEB_"],

  // Getter sebagai sumber kebenaran (source of truth) URL Backend
  get backendTarget(): string {
    const target =
      process.env.WEB_API_URL ||
      process.env.NEXT_PUBLIC_WEB_API_URL ||
      "http://localhost:5000";

    return target;
  },

  alias: {
    "@": path.resolve(process.cwd(), "./src"),
  },

  getRewrites() {
    return [
      {
        // Menangani semua endpoint API V1
        source: "/api/v1/:path*",
        destination: `${this.backendTarget}/api/v1/:path*`,
      },
      {
        // Fallback untuk endpoint API tanpa prefix v1
        source: "/api/:path*",
        destination: `${this.backendTarget}/api/:path*`,
      },
    ];
  },
};

export default aumoConfig;
