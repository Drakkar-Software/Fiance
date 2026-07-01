import React from "react";
import { View } from "react-native-css/components";
import { Button } from "../../primitives/button";
import { useForgeTheme } from "../../theme/context";

interface DeleteButtonProps {
  label: string;
  onPress: () => void;
}

export function DeleteButton({ label, onPress }: DeleteButtonProps) {
  const { colors } = useForgeTheme();
  return (
    <View className="mb-8">
      <Button
        variant="filled"
        label={label}
        onPress={onPress}
        style={{ backgroundColor: colors.destructive, borderRadius: 16, padding: 16 }}
      />
    </View>
  );
}
