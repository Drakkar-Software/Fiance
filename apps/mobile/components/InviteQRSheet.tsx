import React, { useEffect, useState } from "react";
import { View, Text, Pressable } from "react-native-css/components";
import { ActivityIndicator } from "react-native";
import { useTranslation } from "react-i18next";
import { shareLink } from "@/lib/share";
import { Sheet } from "@drakkar.software/seahorse/components";
import { AlertCircle } from "lucide-react-native";
import QRCode from "react-native-qrcode-svg";

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
      // Reset so next open starts fresh
      setState("generating");
      setUrl("");
      setDetail("");
    }
  }, [visible]);

  const handleShare = async () => {
    await shareLink(url, t("joinOurWedding", { url }), t("linkCopied"));
  };

  return (
    <Sheet visible={visible} onDismiss={onClose}>
      <View className="bg-accent-card rounded-t-3xl px-6 pt-6 pb-10">
        {state === "generating" && (
          <View className="items-center py-12 gap-4">
            <ActivityIndicator size="large" color="#b96a4a" />
            <Text className="text-sm text-mute text-center">
              {t("inviteGenerating")}
            </Text>
          </View>
        )}

        {state === "ready" && (
          <>
            <Text className="text-xl font-bold text-ink mb-1">
              {t("shareInviteLink")}
            </Text>
            <Text className="text-sm text-mute mb-6">
              {t("scanFromOtherDevice")}
            </Text>

            <View className="items-center mb-4">
              <View className="bg-white p-3 rounded-2xl shadow-sm">
                <QRCode value={url} size={160} />
              </View>
            </View>

            <View className="overflow-hidden mb-6">
              <Text
                selectable
                className="text-xs text-mute text-center font-mono"
                numberOfLines={1}
                ellipsizeMode="middle"
              >
                {url}
              </Text>
            </View>

            <Pressable
              onPress={handleShare}
              className="bg-primary-500 rounded-2xl py-3.5 items-center active:opacity-80"
            >
              <Text className="text-white font-semibold text-base">{t("shareLink")}</Text>
            </Pressable>
          </>
        )}

        {state === "error" && (
          <>
            <View className="flex-row items-center gap-3 mb-4">
              <View className="w-10 h-10 rounded-xl bg-red-50 items-center justify-center">
                <AlertCircle size={20} color="#EF4444" />
              </View>
              <Text className="text-lg font-bold text-ink flex-1">
                {t("inviteErrorTitle")}
              </Text>
            </View>

            <Text className="text-sm text-mute leading-5 mb-4">
              {t("inviteErrorBody")}
            </Text>

            {detail ? (
              <View className="bg-accent-paper rounded-xl px-3 py-2 mb-6">
                <Text
                  selectable
                  className="text-xs text-mute font-mono leading-4"
                  numberOfLines={4}
                >
                  {detail}
                </Text>
              </View>
            ) : (
              <View className="mb-6" />
            )}

            <Pressable
              onPress={run}
              className="bg-primary-500 rounded-2xl py-3.5 items-center active:opacity-80 mb-3"
            >
              <Text className="text-white font-semibold text-base">{t("inviteRetry")}</Text>
            </Pressable>

            <Pressable
              onPress={onClose}
              className="items-center py-2 active:opacity-60"
            >
              <Text className="text-sm text-mute">{t("cancel")}</Text>
            </Pressable>
          </>
        )}
      </View>
    </Sheet>
  );
}
