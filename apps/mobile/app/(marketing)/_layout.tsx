import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import { View, ScrollView, ActivityIndicator } from "react-native-css/components";
import { Slot, useRouter, usePathname } from "expo-router";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { isPwaStandalone } from "@/lib/usePwaInstall";
import { useWeddingRegistryStore } from "@/store/useWeddingRegistryStore";

export default function MarketingLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const scrollRef = useRef<any>(null);
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

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [pathname]);

  // Native / PWA: show spinner while registry loads / redirect is in-flight
  if (shouldEnterApp) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <MarketingNav />
      <ScrollView ref={scrollRef} style={{ flex: 1 }} className="bg-accent-cream">
        <Slot />
        <MarketingFooter />
      </ScrollView>
    </View>
  );
}
