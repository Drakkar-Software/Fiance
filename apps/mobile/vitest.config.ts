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
      "@fiance/ui/components": path.resolve(__dirname, "../../packages/fiance-ui/src/components/index.ts"),
      "@fiance/ui/theme": path.resolve(__dirname, "../../packages/fiance-ui/src/theme/index.ts"),
      "@fiance/ui/garden-theme": path.resolve(__dirname, "../../packages/fiance-ui/src/garden-theme.ts"),
      "@fiance/ui/utils/file-export": path.resolve(__dirname, "../../packages/fiance-ui/src/utils/file-export.ts"),
      "@fiance/ui/utils/app-lock": path.resolve(__dirname, "../../packages/fiance-ui/src/utils/app-lock.ts"),
      "@fiance/ui/utils/secure-store": path.resolve(__dirname, "../../packages/fiance-ui/src/utils/secure-store.ts"),
      "@fiance/ui/utils/kv-storage": path.resolve(__dirname, "../../packages/fiance-ui/src/utils/kv-storage.ts"),
      "@fiance/ui/utils/links": path.resolve(__dirname, "../../packages/fiance-ui/src/utils/links.ts"),
      "@fiance/ui/utils/pwa-install": path.resolve(__dirname, "../../packages/fiance-ui/src/utils/pwa-install.ts"),
      "@fiance/ui/utils/toast": path.resolve(__dirname, "../../packages/fiance-ui/src/utils/toast/sonner.ts"),
      "@fiance/ui": path.resolve(__dirname, "../../packages/fiance-ui/src/index.ts"),
      "expo-crypto": path.resolve(__dirname, "__tests__/mocks/expo-crypto.ts"),
    },
  },
});
