import React from "react";
import { View, Pressable } from "react-native-css/components";
import { Plus, Lock } from "lucide-react-native";
import { useCanEditHere } from "@/lib/permissions/useCanEditHere";

interface HeaderAddButtonProps {
  onPress: () => void;
  accessibilityLabel: string;
  /** Free-tier cap reached — tapping still opens the paywall (never disabled),
   * but a small lock badge makes that outcome expected instead of a surprise. */
  locked?: boolean;
}

export function HeaderAddButton({ onPress, accessibilityLabel, locked = false }: HeaderAddButtonProps) {
  const canEdit = useCanEditHere();
  if (!canEdit) return null;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      className="w-9 h-9 items-center justify-center rounded-lg active:opacity-60 mr-1"
      hitSlop={8}
      style={{ position: "relative" }}
    >
      <Plus size={24} color="#b96a4a" />
      {locked && (
        <View
          className="w-3.5 h-3.5 rounded-full bg-primary-500 items-center justify-center"
          style={{ position: "absolute", bottom: 2, right: 0 }}
        >
          <Lock size={8} color="#fff" />
        </View>
      )}
    </Pressable>
  );
}
