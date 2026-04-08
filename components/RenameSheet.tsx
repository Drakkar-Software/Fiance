import React, { useRef, useEffect, useCallback, useState } from "react";
import { View, Text, Pressable, TextInput } from "react-native";
import { useTranslation } from "react-i18next";
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";

interface RenameSheetProps {
  visible: boolean;
  title: string;
  initialValue: string;
  placeholder?: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
}

export function RenameSheet({
  visible,
  title,
  initialValue,
  placeholder,
  onConfirm,
  onCancel,
}: RenameSheetProps) {
  const { t } = useTranslation("common");
  const ref = useRef<BottomSheetModal>(null);
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    if (visible) {
      setValue(initialValue);
      ref.current?.present();
    } else {
      ref.current?.dismiss();
    }
  }, [visible, initialValue]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        pressBehavior="close"
      />
    ),
    []
  );

  const handleConfirm = useCallback(() => {
    if (value.trim()) onConfirm(value.trim());
  }, [value, onConfirm]);

  return (
    <BottomSheetModal
      ref={ref}
      enableDynamicSizing
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      onDismiss={onCancel}
      backgroundStyle={{ backgroundColor: "transparent" }}
      handleComponent={() => null}
    >
      <BottomSheetView>
        <View className="bg-white dark:bg-gray-900 rounded-t-3xl px-6 pt-6 pb-10">
          <View className="w-10 h-1 rounded-full bg-gray-200 dark:bg-gray-700 self-center mb-5" />
          <Text className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            {title}
          </Text>
          <TextInput
            value={value}
            onChangeText={setValue}
            placeholder={placeholder}
            placeholderTextColor="#D0D0D8"
            autoFocus
            style={{
              fontSize: 16,
              color: "#111827",
              backgroundColor: "#F9FAFB",
              borderRadius: 12,
              paddingHorizontal: 14,
              paddingVertical: 12,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: "#E5E7EB",
            }}
          />

          <View className="gap-3">
            <Pressable
              onPress={handleConfirm}
              className="py-3.5 rounded-2xl items-center bg-primary-500 active:opacity-80"
            >
              <Text className="text-white font-semibold text-base">
                {t("save")}
              </Text>
            </Pressable>
            <Pressable
              onPress={onCancel}
              className="py-3.5 rounded-2xl items-center bg-gray-100 dark:bg-gray-800 active:opacity-80"
            >
              <Text className="text-gray-700 dark:text-gray-300 font-medium text-base">
                {t("cancel")}
              </Text>
            </Pressable>
          </View>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}
