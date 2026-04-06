import React from "react";
import { View, Text, Pressable, Modal } from "react-native";
import { useTranslation } from "react-i18next";

interface ConfirmSheetProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmSheet({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel,
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmSheetProps) {
  const { t } = useTranslation("common");
  const confirm = confirmLabel ?? t("confirm");
  const cancel = cancelLabel ?? t("cancel");
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <Pressable
        className="flex-1 bg-black/40 justify-end"
        onPress={onCancel}
      >
        <Pressable
          className="bg-white dark:bg-gray-900 rounded-t-3xl px-6 pt-6 pb-10"
          onPress={(e) => e.stopPropagation()}
        >
          <View className="w-10 h-1 rounded-full bg-gray-200 dark:bg-gray-700 self-center mb-5" />
          <Text className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {title}
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 mb-6 leading-5">
            {message}
          </Text>
          <View className="gap-3">
            <Pressable
              onPress={onConfirm}
              className={`py-3.5 rounded-2xl items-center ${
                destructive ? "bg-red-500" : "bg-primary-500"
              } active:opacity-80`}
            >
              <Text className="text-white font-semibold text-base">
                {confirm}
              </Text>
            </Pressable>
            <Pressable
              onPress={onCancel}
              className="py-3.5 rounded-2xl items-center bg-gray-100 dark:bg-gray-800 active:opacity-80"
            >
              <Text className="text-gray-700 dark:text-gray-300 font-medium text-base">
                {cancel}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
