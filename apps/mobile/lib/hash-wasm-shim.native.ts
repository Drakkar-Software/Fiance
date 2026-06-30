/**
 * Native Argon2id shim aliased over `hash-wasm` for iOS/Android (see metro.config.js).
 *
 * Uses react-native-quick-crypto's OpenSSL Argon2id binding (~150 ms on device)
 * instead of @noble/hashes pure-JS (~15–45 s on Hermes with no JIT).
 *
 * DETERMINISM GATE: on the very first call a lightweight self-test (m=8, t=1, p=1)
 * verifies the native output against a pre-computed noble reference vector. If they
 * differ the native path is permanently disabled for this process and noble is used
 * instead, so existing user identities (derived from Argon2id output) are never
 * silently changed.
 *
 * Noble reference vector for the gate:
 *   password = "fiance-argon2-gate"  salt = "starfish-v3-gate"  m=8 t=1 p=1 dkLen=32
 *   → 2626ef51b6b3269df03e92b7a6b8909e410dd65df27d4da22699bfad6f5ada16
 */
import { argon2 } from "react-native-quick-crypto";
import type { Argon2Params } from "react-native-quick-crypto";
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

// ─── Determinism gate ─────────────────────────────────────────────────────────

const GATE_EXPECTED_HEX = "2626ef51b6b3269df03e92b7a6b8909e410dd65df27d4da22699bfad6f5ada16";
let _gateResult: Promise<boolean> | null = null;

function runGate(): Promise<boolean> {
  if (_gateResult) return _gateResult;
  const enc = new TextEncoder();
  _gateResult = new Promise<boolean>((resolve) => {
    argon2(
      "argon2id",
      {
        message: enc.encode("fiance-argon2-gate"),
        nonce: enc.encode("starfish-v3-gate"),
        parallelism: 1,
        passes: 1,
        memory: 8,
        tagLength: 32,
      } as Argon2Params,
      (err, buf) => {
        if (err) {
          console.warn("[hash-wasm-shim] Native Argon2id gate error — using noble.", err);
          resolve(false);
          return;
        }
        const hex = buf.toString("hex");
        const ok = hex === GATE_EXPECTED_HEX;
        if (!ok) {
          console.warn(
            "[hash-wasm-shim] Native Argon2id output mismatch — using noble.\n" +
              `  got:      ${hex}\n` +
              `  expected: ${GATE_EXPECTED_HEX}`,
          );
        }
        resolve(ok);
      },
    );
  });
  return _gateResult;
}

// ─── Noble fallback ───────────────────────────────────────────────────────────

function nobleHex(out: Uint8Array): string {
  return Array.from(out, (b) => b.toString(16).padStart(2, "0")).join("");
}

async function argon2idNoble(opts: Argon2idOptions): Promise<string | Uint8Array> {
  const out = nobleArgon2id(opts.password, opts.salt, {
    t: opts.iterations,
    m: opts.memorySize,
    p: opts.parallelism,
    dkLen: opts.hashLength,
  });
  if (opts.outputType === "binary") return out;
  return nobleHex(out);
}

// ─── Public export ────────────────────────────────────────────────────────────

export async function argon2id(opts: Argon2idOptions): Promise<string | Uint8Array> {
  const nativeOk = await runGate();
  if (!nativeOk) return argon2idNoble(opts);

  return new Promise<string | Uint8Array>((resolve, reject) => {
    argon2(
      "argon2id",
      {
        message: opts.password,
        nonce: opts.salt,
        parallelism: opts.parallelism,
        passes: opts.iterations,
        memory: opts.memorySize,
        tagLength: opts.hashLength,
      } as Argon2Params,
      (err, buf) => {
        if (err) { reject(err); return; }
        if (opts.outputType === "binary") {
          resolve(new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength));
        } else {
          resolve(buf.toString("hex"));
        }
      },
    );
  });
}
