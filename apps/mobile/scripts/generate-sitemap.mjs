#!/usr/bin/env node
/**
 * Writes dist/sitemap.xml and filters dist/llms.txt after `expo export`.
 * Uses vitest to load TS modules with path aliases; assertions live in
 * __tests__/generate-sitemap.test.ts and __tests__/generate-llms-txt.test.ts.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const result = spawnSync(
  "pnpm",
  ["exec", "vitest", "run", "__tests__/generate-sitemap.test.ts", "__tests__/generate-llms-txt.test.ts"],
  { cwd: appRoot, stdio: "inherit", env: process.env },
);

process.exit(result.status ?? (result.error ? 1 : 0));
