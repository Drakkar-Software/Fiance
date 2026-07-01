import React, { useState, useEffect, useCallback } from "react";
import { View, Text } from "react-native-css/components";
import { Lock } from "lucide-react-native";
import { verifyPin, hasBiometrics, authenticateWithBiometrics } from "../../utils/app-lock";
import { useForgeTheme } from "../../theme/context";
import { PinPad } from "./PinPad";
import { handlePinDigit, handlePinDelete } from "../../utils/pin-helpers";

const DEFAULT_PIN_LENGTH = 4;

interface LockScreenLabels {
  title?: string;
  subtitle?: string;
  errorLabel?: string;
  biometricPromptMessage?: string;
  biometricCancelLabel?: string;
}

interface LockScreenProps {
  onUnlock: () => void;
  pinLength?: number;
  labels?: LockScreenLabels;
}

export function LockScreen({ onUnlock, pinLength = DEFAULT_PIN_LENGTH, labels = {} }: LockScreenProps) {
  const { colors } = useForgeTheme();
  const {
    title,
    subtitle = "Enter your PIN",
    errorLabel = "Incorrect PIN",
    biometricPromptMessage = "Unlock app",
    biometricCancelLabel = "Use PIN",
  } = labels;

  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  useEffect(() => {
    hasBiometrics().then(setBiometricAvailable);
  }, []);

  const tryBiometric = useCallback(async () => {
    const success = await authenticateWithBiometrics(biometricPromptMessage, biometricCancelLabel);
    if (success) onUnlock();
  }, [onUnlock, biometricPromptMessage, biometricCancelLabel]);

  useEffect(() => {
    if (biometricAvailable) tryBiometric();
  }, [biometricAvailable]);

  const handleDigit = useCallback(
    (digit: string) => {
      const { nextPin, isComplete } = handlePinDigit(pin, digit, pinLength);
      setError(false);
      if (isComplete) {
        verifyPin(nextPin).then((ok) => {
          if (ok) {
            onUnlock();
          } else {
            setError(true);
            setPin("");
          }
        });
      } else {
        setPin(nextPin);
      }
    },
    [pin, onUnlock, pinLength]
  );

  const handleDelete = useCallback(() => {
    setPin((p) => handlePinDelete(p));
    setError(false);
  }, []);

  return (
    <View className="flex-1 bg-background-0 items-center justify-center px-8">
      <View className="w-14 h-14 rounded-2xl bg-primary-50 items-center justify-center mb-6">
        <Lock size={28} color={colors.primary} />
      </View>
      {title && (
        <Text className="text-xl font-bold text-typography-900 mb-2">{title}</Text>
      )}
      <Text className="text-sm text-typography-400 mb-8">{subtitle}</Text>

      <PinPad
        pin={pin}
        pinLength={pinLength}
        error={error}
        onDigit={handleDigit}
        onDelete={handleDelete}
        onBiometric={biometricAvailable ? tryBiometric : undefined}
        biometricColor={colors.primary}
      />

      {error && <Text className="text-sm text-error-500 mt-2">{errorLabel}</Text>}
    </View>
  );
}
