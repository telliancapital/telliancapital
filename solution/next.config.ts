import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: "standalone",
  /* Multi-Zones: this app is served on telliancapital.ch under /solutions
     (the main site rewrites /solutions/* to this deployment). Every page,
     /_next asset and API route therefore lives under /solutions; the app's
     own vercel.app root answers 404 by design — use .../solutions there. */
  basePath: "/solutions",
  experimental: {
    /* Global stylesheet inline instead of a render-blocking <link>. */
    inlineCss: true,
    /* Root layout under [lang] (server-side <html lang>) → app/global-not-found.tsx. */
    globalNotFound: true,
    serverActions: {
      allowedOrigins: ["telliancapital.ch", "www.telliancapital.ch"],
    },
  },
  turbopack: {
    root: path.resolve(__dirname),
  },
  async redirects() {
    /* Prefixed automatically: /solutions → /solutions/de. */
    return [{ source: "/", destination: "/de", permanent: true }];
  },
  async headers() {
    /* Optional per the deployment note: keep the app's own vercel.app
       address out of search results — only telliancapital.ch is public. */
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
};

export default nextConfig;
