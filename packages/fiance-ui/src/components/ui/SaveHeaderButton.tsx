import React from "react";
import { View } from "react-native-css/components";
import { Button } from "../../primitives/button";
import { useForgeTheme } from "../../theme/context";

interface SaveHeaderButtonProps {
  label: string;
  enabled: boolean;
  onPress: () => void;
}

export function SaveHeaderButton({ label, enabled, onPress }: SaveHeaderButtonProps) {
  const { colors } = useForgeTheme();
  return (
    <View style={{ marginRight: 8 }}>
      <Button
        variant="filled"
        label={label}
        onPress={onPress}
        disabled={!enabled}
        style={{
          backgroundColor: enabled ? colors.primary : "rgb(163, 163, 163)",
          borderRadius: 999,
          paddingHorizontal: 16,
          paddingVertical: 6,
          opacity: enabled ? 1 : 0.4,
        }}
      />
    </View>
  );
}
