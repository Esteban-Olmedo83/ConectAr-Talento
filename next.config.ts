import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      // pdf-parse loads a test file at module level — point it to a safe empty buffer
      config.resolve.alias['canvas'] = false
    }
    return config
  },
};

export default nextConfig;
