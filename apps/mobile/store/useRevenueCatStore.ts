import { create } from "zustand";

interface RevenueCatState {
  /** Whether the wedding owner's RevenueCat customer has the premium entitlement active. */
  isPremium: boolean;
  setPremium: (isPremium: boolean) => void;
}

/**
 * Holds the wedding owner's premium entitlement state, pushed by the
 * RevenueCat CustomerInfo listener (see lib/revenuecat.ts / revenuecat.web.ts).
 * Configured once per active wedding, keyed to the wedding owner's appUserID —
 * see RevenueCatInitializer in lib/providers.tsx.
 */
export const useRevenueCatStore = create<RevenueCatState>((set) => ({
  isPremium: false,
  setPremium: (isPremium) => set({ isPremium }),
}));
