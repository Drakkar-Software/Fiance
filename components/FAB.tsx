import React from "react";
import { Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface FABProps {
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
}

export function FAB({ onPress, icon = "add" }: FABProps) {
  return (
    <Pressable
      onPress={onPress}
      className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-primary-500 items-center justify-center active:bg-primary-600"
      style={{
        elevation: 6,
        shadowColor: "#EC4899",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
      }}
    >
      <Ionicons name={icon} size={26} color="white" />
    </Pressable>
  );
}
