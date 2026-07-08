import React from "react";
import { Pressable } from "react-native-css/components";
import { Plus } from "lucide-react-native";
import { useCanEditHere } from "@/lib/permissions/useCanEditHere";

interface HeaderAddButtonProps {
  onPress: () => void;
  accessibilityLabel: string;
}

export function HeaderAddButton({ onPress, accessibilityLabel }: HeaderAddButtonProps) {
  const canEdit = useCanEditHere();
  if (!canEdit) return null;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      className="w-9 h-9 items-center justify-center rounded-lg active:opacity-60 mr-1"
      hitSlop={8}
    >
      <Plus size={24} color="#b96a4a" />
    </Pressable>
  );
}
