import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["__tests__/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
      "@fiance/sdk": path.resolve(__dirname, "../../packages/fiance-sdk/src/index.ts"),
      "expo-crypto": path.resolve(__dirname, "__tests__/mocks/expo-crypto.ts"),
    },
  },
});
