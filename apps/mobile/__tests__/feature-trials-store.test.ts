import { describe, it, expect, beforeEach, vi } from "vitest";

// In-memory secure-store so the store can be imported without react-native /
// expo-secure-store (mirrors wedding-registry-web.test.ts's approach).
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

import { useFeatureTrialsStore } from "@/store/useFeatureTrialsStore";

const STORAGE_KEY = "wos_seen_features";
const reset = () => useFeatureTrialsStore.setState({ seen: {}, isLoaded: false });

describe("useFeatureTrialsStore", () => {
  beforeEach(() => {
    mem.clear();
    reset();
  });

  it("starts empty and not loaded", () => {
    const s = useFeatureTrialsStore.getState();
    expect(s.isLoaded).toBe(false);
    expect(s.hasSeen("guests")).toBe(false);
  });

  it("markSeen flips the flag and persists the key set as JSON", async () => {
    useFeatureTrialsStore.getState().markSeen("guests");
    expect(useFeatureTrialsStore.getState().hasSeen("guests")).toBe(true);
    // secureSet is fire-and-forget; let the microtask flush.
    await Promise.resolve();
    expect(JSON.parse(mem.get(STORAGE_KEY)!)).toEqual(["guests"]);

    useFeatureTrialsStore.getState().markSeen("budget");
    await Promise.resolve();
    expect(JSON.parse(mem.get(STORAGE_KEY)!).sort()).toEqual(["budget", "guests"]);
  });

  it("markSeen is idempotent (no duplicate keys)", async () => {
    const s = useFeatureTrialsStore.getState();
    s.markSeen("guests");
    s.markSeen("guests");
    await Promise.resolve();
    expect(JSON.parse(mem.get(STORAGE_KEY)!)).toEqual(["guests"]);
  });

  it("load() hydrates the seen set from storage", async () => {
    mem.set(STORAGE_KEY, JSON.stringify(["vendors", "planning"]));
    await useFeatureTrialsStore.getState().load();
    const s = useFeatureTrialsStore.getState();
    expect(s.isLoaded).toBe(true);
    expect(s.hasSeen("vendors")).toBe(true);
    expect(s.hasSeen("planning")).toBe(true);
    expect(s.hasSeen("guests")).toBe(false);
  });

  it("load() tolerates corrupt storage and still marks loaded", async () => {
    mem.set(STORAGE_KEY, "not json{");
    await useFeatureTrialsStore.getState().load();
    const s = useFeatureTrialsStore.getState();
    expect(s.isLoaded).toBe(true);
    expect(s.hasSeen("guests")).toBe(false);
  });
});
