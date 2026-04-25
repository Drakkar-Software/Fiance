import React, { useEffect, useState } from "react";
import { StyleSheet, Text } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { getStarfishStore, onSyncStatusChange } from "@/lib/starfish";
import { subscribeSyncStatus } from "@drakkar.software/starfish-client/zustand";

const BANNER_HEIGHT = 36;

export function OfflineBanner() {
  const { t } = useTranslation("settings");
  const insets = useSafeAreaInsets();
  const [isOffline, setIsOffline] = useState(false);
  const translateY = useSharedValue(-(BANNER_HEIGHT + insets.top + 4));

  useEffect(() => {
    let unsubStore: (() => void) | null = null;

    const attach = (enabled: boolean) => {
      unsubStore?.();
      unsubStore = null;
      if (enabled) {
        const sf = getStarfishStore();
        if (sf) {
          // subscribeSyncStatus fires immediately with the current status
          unsubStore = subscribeSyncStatus(sf, (status) => {
            setIsOffline(status === "offline");
          });
        }
      } else {
        setIsOffline(false);
      }
    };

    attach(!!getStarfishStore());
    const unsubInit = onSyncStatusChange(attach);

    return () => {
      unsubInit();
      unsubStore?.();
    };
  }, []);

  useEffect(() => {
    const hiddenY = -(BANNER_HEIGHT + insets.top + 4);
    translateY.value = withTiming(isOffline ? 0 : hiddenY, { duration: 280 });
  }, [isOffline, insets.top]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.banner,
        { paddingTop: insets.top + 6, height: BANNER_HEIGHT + insets.top },
        animatedStyle,
      ]}
      pointerEvents="none"
    >
      <Text style={styles.text}>{t("syncStatusOffline")}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    backgroundColor: "#c9922f", // mustard — "warning" in Garden Press
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 6,
  },
  text: {
    color: "#fdfaf1", // card-cream on mustard
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.2,
  },
});
