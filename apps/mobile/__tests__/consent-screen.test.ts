import { describe, it, expect, beforeEach, vi } from "vitest";

// Repro for the stats consent screen (card B1). On master there is no consent
// store, so every assertion below fails. The screen must appear once after a
// first wedding is created or joined, and never for later weddings.

const mem = new Map<string, string>();
vi.mock("@/lib/secure-store", () => ({
  secureGet: vi.fn(async (k: string) => mem.get(k) ?? null),
  secureSet: vi.fn(async (k: string, v: string) => {
    mem.set(k, v);
  }),
  secureDelete: vi.fn(async (k: string) => {
    mem.delete(k);
  }),
}));

const sdk = vi.hoisted(() => ({
  optIn: vi.fn(async () => {}),
  optOut: vi.fn(async () => {}),
}));
vi.mock("@/lib/analytics", () => ({
  analytics: {
    optIn: sdk.optIn,
    optOut: sdk.optOut,
    getConsentStatus: () => "unknown",
  },
  initAnalytics: vi.fn(async () => {}),
}));

import {
  useStatsConsentStore,
  selectStatsPromptVisible,
  selectNavigationHeld,
} from "@/store/useStatsConsentStore";
import frConsent from "@/i18n/locales/fr/consent.json";
import enConsent from "@/i18n/locales/en/consent.json";

const STORAGE_KEY = "wos_stats_consent";

const resetStore = () =>
  useStatsConsentStore.setState({
    record: { answered: false, choice: null, unansweredDisplays: 0, pending: false },
    isLoaded: true,
    navHold: false,
    dismissed: false,
    displayCounted: false,
    unsaved: false,
  });

const flush = () => new Promise((r) => setTimeout(r, 0));

describe("stats consent prompt after first wedding", () => {
  beforeEach(() => {
    mem.clear();
    sdk.optIn.mockClear();
    sdk.optOut.mockClear();
    resetStore();
  });

  it("shows once after the first wedding is created, with no answer yet", () => {
    const s = useStatsConsentStore.getState();
    s.holdFirstWedding();
    expect(selectNavigationHeld(useStatsConsentStore.getState())).toBe(true);
    s.releaseFirstWedding(true);
    expect(selectStatsPromptVisible(useStatsConsentStore.getState())).toBe(true);
  });

  it("does not show for a second wedding", () => {
    useStatsConsentStore.getState().releaseFirstWedding(false);
    expect(selectStatsPromptVisible(useStatsConsentStore.getState())).toBe(false);
  });

  it("Oui opts in, persists the answer and hides the prompt", async () => {
    useStatsConsentStore.getState().releaseFirstWedding(true);
    await useStatsConsentStore.getState().answer("yes");
    await flush();
    expect(sdk.optIn).toHaveBeenCalledTimes(1);
    expect(sdk.optOut).not.toHaveBeenCalled();
    expect(JSON.parse(mem.get(STORAGE_KEY)!).choice).toBe("yes");
    expect(selectStatsPromptVisible(useStatsConsentStore.getState())).toBe(false);
  });

  it("Non opts out, persists the answer and hides the prompt", async () => {
    useStatsConsentStore.getState().releaseFirstWedding(true);
    await useStatsConsentStore.getState().answer("no");
    await flush();
    expect(sdk.optOut).toHaveBeenCalledTimes(1);
    expect(sdk.optIn).not.toHaveBeenCalled();
    expect(JSON.parse(mem.get(STORAGE_KEY)!).choice).toBe("no");
    expect(selectStatsPromptVisible(useStatsConsentStore.getState())).toBe(false);
  });

  it("Oui with a failed save stays opted out until the save succeeds", async () => {
    const { secureSet } = await import("@/lib/secure-store");
    useStatsConsentStore.getState().releaseFirstWedding(true);
    vi.mocked(secureSet).mockRejectedValueOnce(new Error("disk full"));
    await useStatsConsentStore.getState().answer("yes");
    expect(sdk.optIn).not.toHaveBeenCalled();
    expect(sdk.optOut).toHaveBeenCalled();
    await useStatsConsentStore.getState().retrySave();
    expect(sdk.optIn).toHaveBeenCalledTimes(1);
  });

  it("a back or dismiss without answer is not an answer and re-shows once at the next launch", async () => {
    useStatsConsentStore.getState().releaseFirstWedding(true);
    useStatsConsentStore.getState().countDisplay();
    useStatsConsentStore.getState().dismiss();
    await flush();
    expect(selectStatsPromptVisible(useStatsConsentStore.getState())).toBe(false);
    expect(JSON.parse(mem.get(STORAGE_KEY)!).answered).toBe(false);

    resetStore();
    await useStatsConsentStore.getState().load();
    expect(selectStatsPromptVisible(useStatsConsentStore.getState())).toBe(true);
    useStatsConsentStore.getState().countDisplay();
    useStatsConsentStore.getState().dismiss();
    await flush();

    resetStore();
    await useStatsConsentStore.getState().load();
    expect(selectStatsPromptVisible(useStatsConsentStore.getState())).toBe(false);
  });

  it("web with Global Privacy Control is treated as Non and never shows", async () => {
    vi.stubGlobal("navigator", { globalPrivacyControl: true });
    try {
      useStatsConsentStore.getState().releaseFirstWedding(true);
      resetStore();
      await useStatsConsentStore.getState().load();
      expect(selectStatsPromptVisible(useStatsConsentStore.getState())).toBe(false);
      expect(sdk.optOut).toHaveBeenCalled();
      expect(sdk.optIn).not.toHaveBeenCalled();
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("the copy matches the design table in both locales with no 'anonyme'", () => {
    expect(frConsent.question).toBe(
      "Aider à améliorer Fiancé (statistiques d'usage, sans contenu de votre mariage) ?",
    );
    expect(frConsent.detail).toBe(
      "Seulement l'usage de l'app : écrans ouverts, actions et erreurs. Jamais ce que vous saisissez.",
    );
    expect(frConsent.settingsHint).toBe(
      "Vous pourrez changer d'avis à tout moment dans Réglages → Statistiques.",
    );
    expect(frConsent.yes).toBe("Oui");
    expect(frConsent.no).toBe("Non");
    expect(enConsent.question).toBe("Help improve Fiancé (usage statistics, no content from your wedding)?");
    expect(enConsent.detail).toBe("Only how the app is used: screens opened, actions and errors. Never what you type.");
    expect(enConsent.settingsHint).toBe("You can change your mind at any time in Settings → Analytics.");
    expect(enConsent.yes).toBe("Yes");
    expect(enConsent.no).toBe("No");
    for (const text of [...Object.values(frConsent), ...Object.values(enConsent)]) {
      expect(text.toLowerCase()).not.toContain("anonym");
    }
  });
});
