import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as StoreReview from "expo-store-review";

// Ask for a native App/Play Store review once the user reaches a meaningful
// milestone (10+ guests, vendors, or tasks). Each type triggers at most once,
// ever — the flag is persisted in AsyncStorage (app-global, survives wedding
// switches). Never prompts on web.

const THRESHOLD = 10;

export type ReviewTrigger = "guests" | "vendors" | "tasks";

const keyFor = (trigger: ReviewTrigger) => `wos_review_prompted_${trigger}`;

/**
 * Fire-and-forget: request a store review if `count` just crossed the threshold
 * and this trigger type hasn't prompted before. Safe to call after every add —
 * cheap and self-guarding. Never throws.
 */
export async function maybeRequestReview(
  trigger: ReviewTrigger,
  count: number
): Promise<void> {
  if (Platform.OS === "web") return;
  if (count < THRESHOLD) return;

  try {
    const key = keyFor(trigger);
    if (await AsyncStorage.getItem(key)) return; // already prompted for this type
    if (!(await StoreReview.hasAction())) return;

    // Persist before prompting so a repeat add can never double-ask.
    await AsyncStorage.setItem(key, "1");
    await StoreReview.requestReview();
  } catch {
    // Never let review prompting break a mutation.
  }
}
