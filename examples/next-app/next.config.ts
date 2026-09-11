import type { NextConfig } from "next";

const config: NextConfig = {
  // Built from source in the workspace; Next compiles it with the app.
  transpilePackages: ["@goya24/react", "@goya24/messenger"],
};

export default config;
