import React from "react";
import { View } from "react-native-css/components";
import { foregroundStyle, minimumScaleFactor } from "@expo/ui/swift-ui/modifiers";
import { Button } from "../../primitives/button";
import { useForgeTheme } from "../../theme/context";

interface DeleteButtonProps {
  label: string;
  onPress: () => void;
  /** Tighter padding + shrink-to-fit label — for narrower (e.g. half-width) rows. */
  compact?: boolean;
}

export function DeleteButton({ label, onPress, compact = false }: DeleteButtonProps) {
  const { colors } = useForgeTheme();
  return (
    <View className={compact ? "" : "mb-8"}>
      <Button
        fill
        variant="text"
        label={label}
        onPress={onPress}
        // variant="text" avoids "filled"/.borderedProminent's native chrome fighting
        // our custom backgroundColor (visible as a halo); force white label text
        // since .plain has no automatic white-on-fill contrast. minimumScaleFactor
        // lets a long label shrink to fit instead of truncating/overflowing when
        // the button is squeezed narrower (compact).
        modifiers={[
          foregroundStyle(colors.onPrimary),
          ...(compact ? [minimumScaleFactor(0.75)] : []),
        ]}
        style={{
          backgroundColor: colors.destructive,
          borderRadius: 16,
          padding: compact ? 14 : 16,
        }}
      />
    </View>
  );
}
