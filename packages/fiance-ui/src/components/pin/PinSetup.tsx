import React, { useState, useCallback } from "react";
import { View, Text } from "react-native-css/components";
import { Pressable } from "../../primitives/pressable";
import { Modal } from "react-native";
import { Lock, X } from "lucide-react-native";
import { savePin, setLockEnabled } from "../../utils/app-lock";
import { useForgeTheme } from "../../theme/context";
import { PinPad } from "./PinPad";
import { handlePinDigit, handlePinDelete } from "../../utils/pin-helpers";

const DEFAULT_PIN_LENGTH = 4;

interface PinSetupLabels {
  createTitle?: string;
  confirmTitle?: string;
  createSubtitle?: string;
  confirmSubtitle?: string;
  mismatchError?: string;
}

interface PinSetupProps {
  visible: boolean;
  onComplete: () => void;
  onCancel: () => void;
  pinLength?: number;
  labels?: PinSetupLabels;
}

export function PinSetup({
  visible,
  onComplete,
  onCancel,
  pinLength = DEFAULT_PIN_LENGTH,
  labels = {},
}: PinSetupProps) {
  const { colors } = useForgeTheme();
  const {
    createTitle = "Create a PIN",
    confirmTitle = "Confirm your PIN",
    createSubtitle = `Choose a ${pinLength}-digit code`,
    confirmSubtitle = "Enter the same code to confirm",
    mismatchError = "Codes do not match",
  } = labels;

  const [step, setStep] = useState<"create" | "confirm">("create");
  const [firstPin, setFirstPin] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  const reset = useCallback(() => {
    setStep("create");
    setFirstPin("");
    setPin("");
    setError(false);
  }, []);

  const handleDigit = useCallback(
    (digit: string) => {
      const { nextPin, isComplete } = handlePinDigit(pin, digit, pinLength);
      setError(false);
      if (isComplete) {
        if (step === "create") {
          setFirstPin(nextPin);
          setPin("");
          setStep("confirm");
        } else {
          if (nextPin === firstPin) {
            savePin(nextPin).then(() =>
              setLockEnabled(true).then(() => {
                reset();
                onComplete();
              })
            );
          } else {
            setError(true);
            setPin("");
          }
        }
      } else {
        setPin(nextPin);
      }
    },
    [pin, step, firstPin, onComplete, reset, pinLength]
  );

  const handleDelete = useCallback(() => {
    setPin((p) => handlePinDelete(p));
    setError(false);
  }, []);

  const handleCancel = useCallback(() => {
    reset();
    onCancel();
  }, [onCancel, reset]);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <View className="flex-1 bg-background-0 items-center justify-center px-8">
        <Pressable
          onPress={handleCancel}
          className="absolute top-14 right-6 w-10 h-10 items-center justify-center"
        >
          <X size={24} className="text-typography-400" />
        </Pressable>

        <View className="w-14 h-14 rounded-2xl bg-primary-50 items-center justify-center mb-6">
          <Lock size={28} color={colors.primary} />
        </View>
        <Text className="text-xl font-bold text-typography-900 mb-2">
          {step === "create" ? createTitle : confirmTitle}
        </Text>
        <Text className="text-sm text-typography-400 mb-8">
          {step === "create" ? createSubtitle : confirmSubtitle}
        </Text>

        <PinPad
          pin={pin}
          pinLength={pinLength}
          error={error}
          onDigit={handleDigit}
          onDelete={handleDelete}
        />

        {error && <Text className="text-sm text-error-500 mt-2">{mismatchError}</Text>}
      </View>
    </Modal>
  );
}
