/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@agentledger/shared", "@agentledger/db", "@agentledger/sdk"],
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  async rewrites() {
    // /demo shares the /app UI; session surface is scoped via al_surface cookie.
    return [
      { source: "/demo", destination: "/app" },
      { source: "/demo/:path*", destination: "/app/:path*" },
    ];
  },
};

export default nextConfig;
