import React from "react";
import { View } from "react-native-css/components";
import { Button } from "../../primitives/button";

interface SaveHeaderButtonProps {
  label: string;
  enabled: boolean;
  onPress: () => void;
}

// Nav-bar action, not a body pill: plain/tinted text like a native iOS header
// button (no custom background/pill — "filled" fought its own native chrome
// here, and a stack header button doesn't need that styling anyway).
export function SaveHeaderButton({ label, enabled, onPress }: SaveHeaderButtonProps) {
  return (
    <View style={{ marginRight: 8 }}>
      <Button
        variant="text"
        label={label}
        onPress={onPress}
        disabled={!enabled}
        style={{ opacity: enabled ? 1 : 0.4 }}
      />
    </View>
  );
}
