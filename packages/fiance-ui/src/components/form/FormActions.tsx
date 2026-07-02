import React from "react";
import { View } from "react-native-css/components";
import { Button } from "../../primitives/button";
import { useForgeTheme } from "../../theme/context";

interface FormActionsProps {
  saveLabel: string;
  cancelLabel: string;
  onSave: () => void;
  onCancel: () => void;
  /** Disable the primary action (e.g. invalid form). */
  saveDisabled?: boolean;
  /** Render the primary action in the destructive color. */
  destructive?: boolean;
}

/**
 * Standard side-by-side form action row (primary Save/Create + Cancel), built on
 * the native @expo/ui Button primitive. Replaces the hand-rolled
 * `bg-primary-500` / `bg-accent-paper` Pressable pill pairs repeated across the
 * CRUD screens. Uses the same variant="text" + custom-fill + labelColor
 * pattern as ConfirmSheet/RenameSheet so it avoids .borderedProminent's native
 * chrome fighting the custom background, and `fill` so each half spans its
 * flex-1 column.
 */
export function FormActions({
  saveLabel,
  cancelLabel,
  onSave,
  onCancel,
  saveDisabled = false,
  destructive = false,
}: FormActionsProps) {
  const { colors } = useForgeTheme();
  return (
    <View className="flex-row gap-3">
      <View className="flex-1">
        <Button
          fill
          variant="text"
          label={saveLabel}
          onPress={onSave}
          disabled={saveDisabled}
          labelColor={colors.onPrimary}
          style={{
            backgroundColor: destructive ? colors.destructive : colors.primary,
            paddingVertical: 12,
            borderRadius: 16,
            opacity: saveDisabled ? 0.4 : 1,
          }}
        />
      </View>
      <View className="flex-1">
        <Button
          fill
          variant="outlined"
          label={cancelLabel}
          onPress={onCancel}
          style={{ paddingVertical: 12, borderRadius: 16 }}
        />
      </View>
    </View>
  );
}
