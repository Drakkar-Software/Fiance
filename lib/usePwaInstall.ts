/**
 * Hook to capture the PWA install prompt on web.
 * Returns null on native or if the browser doesn't offer the prompt
 * (i.e. the app is already installed or the browser doesn't support it).
 */

import { useState, useEffect, useCallback } from "react";
import { Platform } from "react-native";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (Platform.OS !== "web") return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // If already in standalone mode, never show
    if (window.matchMedia("(display-mode: standalone)").matches) {
      return;
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const install = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
    }
  }, [deferredPrompt]);

  return {
    canInstall: deferredPrompt !== null,
    install,
  };
}
