import type { NextConfig } from "next";

const OPTIONAL_PEER_STUB = "./stubs/optional-peer.mjs";

const nextConfig: NextConfig = {
  reactCompiler: true,
  serverExternalPackages: ["solc"],
  experimental: {
    inlineCss: true,
  },
  turbopack: {
    resolveAlias: {
      "@x402/core/client": OPTIONAL_PEER_STUB,
      "@x402/evm": OPTIONAL_PEER_STUB,
      "@x402/evm/exact/client": OPTIONAL_PEER_STUB,
      "@x402/evm/upto/client": OPTIONAL_PEER_STUB,
      "@x402/svm/exact/client": OPTIONAL_PEER_STUB,
    },
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
