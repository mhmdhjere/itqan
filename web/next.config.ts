import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["10.0.0.5"],
  experimental: {
    serverActions: {
      allowedOrigins: ["10.0.0.5:3000", "localhost:3000"],
    },
  },
};

export default nextConfig;