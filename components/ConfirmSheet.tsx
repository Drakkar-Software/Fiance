import React from "react";
import { View, Text, Pressable, Modal } from "react-native";

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
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmSheetProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <Pressable
        className="flex-1 bg-black/50 justify-end"
        onPress={onCancel}
      >
        <Pressable
          className="bg-white dark:bg-gray-900 rounded-t-3xl p-6"
          onPress={(e) => e.stopPropagation()}
        >
          <Text className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {title}
          </Text>
          <Text className="text-gray-600 dark:text-gray-400 mb-6">
            {message}
          </Text>
          <View className="gap-3">
            <Pressable
              onPress={onConfirm}
              className={`py-3 rounded-xl items-center ${
                destructive ? "bg-red-500" : "bg-primary-500"
              } active:opacity-80`}
            >
              <Text className="text-white font-semibold text-base">
                {confirmLabel}
              </Text>
            </Pressable>
            <Pressable
              onPress={onCancel}
              className="py-3 rounded-xl items-center bg-gray-100 dark:bg-gray-800 active:opacity-80"
            >
              <Text className="text-gray-700 dark:text-gray-300 font-medium text-base">
                {cancelLabel}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
