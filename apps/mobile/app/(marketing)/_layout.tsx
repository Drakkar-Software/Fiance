import { useEffect } from "react";
import { Platform } from "react-native";
import { View, ActivityIndicator } from "react-native-css/components";
import { Slot, useRouter } from "expo-router";
import { isPwaStandalone } from "@/lib/usePwaInstall";
import { useWeddingRegistryStore } from "@/store/useWeddingRegistryStore";

export default function MarketingLayout() {
  const router = useRouter();
  const registry = useWeddingRegistryStore((s) => s.registry);
  const isLoaded = useWeddingRegistryStore((s) => s.isLoaded);
  const isStandalone = typeof window !== "undefined" && isPwaStandalone();

  // Native app users (and installed PWAs) never see the marketing page —
  // skip straight into the app. Regular web visitors still get the landing.
  const shouldEnterApp = Platform.OS !== "web" || isStandalone;

  useEffect(() => {
    if (!shouldEnterApp || !isLoaded) return;
    if (registry?.weddings.length) {
      router.replace("/home" as any);
    } else {
      router.replace("/onboarding" as any);
    }
  }, [shouldEnterApp, isLoaded, registry?.weddings.length]);

  // Native / PWA: show spinner while registry loads / redirect is in-flight
  if (shouldEnterApp) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <Slot />;
}
