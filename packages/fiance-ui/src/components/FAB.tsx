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
      style={({ pressed }) => ({
        position: "absolute",
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: pressed ? "#a55c3e" : "#b96a4a",
        alignItems: "center",
        justifyContent: "center",
        elevation: 6,
        shadowColor: "#b96a4a",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
      })}
    >
      <Icon size={26} color="white" />
    </Pressable>
  );
}
