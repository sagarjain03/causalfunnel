import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // public/demo/index.html is only served at /demo/index.html; demo links always use /demo.
  rewrites() {
    return [{ source: "/demo", destination: "/demo/index.html" }];
  },
  // tracker.js has a stable URL that customer sites embed, so keep its cache short: updates reach visitors within
  // 5 minutes. Our demo pages also load it as /tracker.js?v=N (bump N whenever tracker.js changes).
  headers() {
    return [{ source: "/tracker.js", headers: [{ key: "Cache-Control", value: "public, max-age=300" }] }];
  },
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
