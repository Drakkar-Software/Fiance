/** Pure route → feature-surface mapping (no RN / expo-router deps, so it's unit-testable). */
import { FEATURE_SURFACES, type FeatureSurface } from "@fiance/sdk";

const SURFACES = new Set<string>(FEATURE_SURFACES);

/** Map route segments to a feature surface (e.g. `["(tabs)","guests","[id]"]` → "guests"). */
export function surfaceFromSegments(segments: string[]): FeatureSurface | null {
  for (const seg of segments) {
    if (SURFACES.has(seg)) return seg as FeatureSurface;
  }
  return null;
}
