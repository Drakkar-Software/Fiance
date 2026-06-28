import { randomFillSync } from "node:crypto";
export const getRandomBytes = (size: number): Uint8Array =>
  randomFillSync(new Uint8Array(size));
