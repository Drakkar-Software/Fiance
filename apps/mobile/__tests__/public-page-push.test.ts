/**
 * The public page does not re-push for nothing.
 *
 * This file exists because of a loop measured in production: 120 req/min with
 * nobody at the screen. pushPublicPageContent wrote on every call, including
 * when nothing had changed; the write emitted an event, the event triggered a
 * hydration, and the hydration called the push again.
 *
 * Three things are checked, and the third is what separates a fix from the
 * illusion of one: an identical document does not write; a genuinely changed
 * one always does; and a changed timestamp alone does NOT trigger a write —
 * including on the second push of a session, where handle.push calls its
 * mutator with cur = null (makeHandle's fast path, warm document cache). That
 * is exactly the hole a naive guard would leave open.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("react-native", () => ({ Platform: { OS: "web" } }));
vi.mock("@/lib/premium", () => ({ isPremium: () => false }));
vi.mock("@/lib/seo-urls", () => ({ BASE_URL: "https://exemple.test" }));
vi.mock("@/lib/index-lock", () => ({
  withIndexLock: (_id: string, fn: () => unknown) => fn(),
}));

// ─── Stores ──────────────────────────────────────────────────────────────────
// dayOfItems is reassigned by reference on each simulated hydration, as
// hydrateFromSpace does: that is half of the original bug.
let dayOfItems: Record<string, unknown>[] = [];
let wedding: Record<string, unknown> | null = {
  partner1Name: "Adrien",
  partner2Name: "Emma",
  weddingDate: "2027-06-12",
  venueName: "Le Domaine",
  description: null,
  faq: null,
};

vi.mock("@/store/useWeddingStore", () => ({
  useWeddingStore: { getState: () => ({ wedding }) },
}));
vi.mock("@/store/usePlanningStore", () => ({
  usePlanningStore: { getState: () => ({ dayOfItems }) },
}));
vi.mock("@/store/useGiftsStore", () => ({
  useGiftsStore: { getState: () => ({ gifts: [] }) },
}));
vi.mock("@/store/useWeddingEventsStore", () => ({
  useWeddingEventsStore: { getState: () => ({ weddingEvents: [] }) },
}));

// ─── The SDK ─────────────────────────────────────────────────────────────────
// handle.push is reproduced in the behaviour that matters: it hands the mutator
// what the "server" holds, and writes only if the mutator returns non-null.
const writes: Record<string, unknown>[] = [];
/** The "server", PER NODE — one document shared by every node would wrongly
 *  suggest a fingerprint leaks from one to another. */
const servers = new Map<string, Record<string, unknown>>();
const DEFAULT_NODE = "/pull/sp1/pub-w1";
/** Replays makeHandle's FAST PATH: mutator called with null, without
 *  re-reading the server. The real SDK does this as soon as its cache knows
 *  the document hash — and, the pull cache being PERSISTED, from the first
 *  push after a page reload. Hence the default of true: that is the ordinary
 *  production state, not an edge case. */
let fastPath = true;
/** Explicit reads made by pushPublicPageContent (guard 2). */
const reads: string[] = [];

const push = vi.fn(
  async (
    path: string,
    _pushPath: string,
    mutator: (cur: Record<string, unknown> | null) => Record<string, unknown> | null,
  ) => {
    const next = mutator(fastPath ? null : (servers.get(path) ?? null));
    if (next === null) return;
    servers.set(path, next);
    writes.push(next);
    fastPath = true; // the cache is warm now, as in the real SDK
  },
);

const clientPull = vi.fn(async (path: string) => {
  reads.push(path);
  const doc = servers.get(path);
  return doc ? { data: doc, hash: `h-${path}`, timestamp: 1 } : { data: {}, hash: "" };
});

/** Set by the decrypt test; null means the node is served in the clear. */
let encryptor: { decrypt: (d: unknown) => Promise<unknown> } | null = null;

vi.mock("@fiance/sdk", () => ({
  getNodeAccess: vi.fn(async () => ({
    push,
    get encryptor() { return encryptor; },
    client: { pull: clientPull },
    isOwnerOpen: true,
  })),
  objInvPull: (s: string, n: string) => `/pull/${s}/${n}`,
  objInvPush: (s: string, n: string) => `/push/${s}/${n}`,
  updateObjectIndex: vi.fn(),
  createNodeInviteLink: vi.fn(),
  encodeNodeInviteLink: vi.fn(),
  publicPageToNode: vi.fn(),
}));

import {
  pushPublicPageContent,
  publicPageFingerprint,
  forgetPublicPageFingerprints,
  buildPublicPageDocument,
} from "@/lib/public-page";

const session = {} as never;

beforeEach(() => {
  writes.length = 0;
  reads.length = 0;
  servers.clear();
  fastPath = true;
  push.mockClear();
  clientPull.mockClear();
  encryptor = null;
  forgetPublicPageFingerprints();
  dayOfItems = [];
  wedding = {
    partner1Name: "Adrien",
    partner2Name: "Emma",
    weddingDate: "2027-06-12",
    venueName: "Le Domaine",
    description: null,
    faq: null,
  };
});

describe("publicPageFingerprint", () => {
  it("drops timestamp — the only field that changes on every build", () => {
    const a = { version: 2, timestamp: "2026-08-24T09:00:00.000Z", about: { x: 1 } };
    const b = { version: 2, timestamp: "2026-08-24T09:00:02.000Z", about: { x: 1 } };
    expect(publicPageFingerprint(a)).toBe(publicPageFingerprint(b));
  });

  it("does not depend on key order — the re-read may differ from the built one", () => {
    expect(publicPageFingerprint({ a: 1, b: { c: 2, d: 3 } })).toBe(
      publicPageFingerprint({ b: { d: 3, c: 2 }, a: 1 }),
    );
  });

  it("treats undefined and absent alike — JSON loses one and not the other", () => {
    expect(publicPageFingerprint({ a: 1, gifts: undefined })).toBe(
      publicPageFingerprint({ a: 1 }),
    );
  });

  it("distinguishes a real change", () => {
    expect(publicPageFingerprint({ about: { venueName: "A" } })).not.toBe(
      publicPageFingerprint({ about: { venueName: "B" } })
    );
  });

  it("distinguishes list order — the public schedule is ordered", () => {
    expect(publicPageFingerprint({ timeline: [{ id: "a" }, { id: "b" }] })).not.toBe(
      publicPageFingerprint({ timeline: [{ id: "b" }, { id: "a" }] }),
    );
  });

  // The fingerprint is taken over the PARSED object, never over bytes or
  // ciphertext, so transport encoding cannot reach it.
  it("is unaffected by JSON escaping — the same string parses to the same value", () => {
    const built = { about: { venueName: "Château d'Ébène" } };
    const reread = JSON.parse('{"about":{"venueName":"Ch\\u00e2teau d\'\\u00c9b\\u00e8ne"}}');
    expect(publicPageFingerprint(reread)).toBe(publicPageFingerprint(built));
  });

  it("keeps null distinct from absent — null is a published value, undefined is not", () => {
    expect(publicPageFingerprint({ a: 1, description: null })).not.toBe(
      publicPageFingerprint({ a: 1 }),
    );
  });

  it("normalises -0 to 0, as a JSON round trip does", () => {
    expect(publicPageFingerprint({ price: -0 })).toBe(publicPageFingerprint({ price: 0 }));
  });

  // Fails SAFE: a decrypt that hands back a JSON string rather than an object
  // cannot compare equal, so we write rather than skip.
  it("never matches a string against an object — an odd decrypt writes, it does not skip", () => {
    const doc = { about: { venueName: "Le Domaine" } };
    expect(publicPageFingerprint(JSON.stringify(doc))).not.toBe(publicPageFingerprint(doc));
  });
});

describe("pushPublicPageContent", () => {
  it("writes the first time — otherwise the public link would stay dead", async () => {
    await pushPublicPageContent(session, "sp1", "pub-w1");
    expect(writes).toHaveLength(1);
  });

  it("does NOT write a second time when nothing changed", async () => {
    await pushPublicPageContent(session, "sp1", "pub-w1");
    await pushPublicPageContent(session, "sp1", "pub-w1");
    expect(writes).toHaveLength(1);
  });

  it("does not even OPEN the node on the second call — the loop cost reads too", async () => {
    await pushPublicPageContent(session, "sp1", "pub-w1");
    push.mockClear();
    await pushPublicPageContent(session, "sp1", "pub-w1");
    expect(push).not.toHaveBeenCalled();
  });

  it("holds even when the mutator never sees cur (SDK fast path)", async () => {
    // The trap: the pull cache being persisted, the mutator no longer sees the
    // server state — including on the FIRST call after a page reload. A guard
    // based on cur alone would have fixed nothing.
    // Here the explicit re-read (guard 2) closes the gap: we simulate a reload
    // by forgetting the fingerprint, the server already holding our document.
    await pushPublicPageContent(session, "sp1", "pub-w1");
    expect(writes).toHaveLength(1);
    forgetPublicPageFingerprints(); // page reload
    await pushPublicPageContent(session, "sp1", "pub-w1");
    expect(writes).toHaveLength(1); // no second write
  });

  it("trades the write for a READ on the first call of a page", async () => {
    // Before this, every page load rewrote the node identically. A read emits
    // no event, so it re-primes nothing — that is the whole point of the
    // trade.
    servers.set(DEFAULT_NODE, { ...buildPublicPageDocument(), timestamp: "1999-01-01T00:00:00.000Z" });
    await pushPublicPageContent(session, "sp1", "pub-w1");
    expect(writes).toHaveLength(0);
    expect(reads).toHaveLength(1);
  });

  it("does not re-read when the in-memory fingerprint suffices", async () => {
    await pushPublicPageContent(session, "sp1", "pub-w1");
    reads.length = 0;
    await pushPublicPageContent(session, "sp1", "pub-w1");
    expect(reads).toHaveLength(0);
    expect(push).toHaveBeenCalledTimes(1);
  });

  it("still writes if the re-read fails — a dropped network must not silence publication", async () => {
    clientPull.mockImplementationOnce(async () => { throw new Error("network"); });
    await pushPublicPageContent(session, "sp1", "pub-w1");
    expect(writes).toHaveLength(1);
  });

  it("time passing alone triggers nothing", async () => {
    const a = buildPublicPageDocument();
    await new Promise((r) => setTimeout(r, 5));
    const b = buildPublicPageDocument();
    expect(a.timestamp).not.toBe(b.timestamp);
    expect(publicPageFingerprint(a)).toBe(publicPageFingerprint(b));
  });

  it("a hydration that changes nothing writes nothing, even replacing references", async () => {
    dayOfItems = [{ id: "d1", title: "Cocktail", time: "18:00", isPublic: true }];
    await pushPublicPageContent(session, "sp1", "pub-w1");
    expect(writes).toHaveLength(1);

    // The hydration: same data, NEW objects — half of the original bug.
    dayOfItems = [{ id: "d1", title: "Cocktail", time: "18:00", isPublic: true }];
    wedding = { ...(wedding as Record<string, unknown>) };
    await pushPublicPageContent(session, "sp1", "pub-w1");
    expect(writes).toHaveLength(1);
  });

  it("writes again as soon as data REALLY changes", async () => {
    await pushPublicPageContent(session, "sp1", "pub-w1");
    dayOfItems = [{ id: "d1", title: "Vin d'honneur", time: "18:00", isPublic: true }];
    await pushPublicPageContent(session, "sp1", "pub-w1");
    expect(writes).toHaveLength(2);
  });

  it("keeps the fingerprint per node, not globally", async () => {
    await pushPublicPageContent(session, "sp1", "pub-w1");
    await pushPublicPageContent(session, "sp2", "pub-w2");
    expect(writes).toHaveLength(2);
  });

  it("does not write when the server already holds the equivalent on the first call", async () => {
    // Cold cache, slow path: the server returns a document identical to ours
    // but for the timestamp. This is the page-reload case.
    servers.set(DEFAULT_NODE, { ...buildPublicPageDocument(), timestamp: "1999-01-01T00:00:00.000Z" });
    await pushPublicPageContent(session, "sp1", "pub-w1");
    expect(writes).toHaveLength(0);
  });

  it("after that finding, the next call does not write either", async () => {
    // Without recording on the "server already had it" branch, the SDK cache
    // would be warm and the next call would write again: the loop would come
    // back through that hole.
    servers.set(DEFAULT_NODE, { ...buildPublicPageDocument(), timestamp: "1999-01-01T00:00:00.000Z" });
    await pushPublicPageContent(session, "sp1", "pub-w1");
    fastPath = true;
    await pushPublicPageContent(session, "sp1", "pub-w1");
    expect(writes).toHaveLength(0);
  });

  it("goes through the encryptor when the node is sealed, and still skips an equal document", async () => {
    servers.set(DEFAULT_NODE, { ...buildPublicPageDocument(), timestamp: "1999-01-01T00:00:00.000Z" });
    // The server hands back an opaque blob; only decrypt yields the document.
    const sealed = { _encrypted: "opaque" };
    servers.set(DEFAULT_NODE, sealed as never);
    encryptor = {
      decrypt: async () => ({ ...buildPublicPageDocument(), timestamp: "1999-01-01T00:00:00.000Z" }),
    };
    await pushPublicPageContent(session, "sp1", "pub-w1");
    expect(writes).toHaveLength(0);
  });

  it("retries after a network failure — the fingerprint is not kept on exception", async () => {
    push.mockImplementationOnce(async () => { throw new Error("network"); });
    await expect(pushPublicPageContent(session, "sp1", "pub-w1")).rejects.toThrow("network");
    await pushPublicPageContent(session, "sp1", "pub-w1");
    expect(writes).toHaveLength(1);
  });
});
