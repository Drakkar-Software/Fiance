import React from "react";
import { Pressable, Text } from "react-native";

interface DeleteButtonProps {
  label: string;
  onPress: () => void;
}

export function DeleteButton({ label, onPress }: DeleteButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      className="bg-red-50 dark:bg-red-950 rounded-2xl p-4 mb-8 items-center border border-red-100 dark:border-red-900"
    >
      <Text className="text-red-500 font-semibold text-sm">{label}</Text>
    </Pressable>
  );
}
