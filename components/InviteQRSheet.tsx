import React, { useRef, useEffect, useCallback } from "react";
import { View, Text, Pressable, Share } from "react-native";
import { useTranslation } from "react-i18next";
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView } from "@gorhom/bottom-sheet";
import QRCode from "react-native-qrcode-svg";

interface InviteQRSheetProps {
  visible: boolean;
  onClose: () => void;
  inviteUrl: string;
}

export function InviteQRSheet({ visible, onClose, inviteUrl }: InviteQRSheetProps) {
  const { t } = useTranslation("settings");
  const ref = useRef<BottomSheetModal>(null);

  useEffect(() => {
    if (visible) {
      ref.current?.present();
    } else {
      ref.current?.dismiss();
    }
  }, [visible]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} pressBehavior="close" />
    ),
    []
  );

  const handleShare = async () => {
    try {
      await Share.share({ message: t("joinOurWedding", { url: inviteUrl }) });
    } catch {
      // User cancelled
    }
  };

  return (
    <BottomSheetModal
      ref={ref}
      enableDynamicSizing
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      onDismiss={onClose}
      backgroundStyle={{ backgroundColor: "transparent" }}
      handleComponent={() => null}
    >
      <BottomSheetView>
        <View className="bg-white dark:bg-gray-900 rounded-t-3xl px-6 pt-6 pb-10">
          <View className="w-10 h-1 rounded-full bg-gray-200 dark:bg-gray-700 self-center mb-5" />
          <Text className="text-xl font-bold text-gray-900 dark:text-white mb-1">
            {t("shareInviteLink")}
          </Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            {t("scanFromOtherDevice")}
          </Text>

          <View className="items-center mb-6">
            <View className="bg-white p-4 rounded-2xl shadow-sm">
              <QRCode value={inviteUrl} size={200} />
            </View>
          </View>

          <Text
            selectable
            className="text-xs text-gray-400 dark:text-gray-500 text-center mb-6 font-mono"
            numberOfLines={2}
          >
            {inviteUrl}
          </Text>

          <Pressable
            onPress={handleShare}
            className="bg-primary-500 rounded-2xl py-3.5 items-center active:opacity-80"
          >
            <Text className="text-white font-semibold text-base">{t("shareLink")}</Text>
          </Pressable>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}
