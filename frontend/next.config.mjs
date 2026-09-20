import { aumoConfig } from "./aumo.config";

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  async rewrites() {
    return aumoConfig.getRewrites();
  },
};

export default nextConfig;
