/**
 * Pure-JS Argon2id shim aliased over `hash-wasm` (see metro.config.js).
 *
 * starfish-identities imports `argon2id` from `hash-wasm`, which requires a
 * `WebAssembly` global and throws on Hermes ("WebAssembly is not supported in
 * this environment"). @noble/hashes Argon2id is a pure-JS RFC 9106 implementation
 * with default version 0x13 — identical to hash-wasm's default — so the derived
 * userId is consistent across web and native.
 */
import { argon2id as nobleArgon2id } from "@noble/hashes/argon2.js";

interface Argon2idOptions {
  password: string | Uint8Array;
  salt: Uint8Array;
  parallelism: number;
  iterations: number;
  memorySize: number;
  hashLength: number;
  outputType?: "hex" | "binary" | "encoded";
}

export async function argon2id(
  opts: Argon2idOptions,
): Promise<string | Uint8Array> {
  const out = nobleArgon2id(opts.password, opts.salt, {
    t: opts.iterations,
    m: opts.memorySize,
    p: opts.parallelism,
    dkLen: opts.hashLength,
  });
  if (opts.outputType === "binary") return out;
  // hash-wasm default output type is "hex"
  return Array.from(out, (b) => b.toString(16).padStart(2, "0")).join("");
}
