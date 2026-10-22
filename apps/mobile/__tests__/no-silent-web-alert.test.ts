import { it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "fs";
import { join } from "path";

/**
 * react-native-web implements Alert as `static alert() {}` — a no-op. Every
 * Alert.alert in this app was therefore invisible on the web build: validation
 * messages said nothing, and choice dialogs never ran their callback, so the
 * action behind them silently did not happen.
 *
 * Toasts (@/lib/toast/sonner) and ConfirmSheet both work on every platform.
 * This test keeps Alert.alert from creeping back in.
 */

// Repo-relative: @fiance/ui ships React Native components too, so it can grow
// the same bug even though it has none today.
const ROOTS = [
  "apps/mobile/app",
  "apps/mobile/components",
  "apps/mobile/lib",
  "apps/mobile/store",
  "packages/fiance-ui/src",
  "packages/fiance-sdk/src",
];
const EXT = /\.(ts|tsx)$/;

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules") continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (EXT.test(entry)) out.push(full);
  }
  return out;
}

it("no source file calls Alert.alert — it is a silent no-op on web", () => {
  const base = join(__dirname, "..", "..", "..");
  const offenders: string[] = [];
  for (const root of ROOTS) {
    for (const file of walk(join(base, root))) {
      const src = readFileSync(file, "utf8");
      // Strip line comments so the explanatory notes left in place don't trip it.
      const code = src.replace(/^\s*(\/\/|\*).*$/gm, "");
      if (/\bAlert\s*\.\s*alert\s*\(/.test(code)) {
        offenders.push(file.slice(base.length + 1));
      }
    }
  }
  expect(
    offenders,
    `Alert.alert does nothing on react-native-web. Use toast.error() from @/lib/toast/sonner for a message, or ConfirmSheet for a choice.\nOffending files:\n${offenders.join("\n")}`,
  ).toEqual([]);
});
