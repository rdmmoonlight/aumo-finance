import { aumoConfig } from "./aumo.config.ts";

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  async rewrites() {
    return aumoConfig.getRewrites();
  },
  cacheComponents: true,
};

export default nextConfig;
