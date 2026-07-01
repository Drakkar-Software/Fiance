import React, { useEffect, useCallback, useState } from "react";
import { View, Text } from "react-native-css/components";
import { Input } from "../../primitives/input";
import { Button } from "../../primitives/button";
import { BottomSheet } from "../../primitives/bottom-sheet";

interface RenameSheetProps {
  visible: boolean;
  title: string;
  initialValue: string;
  placeholder?: string;
  saveLabel?: string;
  cancelLabel?: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
}

export function RenameSheet({
  visible,
  title,
  initialValue,
  placeholder,
  saveLabel = "Save",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}: RenameSheetProps) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    if (visible) setValue(initialValue);
  }, [visible, initialValue]);

  const handleConfirm = useCallback(() => {
    if (value.trim()) onConfirm(value.trim());
  }, [value, onConfirm]);

  return (
    <BottomSheet visible={visible} onDismiss={onCancel}>
      <View className="bg-background-0 rounded-t-3xl px-6 pt-6 pb-10">
        <Text className="text-xl font-bold text-typography-900 mb-4">{title}</Text>
        <View className="mb-4">
          <Input
            value={value}
            onChangeText={setValue}
            placeholder={placeholder}
            placeholderTextColor="rgb(212, 212, 212)"
            autoFocus
            style={{
              backgroundColor: "rgb(247, 249, 250)",
              borderRadius: 12,
              paddingHorizontal: 14,
              paddingVertical: 12,
              borderWidth: 1,
              borderColor: "rgb(230, 230, 230)",
            }}
            textStyle={{
              fontSize: 16,
              color: "rgb(38, 38, 39)",
            }}
          />
        </View>
        <View className="gap-3">
          <Button
            variant="filled"
            label={saveLabel}
            onPress={handleConfirm}
            style={{ paddingVertical: 14, borderRadius: 16 }}
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
