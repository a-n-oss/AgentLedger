import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    exclude: ["tests/**", "node_modules/**", ".next/**"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@agentledger/shared": path.resolve(__dirname, "../../packages/shared/src/index.ts"),
      "@agentledger/sdk": path.resolve(__dirname, "../../packages/sdk/src/index.ts"),
    },
  },
});
