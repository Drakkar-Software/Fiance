import React, { useEffect, useRef } from "react";
import { View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useWeddingRegistryStore } from "@/store/useWeddingRegistryStore";
import { useDatabaseSwitching } from "@/db/provider";
import { WeddingSwitchOverlay } from "@/components/WeddingSwitchOverlay";

/**
 * Dedicated transition screen for switching the active wedding. Navigated to
 * INSTEAD OF `/(tabs)` directly (see settings/index.tsx) because switchWedding
 * awaits an AsyncStorage write + registry reload before the registry state
 * updates — routing straight to home let it paint with the OLD wedding's data
 * for that async gap, since DatabaseProvider's switch overlay only arms once
 * `dbFileName` actually changes. Owning the wait here means home is only ever
 * reached once the new wedding's data is fully hydrated.
 */
export default function WeddingSwitchScreen() {
  const { id, label } = useLocalSearchParams<{ id: string; label?: string }>();
  const router = useRouter();
  const switchWedding = useWeddingRegistryStore((s) => s.switchWedding);
  const switching = useDatabaseSwitching();
  const startedRef = useRef(false);
  const sawSwitchingRef = useRef(false);

  useEffect(() => {
    if (startedRef.current || !id) return;
    startedRef.current = true;
    switchWedding(id).catch((e) => console.error("switchWedding failed:", e));
  }, [id, switchWedding]);

  useEffect(() => {
    if (switching) sawSwitchingRef.current = true;
    if (sawSwitchingRef.current && !switching) {
      router.replace("/(tabs)");
    }
  }, [switching, router]);

  // Safety net: if switchWedding fails or the DB swap never arms `switching`
  // (e.g. storage error), don't strand the user on the transition screen.
  useEffect(() => {
    const timeout = setTimeout(() => router.replace("/(tabs)"), 5000);
    return () => clearTimeout(timeout);
  }, [router]);

  // Own the cover only until DatabaseProvider's overlay arms (switching flips
  // true) — from then on that one is the single source of truth for the wait
  // screen, so this crossfades out rather than staying double-mounted for the
  // whole swap. Before that point (switchWedding still awaiting the registry
  // write/reload), this is the only cover, hence `label` from route params.
  return (
    <View style={{ flex: 1 }}>
      <WeddingSwitchOverlay visible={!switching} label={label} />
    </View>
  );
}
