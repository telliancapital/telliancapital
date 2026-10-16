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
        source: "/:path*",
        missing: [{ type: "host", value: "telliancapital.ch" }],
        headers: [{ key: "X-Robots-Tag", value: "noindex" }],
      },
    ];
  },
};

export default nextConfig;
