import { describe, it, expect } from "vitest";
import QRCode from "qrcode";

/**
 * Regression test for the unscannable invite QR (InviteQRSheet.tsx).
 *
 * Root cause: the invite URL embeds a signed capability cert + ephemeral
 * keys (~1.4KB), which forces a high-density QR. Two prior commits "fixed"
 * cosmetic issues by shrinking the render size (200 -> 160 -> 184px)
 * without checking module density, making the code physically unscannable
 * (real camera decoders need roughly >=2px per module).
 *
 * This test doesn't render the component (react-native-qrcode-svg needs an
 * RN environment) — it exercises the same underlying `qrcode` encoder
 * (react-native-qrcode-svg's genMatrix calls `QRCode.create` directly, and
 * maps its `size` prop 1:1 to the module grid — see transformMatrixIntoPath.js
 * `cellSize = size / matrix.length`, no added quiet zone) to pin the real
 * px-per-module math so a future edit can't silently regress it.
 */

// Same clamp as InviteQRSheet.tsx: qrSize = max(250, min(320, width - 64))
function qrSizeForWidth(width: number): number {
  return Math.max(250, Math.min(320, Math.round(width - 64)));
}

// Representative invite token shape/length (~1.4KB URL), matching what
// createSpaceInviteLink/encodeLinkFragment actually produce: a base64url
// JSON blob with a signed cap cert + hex-encoded ephemeral keys.
function buildRepresentativeInviteUrl(): string {
  const hex = (n: number) => "a".repeat(n * 2);
  const b64 = (n: number) => "A".repeat(Math.ceil((n * 4) / 3));
  const cap = {
    v: 1,
    kind: "member",
    iss: hex(32),
    issUserId: hex(20),
    sub: hex(32),
    subKem: hex(32),
    subUserId: hex(20),
    scope: { collections: ["content"], paths: [`spaces/${hex(16)}/members/*`], ops: ["read", "write"] },
    nbf: 1750000000,
    exp: 1780000000,
    nonce: b64(16),
    sig: hex(64),
  };
  const token = {
    v: 1,
    spaceId: hex(16),
    spaceName: "Mariage Marie & Paul",
    cap,
    key: hex(32),
    kemPriv: hex(32),
    kemPub: hex(32),
    write: true,
  };
  const json = JSON.stringify(token);
  const b64url = Buffer.from(json).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return `https://fiance.drakkar.software/join#${b64url}`;
}

// Camera decoders reliably resolve QR modules at ~2px/module or above;
// below that, modules blur together and scanning fails (this is exactly
// what broke in production: 184px / 141 modules = 1.23px/module).
const MIN_SCANNABLE_PX_PER_MODULE = 2.0;

describe("invite QR scannability", () => {
  const url = buildRepresentativeInviteUrl();

  it("matches the real invite payload order of magnitude", () => {
    expect(url.length).toBeGreaterThan(1000);
    expect(url.length).toBeLessThan(2000);
  });

  it.each([
    ["small phone (iPhone SE, 320)", 320],
    ["standard phone (375)", 375],
    ["large phone (414)", 414],
    ["tablet/web (768)", 768],
  ])("stays above the scannable px/module threshold on %s", (_label, width) => {
    const qrSize = qrSizeForWidth(width);
    const matrix = QRCode.create(url, { errorCorrectionLevel: "L" });
    const pxPerModule = qrSize / matrix.modules.size;

    expect(pxPerModule).toBeGreaterThanOrEqual(MIN_SCANNABLE_PX_PER_MODULE);
  });

  it("would have failed under the old fixed size (184px) + default ECL (M)", () => {
    const matrix = QRCode.create(url, { errorCorrectionLevel: "M" });
    const pxPerModule = 184 / matrix.modules.size;

    expect(pxPerModule).toBeLessThan(MIN_SCANNABLE_PX_PER_MODULE);
  });
});
