import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { execFileSync } from "node:child_process";
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const SCRIPT = resolve(__dirname, "../scripts/check-i18n-parity.mjs");
const LOCALES = resolve(__dirname, "../i18n/locales");

function runParityCheck(localesDir: string) {
  try {
    const output = execFileSync(process.execPath, [SCRIPT, localesDir], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    return { code: 0, output };
  } catch (err) {
    const failure = err as { status: number | null; stderr: string };
    return { code: failure.status ?? 1, output: failure.stderr };
  }
}

function editJson(path: string, mutate: (data: Record<string, unknown>) => void) {
  const data = JSON.parse(readFileSync(path, "utf8")) as Record<string, unknown>;
  mutate(data);
  writeFileSync(path, JSON.stringify(data, null, 2));
}

describe("i18n FR/EN key parity", () => {
  let fixture: string;

  beforeEach(() => {
    fixture = mkdtempSync(join(tmpdir(), "i18n-parity-"));
    cpSync(LOCALES, fixture, { recursive: true });
  });

  afterEach(() => {
    rmSync(fixture, { recursive: true, force: true });
  });

  it("passes on the current FR/EN locales", () => {
    const result = runParityCheck(LOCALES);
    expect(result.code).toBe(0);
    expect(result.output).toContain("i18n FR/EN key parity OK");
  });

  it("fails when a top-level key is missing in EN", () => {
    editJson(join(fixture, "en", "common.json"), (data) => {
      delete data.save;
    });
    const result = runParityCheck(fixture);
    expect(result.code).toBe(1);
    expect(result.output).toContain("common:save is missing in en");
  });

  it("fails when a nested key is missing in FR", () => {
    editJson(join(fixture, "fr", "common.json"), (data) => {
      delete (data.tabs as Record<string, unknown>).home;
    });
    const result = runParityCheck(fixture);
    expect(result.code).toBe(1);
    expect(result.output).toContain("common:tabs.home is missing in fr");
  });

  it("fails when a namespace file exists in only one language", () => {
    rmSync(join(fixture, "en", "tips.json"));
    const result = runParityCheck(fixture);
    expect(result.code).toBe(1);
    expect(result.output).toContain("en/tips.json is missing");
  });
});
