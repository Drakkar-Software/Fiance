import { useEffect } from "react";
import { View, ScrollView, ActivityIndicator } from "react-native-css/components";
import { Slot, useRouter } from "expo-router";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { isPwaStandalone } from "@/lib/usePwaInstall";
import { useWeddingRegistryStore } from "@/store/useWeddingRegistryStore";

export default function MarketingLayout() {
  const router = useRouter();
  const registry = useWeddingRegistryStore((s) => s.registry);
  const isLoaded = useWeddingRegistryStore((s) => s.isLoaded);
  const isStandalone = typeof window !== "undefined" && isPwaStandalone();

  useEffect(() => {
    if (!isStandalone || !isLoaded) return;
    if (registry?.weddings.length) {
      router.replace("/home" as any);
    } else {
      router.replace("/onboarding" as any);
    }
  }, [isStandalone, isLoaded]);

  // PWA: show spinner while registry loads / redirect is in-flight
  if (isStandalone) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <MarketingNav />
      <ScrollView style={{ flex: 1 }} className="bg-accent-cream">
        <Slot />
        <MarketingFooter />
      </ScrollView>
    </View>
  );
}
