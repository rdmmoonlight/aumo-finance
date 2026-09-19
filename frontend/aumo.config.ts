import path from "node:path";

export const aumoConfig = {
  envPrefix: ["WEB_"],

  // Getter tunggal sebagai sumber kebenaran (source of truth) untuk URL Backend
  get backendTarget(): string {
    return (
      process.env.WEB_API_URL ||
      process.env.NEXT_PUBLIC_WEB_API_URL ||
      "http://localhost:5000"
    );
  },

  alias: {
    "@": path.resolve(process.cwd(), "./src"),
  },

  getRewrites() {
    return [
      {
        source: "/api/:path*",
        // Memanfaatkan getter backendTarget di atas
        destination: `${this.backendTarget}/api/:path*`,
      },
    ];
  },
};

export default aumoConfig;