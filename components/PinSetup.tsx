import React, { useState, useCallback } from "react";
import { View, Text, Pressable, Modal } from "react-native";
import { Lock, Delete, X } from "lucide-react-native";
import { savePin, setLockEnabled } from "@/lib/app-lock";

const PIN_LENGTH = 4;

export function PinSetup({
  visible,
  onComplete,
  onCancel,
}: {
  visible: boolean;
  onComplete: () => void;
  onCancel: () => void;
}) {
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
      if (pin.length >= PIN_LENGTH) return;
      const next = pin + digit;
      setError(false);

      if (next.length === PIN_LENGTH) {
        if (step === "create") {
          setFirstPin(next);
          setPin("");
          setStep("confirm");
        } else {
          if (next === firstPin) {
            savePin(next).then(() =>
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
        setPin(next);
      }
    },
    [pin, step, firstPin, onComplete, reset]
  );

  const handleDelete = useCallback(() => {
    setPin((p) => p.slice(0, -1));
    setError(false);
  }, []);

  const handleCancel = useCallback(() => {
    reset();
    onCancel();
  }, [onCancel, reset]);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <View className="flex-1 bg-gray-50 dark:bg-gray-950 items-center justify-center px-8">
        <Pressable
          onPress={handleCancel}
          className="absolute top-14 right-6 w-10 h-10 items-center justify-center"
        >
          <X size={24} color="#9CA3AF" />
        </Pressable>

        <View className="w-14 h-14 rounded-2xl bg-primary-50 dark:bg-primary-900 items-center justify-center mb-6">
          <Lock size={28} color="#EC4899" />
        </View>
        <Text className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {step === "create" ? "Créer un code PIN" : "Confirmer le code PIN"}
        </Text>
        <Text className="text-sm text-gray-400 mb-8">
          {step === "create"
            ? "Choisissez un code à 4 chiffres"
            : "Entrez le même code pour confirmer"}
        </Text>

        {/* PIN dots */}
        <View className="flex-row gap-4 mb-8">
          {Array.from({ length: PIN_LENGTH }).map((_, i) => (
            <View
              key={i}
              className={`w-4 h-4 rounded-full ${
                error
                  ? "bg-red-500"
                  : i < pin.length
                  ? "bg-primary-500"
                  : "bg-gray-200 dark:bg-gray-700"
              }`}
            />
          ))}
        </View>

        {error && (
          <Text className="text-sm text-red-500 mb-4">
            Les codes ne correspondent pas
          </Text>
        )}

        {/* Number pad */}
        <View className="w-full max-w-xs">
          {[
            ["1", "2", "3"],
            ["4", "5", "6"],
            ["7", "8", "9"],
            ["", "0", "del"],
          ].map((row, ri) => (
            <View key={ri} className="flex-row justify-center gap-6 mb-4">
              {row.map((key) => {
                if (key === "") {
                  return <View key="empty" style={{ width: 72, height: 72 }} />;
                }
                if (key === "del") {
                  return (
                    <Pressable
                      key="del"
                      onPress={handleDelete}
                      className="items-center justify-center"
                      style={{ width: 72, height: 72 }}
                    >
                      <Delete size={24} color="#9CA3AF" />
                    </Pressable>
                  );
                }
                return (
                  <Pressable
                    key={key}
                    onPress={() => handleDigit(key)}
                    className="rounded-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 items-center justify-center active:bg-gray-100 dark:active:bg-gray-800"
                    style={{ width: 72, height: 72 }}
                  >
                    <Text className="text-2xl font-medium text-gray-900 dark:text-white">
                      {key}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>
      </View>
    </Modal>
  );
}
