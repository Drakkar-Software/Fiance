import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    // No tests vendored/written yet for this package — don't fail the recursive `pnpm test`.
    passWithNoTests: true,
  },
});
