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
  experimental: {
    /* The one global stylesheet (~11 KB) goes into the HTML instead of a
       render-blocking <link>; first-time visitors (and crawlers) are the
       ones that matter for first paint. */
    inlineCss: true,
    /* Two root layouts ((de)/(en) for <html lang>) → app/global-not-found.tsx. */
    globalNotFound: true,
  },
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
  async headers() {
    /* Same as the Solutions app: keep the vercel.app / preview addresses out
       of search results — only telliancapital.ch is public. */
    return [
      {
        /* Content-hashed font files (src/styles/fonts.css). */
        source: "/fonts/:file*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        /* Only the *.vercel.app deployment addresses — never localhost, the
           real domain (with or without www), or requests the main site
           forwards for telliancapital.ch/solutions (Multi-Zones rewrite). */
        source: "/:path*",
        has: [{ type: "host", value: "(?<deployment>.+)\\.vercel\\.app" }],
        missing: [{ type: "header", key: "x-forwarded-host", value: "(www\\.)?telliancapital\\.ch" }],
        headers: [{ key: "X-Robots-Tag", value: "noindex" }],
      },
    ];
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
