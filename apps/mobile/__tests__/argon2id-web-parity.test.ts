import { describe, it, expect } from "vitest";
import { argon2id as wasmArgon2id } from "hash-wasm";
import { argon2id as shimArgon2id } from "@/lib/hash-wasm-shim";

/**
 * Web no longer routes `hash-wasm` through the pure-JS shim (see
 * metro.config.js). That is only safe if both implementations derive the SAME
 * digest — a mismatch would fork every userId between web and native.
 *
 * These are the parameters starfish-identities actually stretches with
 * (ARGON2_PARAMS in its bundle, mirrored here because it is not exported). If
 * the SDK ever changes them, identities move for every platform at once, which
 * is an SDK decision; what this file guards is the narrower thing this PR can
 * break — the two implementations disagreeing at the parameters in use.
 */
const PROD = {
  memorySize: 47104,
  iterations: 3,
  parallelism: 1,
  hashLength: 32,
  saltUtf8: "starfish-v3-root",
};

const hex = (u: Uint8Array) =>
  Array.from(u, (b) => b.toString(16).padStart(2, "0")).join("");

async function bothDigests(password: string, p: typeof PROD) {
  const salt = new TextEncoder().encode(p.saltUtf8);
  const opts = {
    password,
    salt,
    parallelism: p.parallelism,
    iterations: p.iterations,
    memorySize: p.memorySize,
    hashLength: p.hashLength,
    outputType: "binary" as const,
  };
  const fromWasm = (await wasmArgon2id(opts)) as Uint8Array;
  const fromShim = (await shimArgon2id(opts)) as Uint8Array;
  return [hex(new Uint8Array(fromWasm)), hex(fromShim)] as const;
}

describe("Argon2id — hash-wasm and the pure-JS shim agree", () => {
  it(
    "derives the same digest at the production parameters",
    async () => {
      const [a, b] = await bothDigests("correct horse battery staple", PROD);
      expect(a).toBe(b);
      expect(a).toHaveLength(PROD.hashLength * 2);
    },
    60_000,
  );

  it(
    "agrees on a non-ASCII passphrase — NFC handling must not diverge",
    async () => {
      // Cheap parameters: this checks encoding, not cost.
      const cheap = { ...PROD, memorySize: 256, iterations: 1 };
      const [a, b] = await bothDigests("château d'Ébène — passé", cheap);
      expect(a).toBe(b);
    },
    30_000,
  );

  it(
    "agrees when a parameter moves, so the equality is not a one-off",
    async () => {
      const cheap = { ...PROD, memorySize: 512, iterations: 2, hashLength: 16 };
      const [a, b] = await bothDigests("another passphrase", cheap);
      expect(a).toBe(b);
      expect(a).toHaveLength(32);
    },
    30_000,
  );
});
