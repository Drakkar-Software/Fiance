import type { BackupData } from "@fiance/sdk";

export type SampleSize = "small" | "medium" | "big";

export interface WeddingSampleMeta {
  id: SampleSize;
  labelKey: string;
  descriptionKey: string;
  guestCount: number;
  budget: number;
}

export interface WeddingSample extends WeddingSampleMeta {
  backup: BackupData;
}
