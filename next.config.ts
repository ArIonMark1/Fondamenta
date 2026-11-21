import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dev server: also trust requests from devices on the local network
  // (e.g. http://192.168.1.14:3000 from a phone). Without this, Next.js
  // blocks the HMR websocket for those hosts and the page never hydrates.
  // Dev-only: has no effect on `next build` / `next start`.
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*", "*.local"],
  images: {
    // AVIF is ~20–30% smaller than WebP; browsers without AVIF get WebP.
    formats: ["image/avif", "image/webp"],
    // Extra steps between 1080 and 1920 so a ~1300px slot doesn't jump to 1920.
    // Sources are at most 1920px wide (see scripts/optimize-images.mjs).
    deviceSizes: [640, 750, 828, 1080, 1280, 1440, 1600, 1920],
    // Allowed `quality` values (required list since Next.js 16).
    qualities: [50, 65, 75],
    // Static imports are content-hashed, so optimized copies can be cached long.
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
