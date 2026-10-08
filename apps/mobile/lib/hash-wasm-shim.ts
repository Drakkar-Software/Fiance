/**
 * Pure-JS Argon2id, RFC 9106 (@noble/hashes), version 0x13 — the same default
 * hash-wasm uses, so the derived userId matches byte for byte.
 *
 * NO LONGER ON ANY BUILD PATH. metro.config.js used to alias `hash-wasm` here
 * for web, which cost ~2.9 s of main-thread time per derivation against
 * hash-wasm's ~283 ms; a browser has had WebAssembly all along, so web now
 * resolves the real package. Native still redirects to hash-wasm-shim.native.ts
 * (react-native-quick-crypto) because Hermes has no WebAssembly global.
 *
 * Kept as the reference implementation the parity test measures against
 * (__tests__/argon2id-web-parity.test.ts) — that test is what makes the
 * "same digest" claim above checkable rather than asserted.
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
  return Array.from(out, (b) => b.toString(16).padStart(2, "0")).join("");
}
