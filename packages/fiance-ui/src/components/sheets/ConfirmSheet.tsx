import React from "react";
import { Platform } from "react-native";
import { View, Text } from "react-native-css/components";
import { foregroundStyle } from "@expo/ui/swift-ui/modifiers";
import { Button } from "../../primitives/button";
import { useForgeTheme } from "../../theme/context";
import { SheetScaffold } from "./SheetScaffold";

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
    <SheetScaffold
      visible={visible}
      onDismiss={onCancel}
      title={title}
      snapPoints={Platform.OS === "ios" ? ["40%"] : undefined}
      footer={
        <View className="gap-3">
          <Button
            fill
            // variant="text" (SwiftUI .plain) avoids .borderedProminent's native
            // chrome fighting the custom backgroundColor; force white label since
            // .plain has no automatic on-fill contrast.
            variant="text"
            label={confirmLabel}
            onPress={onConfirm}
            modifiers={[foregroundStyle(colors.onPrimary)]}
            style={{
              backgroundColor: destructive ? colors.destructive : colors.primary,
              paddingVertical: 14,
              borderRadius: 16,
            }}
          />
          <Button
            fill
            variant="outlined"
            label={cancelLabel}
            onPress={onCancel}
            style={{ paddingVertical: 14, borderRadius: 16 }}
          />
        </View>
      }
    >
      <Text className="text-typography-500 leading-5">{message}</Text>
    </SheetScaffold>
  );
}
