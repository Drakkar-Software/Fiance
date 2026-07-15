// Single source of truth for which feature areas have a first-visit welcome.
// Deliberately RN-free (no lucide/react-native imports) so tests and any
// non-UI consumer can import it without pulling the component tree.

/** Feature segments that show a first-visit welcome. */
export const FEATURE_WELCOME_KEYS = [
  "home",
  "vendors",
  "guests",
  "planning",
  "budget",
  "ideas",
] as const;

export type FeatureWelcomeKey = (typeof FEATURE_WELCOME_KEYS)[number];

/**
 * Keys whose primary CTA deep-links into the feature's first action — these
 * also carry a low-emphasis "Explorer" secondary link (→ a `secondaryCta` copy
 * key). Home and budget have no single add-route, so their CTA just dismisses.
 */
export const FEATURE_WELCOME_DEEPLINK_KEYS: readonly FeatureWelcomeKey[] = [
  "vendors",
  "guests",
  "planning",
  "ideas",
];
