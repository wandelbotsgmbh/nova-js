import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

  // Workaround for hosting under a subpath as required for
  // deployment on NOVA OS cells
  //
  // This is needed with nextjs as the config file is only evaluated at
  // build time, but the base path on NOVA is set by a runtime environment
  // variable. See scripts/entrypoint.sh for how this is handled
  //
  // https://github.com/vercel/next.js/discussions/16059
  basePath:
    process.env.NODE_ENV === "production"
      ? "/__REPLACE_ME_BASE_PATH__"
      : process.env.BASE_PATH || "",

  // Little dev niceness thing, redirect from / to base path
  redirects() {
    return process.env.NODE_ENV === "development" && process.env.BASE_PATH
      ? [
          {
            source: "/",
            destination: process.env.BASE_PATH,
            basePath: false,
            permanent: false,
          },
        ]
      : [];
  },

  typescript: {
    // Type errors should be checked as a separate build step to nextjs
    // using `pnpm run tsc`
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
