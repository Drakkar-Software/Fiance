import React from "react";
import { View, Text, Pressable } from "react-native-css/components";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Platform } from "react-native";
import { RefreshCw } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { useAppUpdate } from "@/lib/use-app-update";

/**
 * Full-width banner shown at the top of the app when an EAS OTA update has
 * been downloaded and is ready to apply. Pressing "Redémarrer" reloads the JS
 * bundle. Renders nothing on web and in dev mode (expo-updates is a no-op).
 *
 * Pass `topInset` when the banner is the topmost view so it clears the notch /
 * status bar. Omit it when rendered below a safe edge.
 */
export function UpdateBanner({ topInset = false }: { topInset?: boolean }) {
  const { t } = useTranslation("common");
  const { updateReady, applyUpdate } = useAppUpdate();
  const insets = useSafeAreaInsets();

  if (!updateReady) return null;

  return (
    <View
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          paddingVertical: 8,
          paddingHorizontal: 16,
          backgroundColor: "#6e7a4a",
          borderBottomWidth: 1,
          borderBottomColor: "#5a6438",
        },
        topInset && Platform.OS !== "web" ? { paddingTop: 8 + insets.top } : undefined,
      ]}
    >
      <RefreshCw size={14} color="#fff" />
      <Text style={{ flex: 1, fontSize: 13, color: "#fff", fontWeight: "500" }}>
        {t("updateReady")}
      </Text>
      <Pressable
        onPress={applyUpdate}
        style={{ paddingHorizontal: 12, paddingVertical: 4, backgroundColor: "#fff", borderRadius: 12 }}
      >
        <Text style={{ fontSize: 12, fontWeight: "600", color: "#6e7a4a" }}>
          {t("updateRestart")}
        </Text>
      </Pressable>
    </View>
  );
}
