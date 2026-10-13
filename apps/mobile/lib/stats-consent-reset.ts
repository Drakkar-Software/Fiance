import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  STATS_CONSENT_STORAGE_KEY,
  planStatsConsentReset,
  type StatsConsentRecord,
} from "@fiance/sdk";
import { secureGet, secureSet } from "@/lib/secure-store";

// The analytics SDK persists its consent state under "sg:consent", prefixed with "sg_".
const LEGACY_CONSENT_KEY = "sg_sg:consent";

async function readLegacyConsent(): Promise<string | null> {
  if (Platform.OS === "web") return localStorage.getItem(LEGACY_CONSENT_KEY);
  return AsyncStorage.getItem(LEGACY_CONSENT_KEY);
}

/**
 * Resolves the stats consent record before the analytics SDK starts. Returns null when
 * the record cannot be read or written, and the SDK must then stay off for this launch.
 */
export async function prepareStatsConsent(): Promise<StatsConsentRecord | null> {
  try {
    const storedRaw = await secureGet(STATS_CONSENT_STORAGE_KEY);
    const legacyRaw = storedRaw === null ? await readLegacyConsent() : null;
    const plan = planStatsConsentReset({ storedRaw, legacyRaw });
    if (plan.reset) await secureSet(STATS_CONSENT_STORAGE_KEY, JSON.stringify(plan.record));
    return plan.record;
  } catch {
    return null;
  }
}
