import React, { useEffect } from "react";
import { StyleSheet, Text } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useSyncAccessStore } from "@/store/useSyncAccessStore";
import { usePermissions } from "@/lib/permissions/usePermissions";

const BANNER_HEIGHT = 36;

/**
 * Persistent banner for a member device that can't edit — either the space cap has
 * been proven read-only (`useSyncAccessStore`'s `writeDenied`, the authoritative
 * server-truth signal — see that file), or the locally-cached role matrix
 * (`usePermissions`) grants this device only "view" on every visible surface. The
 * two mostly agree (both system roles, Viewer/Planner, are "app-readonly" tier and
 * always get a write-denied cap), but a custom mixed-edit role can be locally
 * view-only on some surfaces while still holding a writable cap overall — the
 * matrix check catches that case the cap-based signal alone would miss. Same
 * message either way: usePermissions.ts is what actually prevents the edit, this
 * just makes the (previously silent) constraint visible.
 */
export function ReadOnlyBanner() {
  const { t } = useTranslation("settings");
  const insets = useSafeAreaInsets();
  const writeDenied = useSyncAccessStore((s) => s.writeDenied);
  const { isOwner, unrestricted, visibleSurfaces } = usePermissions();
  const isReadOnlyCollaborator = !isOwner && !unrestricted && visibleSurfaces.length > 0;
  const show = writeDenied || isReadOnlyCollaborator;
  const translateY = useSharedValue(-(BANNER_HEIGHT + insets.top + 4));

  useEffect(() => {
    const hiddenY = -(BANNER_HEIGHT + insets.top + 4);
    translateY.value = withTiming(show ? 0 : hiddenY, { duration: 280 });
  }, [show, insets.top]);

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
