import React from "react";
import { Pressable, Text } from "react-native";

interface SaveHeaderButtonProps {
  label: string;
  enabled: boolean;
  onPress: () => void;
}

export function SaveHeaderButton({ label, enabled, onPress }: SaveHeaderButtonProps) {
  return (
    <Pressable
      onPress={enabled ? onPress : undefined}
      style={{
        marginRight: 8,
        backgroundColor: enabled ? "#EC4899" : "#9CA3AF",
        borderRadius: 999,
        paddingHorizontal: 16,
        paddingVertical: 6,
        opacity: enabled ? 1 : 0.4,
      }}
    >
      <Text style={{ color: "#fff", fontWeight: "600", fontSize: 14 }}>
        {label}
      </Text>
    </Pressable>
  );
}
