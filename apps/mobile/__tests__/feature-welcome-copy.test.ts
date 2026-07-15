import { describe, it, expect } from "vitest";
import {
  FEATURE_WELCOME_KEYS,
  FEATURE_WELCOME_DEEPLINK_KEYS,
} from "@/lib/feature-welcome-keys";
import frWelcome from "@/i18n/locales/fr/welcome.json";
import enWelcome from "@/i18n/locales/en/welcome.json";

// Guards the first-visit welcome copy contract: every feature registered in
// FEATURE_WELCOME_KEYS must have complete copy in both locales, and a
// secondaryCta iff its primary CTA deep-links. Catches a new feature being
// added to the registry without wiring its i18n (which would render raw keys).

const BASE_KEYS = ["eyebrow", "title", "tagline", "bullet1", "bullet2", "bullet3", "primaryCta"];

const LOCALES = { fr: frWelcome, en: enWelcome } as const;

describe("feature welcome i18n copy", () => {
  it("exposes a shared close label in both locales", () => {
    for (const [lang, dict] of Object.entries(LOCALES)) {
      expect((dict as Record<string, unknown>).close, `${lang}.close`).toBeTypeOf("string");
    }
  });

  for (const key of FEATURE_WELCOME_KEYS) {
    const needsSecondary = FEATURE_WELCOME_DEEPLINK_KEYS.includes(key);
    const expectedKeys = [...BASE_KEYS, ...(needsSecondary ? ["secondaryCta"] : [])].sort();

    for (const [lang, dict] of Object.entries(LOCALES)) {
      it(`${lang}: "${key}" has exactly the expected copy keys`, () => {
        const block = (dict as unknown as Record<string, Record<string, string>>)[key];
        expect(block, `${lang}.${key} block`).toBeTypeOf("object");
        expect(Object.keys(block).sort()).toEqual(expectedKeys);
        for (const k of expectedKeys) {
          expect(block[k], `${lang}.${key}.${k}`).toBeTruthy();
        }
      });
    }
  }

  it("fr and en have identical key structure", () => {
    const shape = (dict: Record<string, unknown>) =>
      Object.fromEntries(
        Object.entries(dict).map(([k, v]) => [
          k,
          v && typeof v === "object" ? Object.keys(v as object).sort() : typeof v,
        ]),
      );
    expect(shape(frWelcome as Record<string, unknown>)).toEqual(shape(enWelcome as Record<string, unknown>));
  });
});
