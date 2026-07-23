import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: process.cwd(),
  output: "export",
  distDir: "dist",
};

export default nextConfig;
