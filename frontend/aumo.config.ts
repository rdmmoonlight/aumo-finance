import path from "node:path";

export const aumoConfig = {
  envPrefix: ["WEB_"],

  get backendTarget(): string {
    let target =
      process.env.WEB_API_URL ||
      process.env.NEXT_PUBLIC_WEB_API_URL ||
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
};

export default aumoConfig;
      
