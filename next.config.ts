import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Increase body size limit for Server Actions to support image uploads
  // Default is 1 MB; 5 MB allows up to 5 compressed images per wish
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
  // Cloudflare Pages doesn't include sharp; disable image optimization
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
