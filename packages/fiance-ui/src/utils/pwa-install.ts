/**
 * Hook to capture the PWA install prompt on web.
 * On Chromium browsers, captures the `beforeinstallprompt` event.
 * On iOS Safari (which doesn't support that event), returns `isIosSafari`
 * so the UI can show manual "Add to Home Screen" instructions.
 */

import { useState, useEffect, useCallback } from "react";
import { Platform } from "react-native";

/** Returns true when the app is running as an installed PWA (standalone mode). */
export function isPwaStandalone(): boolean {
  if (Platform.OS !== "web") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as any).standalone === true
  );
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function getIsIosSafari(): boolean {
  if (Platform.OS !== "web") return false;
  const ua = navigator.userAgent;
  const isIos = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
  return isIos && !isStandalone;
}

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIosSafari] = useState(getIsIosSafari);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (Platform.OS !== "web") return;
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const install = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setDeferredPrompt(null);
  }, [deferredPrompt]);

  return {
    canInstall: deferredPrompt !== null,
    install,
    isIosSafari: isIosSafari && !dismissed,
    dismissIosBanner: () => setDismissed(true),
  };
}
