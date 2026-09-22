import type { NextConfig } from "next";

// GitHub Pages serves the site from /<repo-name>/; the deploy workflow sets this.
// Local dev and other hosts leave it unset and serve from the root.
const basePath = process.env.PAGES_BASE_PATH || undefined;

const nextConfig: NextConfig = {
  // The demo is fully client-side, so it builds to plain static files (./out).
  output: "export",
  basePath,
  // A stray lockfile in the home directory otherwise makes Turbopack guess the wrong root.
  turbopack: { root: __dirname },
};

export default nextConfig;
