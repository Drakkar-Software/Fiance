import React from "react";
import { View, Text } from "react-native-css/components";
import { Pressable } from "../../primitives/pressable";
import { Delete, Fingerprint } from "lucide-react-native";

// Re-export pure helpers so consumers can import them alongside the component.
export { handlePinDigit, handlePinDelete } from "../../utils/pin-helpers";
export type { PinDigitResult } from "../../utils/pin-helpers";

// ── PinPad component ──────────────────────────────────────────────────────────

interface PinPadProps {
  pin: string;
  pinLength: number;
  error: boolean;
  onDigit: (digit: string) => void;
  onDelete: () => void;
  /** When provided, shows a biometric button in the bottom-left key slot. */
  onBiometric?: () => void;
  /** Color for the biometric icon (defaults to black). */
  biometricColor?: string;
}

/** Shared PIN dot indicators + number grid used by LockScreen and PinSetup. */
export function PinPad({
  pin,
  pinLength,
  error,
  onDigit,
  onDelete,
  onBiometric,
  biometricColor = "#000",
}: PinPadProps) {
  const rows = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    [onBiometric ? "bio" : "", "0", "del"],
  ];

  return (
    <View className="items-center">
      {/* PIN dots */}
      <View className="flex-row gap-4 mb-8">
        {Array.from({ length: pinLength }).map((_, i) => (
          <View
            key={i}
            className={`w-4 h-4 rounded-full ${
              error
                ? "bg-error-500"
                : i < pin.length
                  ? "bg-primary-500"
                  : "bg-outline-200"
            }`}
          />
        ))}
      </View>

      {/* Number pad */}
      <View className="w-full max-w-xs">
        {rows.map((row, ri) => (
          <View key={ri} className="flex-row justify-center gap-6 mb-4">
            {row.map((key) => {
              if (key === "") {
                return <View key="empty" style={{ width: 72, height: 72 }} />;
              }
              if (key === "del") {
                return (
                  <Pressable
                    key="del"
                    onPress={onDelete}
                    className="items-center justify-center"
                    style={{ width: 72, height: 72 }}
                  >
                    <Delete size={24} className="text-typography-400" />
                  </Pressable>
                );
              }
              if (key === "bio") {
                return (
                  <Pressable
                    key="bio"
                    onPress={onBiometric}
                    className="items-center justify-center"
                    style={{ width: 72, height: 72 }}
                  >
                    <Fingerprint size={24} color={biometricColor} />
                  </Pressable>
                );
              }
              return (
                <Pressable
                  key={key}
                  onPress={() => onDigit(key)}
                  className="rounded-full bg-background-0 border border-outline-100 items-center justify-center active:bg-background-900"
                  style={{ width: 72, height: 72 }}
                >
                  <Text className="text-2xl font-medium text-typography-900">
                    {key}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}
