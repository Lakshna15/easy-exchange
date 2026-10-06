import type { NextConfig } from "next";

// Cache Components is off on purpose: every page depends on the session or on live listings,
// so pages render at request time (docs/PLAN.md, decision "Next.js caching model").
const nextConfig: NextConfig = {
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
