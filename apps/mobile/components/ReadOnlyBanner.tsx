import React, { useEffect } from "react";
import { StyleSheet, Text } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useSyncAccessStore } from "@/store/useSyncAccessStore";

const BANNER_HEIGHT = 36;

/** Persistent banner for a member device whose space cap has been proven read-only
 *  (see useSyncAccessStore.ts). Makes the previously-silent "edit saves then reverts"
 *  failure visible; usePermissions.ts is what actually prevents the edit. */
export function ReadOnlyBanner() {
  const { t } = useTranslation("settings");
  const insets = useSafeAreaInsets();
  const writeDenied = useSyncAccessStore((s) => s.writeDenied);
  const translateY = useSharedValue(-(BANNER_HEIGHT + insets.top + 4));

  useEffect(() => {
    const hiddenY = -(BANNER_HEIGHT + insets.top + 4);
    translateY.value = withTiming(writeDenied ? 0 : hiddenY, { duration: 280 });
  }, [writeDenied, insets.top]);

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
      <Text style={styles.text}>{t("syncStatusReadOnly")}</Text>
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
    backgroundColor: "#b96a4a", // clay — matches OfflineBanner's mustard "warning" convention
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 6,
  },
  text: {
    color: "#fdfaf1", // card-cream on clay
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.2,
  },
});
