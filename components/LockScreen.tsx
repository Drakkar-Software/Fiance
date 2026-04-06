import React, { useState, useEffect, useCallback } from "react";
import { View, Text, Pressable } from "react-native";
import { Lock, Delete, Fingerprint } from "lucide-react-native";
import {
  verifyPin,
  hasBiometrics,
  authenticateWithBiometrics,
} from "@/lib/app-lock";

const PIN_LENGTH = 4;

export function LockScreen({ onUnlock }: { onUnlock: () => void }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  useEffect(() => {
    hasBiometrics().then(setBiometricAvailable);
  }, []);

  // Try biometric on mount
  useEffect(() => {
    if (biometricAvailable) {
      tryBiometric();
    }
  }, [biometricAvailable]);

  const tryBiometric = useCallback(async () => {
    const success = await authenticateWithBiometrics();
    if (success) onUnlock();
  }, [onUnlock]);

  const handleDigit = useCallback(
    (digit: string) => {
      if (pin.length >= PIN_LENGTH) return;
      const next = pin + digit;
      setError(false);
      if (next.length === PIN_LENGTH) {
        verifyPin(next).then((ok) => {
          if (ok) {
            onUnlock();
          } else {
            setError(true);
            setPin("");
          }
        });
      } else {
        setPin(next);
      }
    },
    [pin, onUnlock]
  );

  const handleDelete = useCallback(() => {
    setPin((p) => p.slice(0, -1));
    setError(false);
  }, []);

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-950 items-center justify-center px-8">
      <View className="w-14 h-14 rounded-2xl bg-primary-50 dark:bg-primary-900 items-center justify-center mb-6">
        <Lock size={28} color="#EC4899" />
      </View>
      <Text className="text-xl font-bold text-gray-900 dark:text-white mb-2">
        WeddingOS
      </Text>
      <Text className="text-sm text-gray-400 mb-8">
        Entrez votre code PIN
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
        <Text className="text-sm text-red-500 mb-4">Code incorrect</Text>
      )}

      {/* Number pad */}
      <View className="w-full max-w-xs">
        {[
          ["1", "2", "3"],
          ["4", "5", "6"],
          ["7", "8", "9"],
          [biometricAvailable ? "bio" : "", "0", "del"],
        ].map((row, ri) => (
          <View key={ri} className="flex-row justify-center gap-6 mb-4">
            {row.map((key) => {
              if (key === "") {
                return <View key="empty" className="w-18 h-18" style={{ width: 72, height: 72 }} />;
              }
              if (key === "del") {
                return (
                  <Pressable
                    key="del"
                    onPress={handleDelete}
                    className="w-18 h-18 items-center justify-center"
                    style={{ width: 72, height: 72 }}
                  >
                    <Delete size={24} color="#9CA3AF" />
                  </Pressable>
                );
              }
              if (key === "bio") {
                return (
                  <Pressable
                    key="bio"
                    onPress={tryBiometric}
                    className="w-18 h-18 items-center justify-center"
                    style={{ width: 72, height: 72 }}
                  >
                    <Fingerprint size={24} color="#EC4899" />
                  </Pressable>
                );
              }
              return (
                <Pressable
                  key={key}
                  onPress={() => handleDigit(key)}
                  className="w-18 h-18 rounded-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 items-center justify-center active:bg-gray-100 dark:active:bg-gray-800"
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
  );
}
