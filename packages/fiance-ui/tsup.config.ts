import { defineConfig } from "tsup";

export default defineConfig({
  // Transpile every TS/TSX file individually (no bundling).
  // Each src/**/*.ts(x) → dist/**/*.js, preserving directory structure.
  entry: ["src/**/*.ts", "src/**/*.tsx"],
  format: ["esm"],
  // No bundling — imports stay as-is (consumers' bundlers resolve them).
  bundle: false,
  // DTS is generated separately via `tsc --emitDeclarationOnly` so that
  // type errors don't block the JS build.
  dts: false,
  outDir: "dist",
  clean: true,
  // Pass JSX through react-jsx transform (matches tsconfig jsx setting).
  esbuildOptions(options) {
    options.jsx = "automatic";
  },
});
