import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: "standalone",
  turbopack: {
    root: path.resolve(__dirname),
  },
  async redirects() {
    return [{ source: "/", destination: "/de", permanent: true }];
  },
};

export default nextConfig;
