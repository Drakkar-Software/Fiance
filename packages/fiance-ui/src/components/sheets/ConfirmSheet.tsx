import React from "react";
import { View, Text } from "react-native-css/components";
import { BottomSheet } from "../../primitives/bottom-sheet";
import { Button } from "../../primitives/button";
import { useForgeTheme } from "../../theme/context";

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
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmSheetProps) {
  const { colors } = useForgeTheme();
  return (
    <BottomSheet visible={visible} onDismiss={onCancel}>
      <View className="bg-background-0 rounded-t-3xl px-6 pt-6 pb-10">
        <Text className="text-xl font-bold text-typography-900 mb-2">{title}</Text>
        <Text className="text-typography-500 mb-6 leading-5">{message}</Text>
        <View className="gap-3">
          <Button
            variant="filled"
            label={confirmLabel}
            onPress={onConfirm}
            style={{
              backgroundColor: destructive ? colors.destructive : colors.primary,
              paddingVertical: 14,
              borderRadius: 16,
            }}
          />
          <Button
            variant="outlined"
            label={cancelLabel}
            onPress={onCancel}
            style={{ paddingVertical: 14, borderRadius: 16 }}
          />
        </View>
      </View>
    </BottomSheet>
  );
}
