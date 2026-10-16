import type { NextConfig } from "next";

/* Multi-Zones (see scripts/Telliancapital.ch One Domain, Three Apps.md):
   this project owns telliancapital.ch and forwards /solutions to the
   Solutions Vercel project. SOLUTIONS_URL = that project's own URL,
   e.g. https://solution-telliancapital.vercel.app (local: http://localhost:3100).
   Unset → no rewrite, /solutions simply does not exist here. */
const SOLUTIONS_URL = (() => {
  /* Vercel stores the dashboard value literally: strip stray quotes and a
     trailing slash, and add https:// if the scheme was left out — Next
     refuses rewrite destinations that don't start with "/" or http(s)://. */
  const raw = (process.env.SOLUTIONS_URL ?? "").trim().replace(/^["']|["']$/g, "").replace(/\/+$/, "");
  if (!raw) return undefined;
  return /^https?:\/\//.test(raw) ? raw : `https://${raw}`;
})();

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "api.mapbox.com" },
    ],
  },
  env: {
    NEXT_PUBLIC_MAPBOX_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
  },
  async redirects() {
    return [{ source: "/", destination: "/de", permanent: true }];
  },
  async rewrites() {
    if (!SOLUTIONS_URL) return { beforeFiles: [] };
    return {
      /* beforeFiles: runs before this app's own routes, so the dynamic
         /[lang] page can never catch /solutions first. Two rules: the bare
         path and everything under it (pages, /solutions/_next/*, /solutions/api/*). */
      beforeFiles: [
        { source: "/solutions", destination: `${SOLUTIONS_URL}/solutions` },
        { source: "/solutions/:path*", destination: `${SOLUTIONS_URL}/solutions/:path*` },
      ],
    };
  },
};

export default nextConfig;
