/**
 * Tests for lib/index-lock.ts — withIndexLock
 *
 * L1: Calls for the same spaceId are serialized (never overlap).
 * L2: Calls for different spaceIds are NOT serialized (can run concurrently).
 * L3: A rejection in one call does not stall the chain — the next caller runs.
 * L4: Each caller receives its own result (or error); they are independent.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// Fresh module per test so the _chains Map starts clean.
beforeEach(() => {
  vi.resetModules();
});

async function getWithIndexLock() {
  const mod = await import("@/lib/index-lock");
  return mod.withIndexLock;
}

// ── L1: serialization for the same spaceId ─────────────────────────────────────

describe("withIndexLock — same spaceId", () => {
  it("L1: two concurrent calls run sequentially (A finishes before B starts)", async () => {
    const withIndexLock = await getWithIndexLock();
    const order: string[] = [];

    let releaseA!: () => void;
    const blockA = new Promise<void>((res) => { releaseA = res; });

    const a = withIndexLock("sp-1", async () => {
      order.push("A:start");
      await blockA;
      order.push("A:end");
    });

    const b = withIndexLock("sp-1", async () => {
      order.push("B:start");
    });

    // The chain is Promise.resolve().catch().then(fn): two microtask ticks
    // before fn starts. Drain both before checking intermediate state.
    await Promise.resolve();
    await Promise.resolve();
    // A has started and is blocked on blockA; B must not have started yet.
    expect(order).toEqual(["A:start"]);

    releaseA();
    await Promise.all([a, b]);

    expect(order).toEqual(["A:start", "A:end", "B:start"]);
  });

  it("L1: three concurrent calls run in FIFO order", async () => {
    const withIndexLock = await getWithIndexLock();
    const order: string[] = [];

    let releaseA!: () => void;
    let releaseB!: () => void;
    const blockA = new Promise<void>((res) => { releaseA = res; });
    const blockB = new Promise<void>((res) => { releaseB = res; });

    const a = withIndexLock("sp-2", async () => { await blockA; order.push("A"); });
    const b = withIndexLock("sp-2", async () => { await blockB; order.push("B"); });
    const c = withIndexLock("sp-2", async () => { order.push("C"); });

    releaseA();
    await a;
    releaseB();
    await Promise.all([b, c]);

    expect(order).toEqual(["A", "B", "C"]);
  });
});

// ── L2: independence across spaceIds ──────────────────────────────────────────

describe("withIndexLock — different spaceIds", () => {
  it("L2: calls for different spaces run concurrently", async () => {
    const withIndexLock = await getWithIndexLock();
    const started: string[] = [];

    let releaseA!: () => void;
    const blockA = new Promise<void>((res) => { releaseA = res; });

    const a = withIndexLock("sp-A", async () => {
      started.push("A");
      await blockA;
    });

    const b = withIndexLock("sp-B", async () => {
      started.push("B");
    });

    await b; // B should finish immediately without waiting for A
    expect(started).toContain("B"); // B started while A is still blocked

    releaseA();
    await a;
  });
});

// ── L3: error isolation — rejection does not stall the chain ──────────────────

describe("withIndexLock — error isolation", () => {
  it("L3: a rejection in call A does not prevent call B from running", async () => {
    const withIndexLock = await getWithIndexLock();

    const a = withIndexLock("sp-err", async () => {
      throw new Error("boom");
    });

    const b = withIndexLock("sp-err", async () => "ok");

    await expect(a).rejects.toThrow("boom");
    await expect(b).resolves.toBe("ok");
  });

  it("L3: the chain keeps working after multiple consecutive rejections", async () => {
    const withIndexLock = await getWithIndexLock();

    await expect(
      withIndexLock("sp-multi-err", async () => { throw new Error("1"); }),
    ).rejects.toThrow("1");
    await expect(
      withIndexLock("sp-multi-err", async () => { throw new Error("2"); }),
    ).rejects.toThrow("2");
    await expect(
      withIndexLock("sp-multi-err", async () => "recovered"),
    ).resolves.toBe("recovered");
  });
});

// ── L4: each caller gets its own result ───────────────────────────────────────

describe("withIndexLock — result propagation", () => {
  it("L4: each caller resolves with its own fn return value", async () => {
    const withIndexLock = await getWithIndexLock();

    const [r1, r2, r3] = await Promise.all([
      withIndexLock("sp-vals", async () => 1),
      withIndexLock("sp-vals", async () => 2),
      withIndexLock("sp-vals", async () => 3),
    ]);

    expect(r1).toBe(1);
    expect(r2).toBe(2);
    expect(r3).toBe(3);
  });
});
