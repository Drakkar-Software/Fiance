import { describe, it, expect, beforeEach, vi } from "vitest";

// Repro for the post-update consent screen (card B2). An existing install that
// has never answered must see the screen once on Home with nothing else open,
// never elsewhere, never after an answer, and at most twice without an answer.

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

import { useStatsConsentStore, selectStatsPromptVisible } from "@/store/useStatsConsentStore";

const STORAGE_KEY = "wos_stats_consent";

const onHome = {
  ready: true,
  onHome: true,
  welcomeDone: true,
  paywallOpen: false,
  navigationHeld: false,
};

const flush = () => new Promise((r) => setTimeout(r, 0));

const resetStore = () =>
  useStatsConsentStore.setState({
    record: { answered: false, choice: null, unansweredDisplays: 0, pending: false },
    isLoaded: false,
    navHold: false,
    presentation: null,
    shownThisSession: false,
    dismissed: false,
    unsaved: false,
  });

const visibleOnHome = () => selectStatsPromptVisible(useStatsConsentStore.getState());

describe("post-update consent screen on Home", () => {
  beforeEach(() => {
    mem.clear();
    sdk.optIn.mockClear();
    sdk.optOut.mockClear();
    resetStore();
  });

  it("shows for an existing install with no stored answer when the user reaches Home", async () => {
    await useStatsConsentStore.getState().load();
    expect(visibleOnHome()).toBe(false);
    useStatsConsentStore.getState().considerHome(onHome);
    expect(visibleOnHome()).toBe(true);
    expect(useStatsConsentStore.getState().presentation).toBe("home-update");
  });

  it("does not show anywhere other than Home", async () => {
    await useStatsConsentStore.getState().load();
    useStatsConsentStore.getState().considerHome({ ...onHome, onHome: false });
    expect(visibleOnHome()).toBe(false);
    useStatsConsentStore.getState().considerHome(onHome);
    expect(visibleOnHome()).toBe(true);
  });

  it("waits for the Home welcome, the paywall and any navigation hold", async () => {
    await useStatsConsentStore.getState().load();
    useStatsConsentStore.getState().considerHome({ ...onHome, welcomeDone: false });
    expect(visibleOnHome()).toBe(false);
    useStatsConsentStore.getState().considerHome({ ...onHome, paywallOpen: true });
    expect(visibleOnHome()).toBe(false);
    useStatsConsentStore.getState().considerHome({ ...onHome, navigationHeld: true });
    expect(visibleOnHome()).toBe(false);
    useStatsConsentStore.getState().considerHome(onHome);
    expect(visibleOnHome()).toBe(true);
  });

  it("does nothing before the store has loaded", () => {
    useStatsConsentStore.getState().considerHome({ ...onHome, ready: false });
    expect(visibleOnHome()).toBe(false);
  });

  it("is shown once per session, counted once", async () => {
    await useStatsConsentStore.getState().load();
    useStatsConsentStore.getState().considerHome(onHome);
    useStatsConsentStore.getState().considerHome(onHome);
    expect(useStatsConsentStore.getState().record.unansweredDisplays).toBe(1);
  });

  it("never shows for an install that already answered", async () => {
    mem.set(STORAGE_KEY, JSON.stringify({ answered: true, choice: "no", unansweredDisplays: 0, pending: false }));
    await useStatsConsentStore.getState().load();
    useStatsConsentStore.getState().considerHome(onHome);
    expect(visibleOnHome()).toBe(false);
  });

  it("never shows for a browser privacy signal, which is an answer of Non", async () => {
    vi.stubGlobal("navigator", { globalPrivacyControl: true });
    try {
      await useStatsConsentStore.getState().load();
      useStatsConsentStore.getState().considerHome(onHome);
      expect(visibleOnHome()).toBe(false);
      expect(sdk.optIn).not.toHaveBeenCalled();
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("dismissing without an answer counts as no answer and re-shows once at the next launch", async () => {
    await useStatsConsentStore.getState().load();
    useStatsConsentStore.getState().considerHome(onHome);
    useStatsConsentStore.getState().dismiss();
    await flush();
    expect(visibleOnHome()).toBe(false);
    expect(JSON.parse(mem.get(STORAGE_KEY)!)).toMatchObject({ answered: false, unansweredDisplays: 1 });

    resetStore();
    await useStatsConsentStore.getState().load();
    useStatsConsentStore.getState().considerHome(onHome);
    expect(visibleOnHome()).toBe(true);
    useStatsConsentStore.getState().dismiss();
    await flush();
    expect(JSON.parse(mem.get(STORAGE_KEY)!)).toMatchObject({ answered: false, unansweredDisplays: 2 });
  });

  it("does not show after 2 unanswered displays on the Home trigger", async () => {
    mem.set(STORAGE_KEY, JSON.stringify({ answered: false, choice: null, unansweredDisplays: 2, pending: true }));
    await useStatsConsentStore.getState().load();
    useStatsConsentStore.getState().considerHome(onHome);
    expect(visibleOnHome()).toBe(false);
    expect(JSON.parse(mem.get(STORAGE_KEY)!).unansweredDisplays).toBe(2);
  });

  it("an app killed while the screen is up counts as no answer and shows again at the next launch", async () => {
    await useStatsConsentStore.getState().load();
    useStatsConsentStore.getState().considerHome(onHome);
    await flush();
    resetStore();
    await useStatsConsentStore.getState().load();
    useStatsConsentStore.getState().considerHome(onHome);
    expect(visibleOnHome()).toBe(true);
    expect(JSON.parse(mem.get(STORAGE_KEY)!).unansweredDisplays).toBe(2);
  });

  it("an answer on Home hides the screen and it never shows again", async () => {
    await useStatsConsentStore.getState().load();
    useStatsConsentStore.getState().considerHome(onHome);
    await useStatsConsentStore.getState().answer("yes");
    await flush();
    expect(visibleOnHome()).toBe(false);
    resetStore();
    await useStatsConsentStore.getState().load();
    useStatsConsentStore.getState().considerHome(onHome);
    expect(visibleOnHome()).toBe(false);
    expect(sdk.optIn).toHaveBeenCalledTimes(1);
  });
});
