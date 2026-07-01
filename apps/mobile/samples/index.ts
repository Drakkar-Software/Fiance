import { smallSampleBackup } from "./small";
import { mediumSampleBackup } from "./medium";
import { bigSampleBackup } from "./big";
import { backupToJson } from "./shared";
import type { WeddingSample, WeddingSampleMeta, SampleSize } from "./types";

export type { WeddingSample, WeddingSampleMeta, SampleSize } from "./types";

export const WEDDING_SAMPLES: WeddingSample[] = [
  {
    id: "small",
    labelKey: "samples.small.label",
    descriptionKey: "samples.small.description",
    guestCount: 28,
    budget: 10_000,
    backup: smallSampleBackup,
  },
  {
    id: "medium",
    labelKey: "samples.medium.label",
    descriptionKey: "samples.medium.description",
    guestCount: 72,
    budget: 22_000,
    backup: mediumSampleBackup,
  },
  {
    id: "big",
    labelKey: "samples.big.label",
    descriptionKey: "samples.big.description",
    guestCount: 145,
    budget: 45_000,
    backup: bigSampleBackup,
  },
];

export function getWeddingSample(id: SampleSize): WeddingSample | undefined {
  return WEDDING_SAMPLES.find((sample) => sample.id === id);
}

export function getSampleBackupJson(id: SampleSize): string {
  const sample = getWeddingSample(id);
  if (!sample) throw new Error(`Unknown sample: ${id}`);
  return backupToJson(sample.backup);
}

export { smallSampleBackup, mediumSampleBackup, bigSampleBackup };
