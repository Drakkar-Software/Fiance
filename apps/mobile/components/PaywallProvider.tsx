import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { PaywallSheet } from "@/components/PaywallSheet";

interface PaywallContextValue {
  /** Opens the single shared paywall sheet. `context` is an optional headline
   * shown above the pitch (e.g. the free-limit message that triggered it). */
  openPaywall: (context?: string) => void;
}

const PaywallContext = createContext<PaywallContextValue | null>(null);

/**
 * Mounts exactly one `PaywallSheet` for the whole app. Screens that used to
 * each hold their own `showPaywall` state + `<PaywallSheet/>` can instead call
 * `useShowPaywall().openPaywall(...)` — avoids ~13 duplicated sheet instances
 * and lets any caller pass a contextual headline (e.g. the limit-reached
 * message) instead of only a transient toast.
 */
export function PaywallProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [context, setContext] = useState<string | undefined>(undefined);

  const openPaywall = useCallback((ctx?: string) => {
    setContext(ctx);
    setVisible(true);
  }, []);

  const value = useMemo(() => ({ openPaywall }), [openPaywall]);

  return (
    <PaywallContext.Provider value={value}>
      {children}
      <PaywallSheet visible={visible} onClose={() => setVisible(false)} context={context} />
    </PaywallContext.Provider>
  );
}

/** Access the shared paywall sheet. Must be used under `PaywallProvider`. */
export function useShowPaywall(): PaywallContextValue {
  const ctx = useContext(PaywallContext);
  if (!ctx) throw new Error("useShowPaywall must be used within a PaywallProvider");
  return ctx;
}
