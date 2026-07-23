/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@agentledger/shared", "@agentledger/db", "@agentledger/sdk"],
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

export default nextConfig;
