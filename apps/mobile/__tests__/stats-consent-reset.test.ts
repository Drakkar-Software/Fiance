import { describe, it, expect, beforeEach, vi } from "vitest";

// Repro for the existing-install consent reset (card A0). On master, initAnalytics
// starts the analytics SDK without any reset: a stored opt-in keeps sending and the
// events queued before the update are flushed, so the reset cases fail there.

const env = vi.hoisted(() => {
  const platform = { OS: "ios" as "ios" | "web" };
  const asyncKv = new Map<string, string>();
  const secure = new Map<string, string>();
  return {
    platform,
    asyncKv,
    secure,
    failSecureSet: false,
    sent: [] as unknown[],
    instances: [] as { flush: () => Promise<void>; getConsentStatus: () => string }[],
    prefixedAsyncStorage: {
      read: async (key: string) => asyncKv.get(`sg_${key}`) ?? null,
      write: async (key: string, value: string) => {
        asyncKv.set(`sg_${key}`, value);
      },
      delete: async (key: string) => {
        asyncKv.delete(`sg_${key}`);
      },
    },
  };
});

vi.stubGlobal("__DEV__", false);

vi.mock("react-native", () => ({
  get Platform() {
    return env.platform;
  },
}));

vi.mock("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: async (k: string) => env.asyncKv.get(k) ?? null,
    setItem: async (k: string, v: string) => {
      env.asyncKv.set(k, v);
    },
    removeItem: async (k: string) => {
      env.asyncKv.delete(k);
    },
  },
}));

vi.mock("@/lib/secure-store", () => ({
  secureGet: vi.fn(async (k: string) => env.secure.get(k) ?? null),
  secureSet: vi.fn(async (k: string, v: string) => {
    if (env.failSecureSet) throw new Error("secure store unavailable");
    env.secure.set(k, v);
  }),
  secureDelete: vi.fn(async (k: string) => {
    env.secure.delete(k);
  }),
}));

vi.mock("@drakkar.software/dk-spaces-analytics-sdk", async () => {
  const core = await import("@drakkar.software/sunglasses-core");
  return {
    createTelemetryClient: () => core.createLazyClient(),
    createTelemetry: async (config: { defaultOptIn: boolean }) => {
      const client = await core.SunglassesCore.create({
        storage: env.prefixedAsyncStorage,
        adapters: [
          {
            send: async (batch: unknown) => {
              env.sent.push(batch);
            },
          },
        ],
        platform: "react-native",
        appName: "fiance-test",
        defaultOptIn: config.defaultOptIn,
        enableSessionTracking: false,
      });
      env.instances.push(client as never);
      return client as never;
    },
  };
});

const LEGACY_CONSENT = "sg_sg:consent";
const LEGACY_QUEUE = "sg_sg:queue";
const RECORD = "wos_stats_consent";

const legacy = (status: "opted-in" | "opted-out") =>
  JSON.stringify({ status, updatedAt: "2026-09-01T10:00:00.000Z", history: [] });

const queuedBeforeUpdate = JSON.stringify([
  {
    event: "home_opened",
    properties: {},
    timestamp: "2026-09-30T09:00:00.000Z",
    id: "pre-update-1",
  },
]);

const launch = async () => {
  delete (globalThis as Record<string, unknown>).__fiance_analytics_started__;
  vi.resetModules();
  const { initAnalytics } = await import("@/lib/analytics");
  await initAnalytics();
  return env.instances.at(-1);
};

const storedRecord = () => JSON.parse(env.secure.get(RECORD)!);

describe("existing install consent reset on the first launch after the update", () => {
  beforeEach(() => {
    env.asyncKv.clear();
    env.secure.clear();
    env.sent.length = 0;
    env.instances.length = 0;
    env.failSecureSet = false;
  });

  it("an install stored as opted-in starts non-consenting, unanswered, and sends nothing", async () => {
    env.asyncKv.set(LEGACY_CONSENT, legacy("opted-in"));
    env.asyncKv.set(LEGACY_QUEUE, queuedBeforeUpdate);

    const client = await launch();
    await client!.flush();

    expect(client!.getConsentStatus()).toBe("opted-out");
    expect(env.sent).toEqual([]);
    expect(env.asyncKv.has(LEGACY_QUEUE)).toBe(false);
    expect(storedRecord()).toEqual({ answered: false, choice: null, unansweredDisplays: 0, pending: false });
  });

  it("an explicit earlier opt-out stays off and counts as answered Non", async () => {
    env.asyncKv.set(LEGACY_CONSENT, legacy("opted-out"));
    env.asyncKv.set(LEGACY_QUEUE, queuedBeforeUpdate);

    const client = await launch();
    await client!.flush();

    expect(client!.getConsentStatus()).toBe("opted-out");
    expect(env.sent).toEqual([]);
    expect(storedRecord()).toEqual({ answered: true, choice: "no", unansweredDisplays: 0, pending: false });
  });

  it("a fresh install with nothing stored is unanswered and opted-out", async () => {
    const client = await launch();

    expect(client!.getConsentStatus()).toBe("opted-out");
    expect(storedRecord()).toEqual({ answered: false, choice: null, unansweredDisplays: 0, pending: false });
  });

  it("the reset runs once: a later launch keeps the stored record", async () => {
    env.asyncKv.set(LEGACY_CONSENT, legacy("opted-in"));
    await launch();
    env.secure.set(RECORD, JSON.stringify({ answered: false, choice: null, unansweredDisplays: 1, pending: true }));
    env.asyncKv.set(LEGACY_CONSENT, legacy("opted-out"));

    await launch();

    expect(storedRecord()).toEqual({ answered: false, choice: null, unansweredDisplays: 1, pending: true });
  });

  it("a recorded Oui is respected: the SDK stays opted-in", async () => {
    env.secure.set(RECORD, JSON.stringify({ answered: true, choice: "yes", unansweredDisplays: 0, pending: false }));
    env.asyncKv.set(LEGACY_CONSENT, legacy("opted-in"));

    const client = await launch();

    expect(client!.getConsentStatus()).toBe("opted-in");
    expect(storedRecord().choice).toBe("yes");
  });

  it("on web, an earlier opt-out kept in localStorage counts as answered Non", async () => {
    const webStorage = new Map<string, string>([[LEGACY_CONSENT, legacy("opted-out")]]);
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => webStorage.get(k) ?? null,
      setItem: (k: string, v: string) => {
        webStorage.set(k, v);
      },
      removeItem: (k: string) => {
        webStorage.delete(k);
      },
    });
    env.platform.OS = "web";
    try {
      const client = await launch();

      expect(client!.getConsentStatus()).toBe("opted-out");
      expect(storedRecord()).toEqual({ answered: true, choice: "no", unansweredDisplays: 0, pending: false });
    } finally {
      env.platform.OS = "ios";
      vi.unstubAllGlobals();
      vi.stubGlobal("__DEV__", false);
    }
  });

  it("if the record cannot be written, the SDK never starts this launch", async () => {
    env.asyncKv.set(LEGACY_CONSENT, legacy("opted-in"));
    env.asyncKv.set(LEGACY_QUEUE, queuedBeforeUpdate);
    env.failSecureSet = true;

    const client = await launch();

    expect(client).toBeUndefined();
    expect(env.instances).toHaveLength(0);
    expect(env.sent).toEqual([]);
  });
});
