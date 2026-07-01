import React, { useEffect, useState } from "react";
import { View, Pressable, Text, ActivityIndicator } from "react-native";
import { useTranslation } from "react-i18next";
import { shareLink } from "@/lib/share";
import { Sheet } from "@fiance/ui/components";
import { AlertCircle } from "lucide-react-native";
import QRCode from "react-native-qrcode-svg";
import { theme } from "@/lib/theme";

interface InviteQRSheetProps {
  visible: boolean;
  onClose: () => void;
  generate: () => Promise<string>;
}

type State = "generating" | "ready" | "error";

export function InviteQRSheet({ visible, onClose, generate }: InviteQRSheetProps) {
  const { t } = useTranslation("settings");
  const [state, setState] = useState<State>("generating");
  const [url, setUrl] = useState("");
  const [detail, setDetail] = useState("");

  const run = () => {
    setState("generating");
    setDetail("");
    generate()
      .then((link) => {
        setUrl(link);
        setState("ready");
      })
      .catch((err: any) => {
        console.error("[invite] link generation failed:", err);
        setDetail(err?.message ?? String(err));
        setState("error");
      });
  };

  useEffect(() => {
    if (visible) {
      run();
    } else {
      setState("generating");
      setUrl("");
      setDetail("");
    }
  }, [visible]);

  const handleShare = async () => {
    await shareLink(url, "", t("linkCopied"));
  };

  return (
    <Sheet visible={visible} onDismiss={onClose} backgroundColor={theme.card}>
      {/* paddingHorizontal: BottomSheet already adds 16px iOS insets; 8px adds a bit more breathing room.
          paddingTop: BottomSheet handles drag indicator + 16px top chrome — no extra top padding needed.
          Web fallback: these insets substitute for the BottomSheet chrome that only exists on native. */}
      <View style={{ backgroundColor: theme.card, paddingHorizontal: 8, paddingTop: 8, paddingBottom: 40 }}>

        {state === "generating" && (
          <View style={{ alignItems: "center", paddingVertical: 48, gap: 16 }}>
            <ActivityIndicator size="large" color={theme.clay} />
            <Text style={{ fontSize: 14, color: theme.mute, textAlign: "center" }}>
              {t("inviteGenerating")}
            </Text>
          </View>
        )}

        {state === "ready" && (
          <>
            {/* Header row */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 18, fontWeight: "700", color: theme.ink, letterSpacing: -0.3 }}>
                {t("shareInviteLink")}
              </Text>
              <Text style={{ fontSize: 13, color: theme.mute, marginTop: 2 }}>
                {t("scanFromOtherDevice")}
              </Text>
            </View>

            {/* QR code card */}
            <View style={{ alignItems: "center", marginBottom: 20 }}>
              <View style={{
                backgroundColor: "#ffffff",
                padding: 16,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: theme.hair,
              }}>
                <QRCode value={url} size={184} />
              </View>
            </View>

            {/* Share button */}
            <Pressable
              onPress={handleShare}
              style={({ pressed }) => ({
                backgroundColor: theme.clay,
                borderRadius: 16,
                paddingVertical: 16,
                alignItems: "center",
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <Text style={{ color: "#ffffff", fontWeight: "600", fontSize: 16 }}>
                {t("shareLink")}
              </Text>
            </Pressable>
          </>
        )}

        {state === "error" && (
          <>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <View style={{
                width: 44, height: 44, borderRadius: 14,
                backgroundColor: "#fef2f2",
                alignItems: "center", justifyContent: "center",
              }}>
                <AlertCircle size={20} color="#EF4444" />
              </View>
              <Text style={{ fontSize: 18, fontWeight: "700", color: theme.ink, flex: 1 }}>
                {t("inviteErrorTitle")}
              </Text>
            </View>

            <Text style={{ fontSize: 14, color: theme.mute, lineHeight: 20, marginBottom: 16 }}>
              {t("inviteErrorBody")}
            </Text>

            {detail ? (
              <View style={{
                backgroundColor: theme.paper,
                borderRadius: 12,
                paddingHorizontal: 12,
                paddingVertical: 8,
                marginBottom: 24,
                overflow: "hidden",
              }}>
                <Text
                  selectable
                  numberOfLines={4}
                  style={{ fontSize: 11, color: theme.mute, lineHeight: 16 }}
                >
                  {detail}
                </Text>
              </View>
            ) : (
              <View style={{ marginBottom: 24 }} />
            )}

            <Pressable
              onPress={run}
              style={({ pressed }) => ({
                backgroundColor: theme.clay,
                borderRadius: 16,
                paddingVertical: 16,
                alignItems: "center",
                opacity: pressed ? 0.8 : 1,
                marginBottom: 12,
              })}
            >
              <Text style={{ color: "#ffffff", fontWeight: "600", fontSize: 16 }}>
                {t("inviteRetry")}
              </Text>
            </Pressable>

            <Pressable
              onPress={onClose}
              style={({ pressed }) => ({ alignItems: "center", paddingVertical: 8, opacity: pressed ? 0.6 : 1 })}
            >
              <Text style={{ fontSize: 14, color: theme.mute }}>
                {t("cancel")}
              </Text>
            </Pressable>
          </>
        )}
      </View>
    </Sheet>
  );
}
