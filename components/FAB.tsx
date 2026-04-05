import React from "react";
import { Pressable } from "react-native";
import { Plus } from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";

interface FABProps {
  onPress: () => void;
  icon?: LucideIcon;
}

export function FAB({ onPress, icon: Icon = Plus }: FABProps) {
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
      <Icon size={26} color="white" />
    </Pressable>
  );
}
