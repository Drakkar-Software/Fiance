/**
 * App lock — PIN-based lock with optional biometric (Face ID / fingerprint) unlock.
 * PIN is stored in SecureStore; biometric availability checked via expo-local-authentication.
 */

import * as LocalAuthentication from "expo-local-authentication";
import { Platform } from "react-native";
import { secureGet, secureSet, secureDelete } from "./secure-store";

const PIN_KEY = "app_lock_pin";
const LOCK_ENABLED_KEY = "app_lock_enabled";

export async function isLockEnabled(): Promise<boolean> {
  const val = await secureGet(LOCK_ENABLED_KEY);
  return val === "1";
}

export async function setLockEnabled(enabled: boolean): Promise<void> {
  if (enabled) {
    await secureSet(LOCK_ENABLED_KEY, "1");
  } else {
    await secureDelete(LOCK_ENABLED_KEY);
    await secureDelete(PIN_KEY);
  }
}

export async function savePin(pin: string): Promise<void> {
  await secureSet(PIN_KEY, pin);
}

export async function verifyPin(pin: string): Promise<boolean> {
  const stored = await secureGet(PIN_KEY);
  return stored === pin;
}

export async function hasBiometrics(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  const compatible = await LocalAuthentication.hasHardwareAsync();
  if (!compatible) return false;
  const enrolled = await LocalAuthentication.isEnrolledAsync();
  return enrolled;
}

export async function authenticateWithBiometrics(
  promptMessage = "Unlock app",
  cancelLabel = "Use PIN",
): Promise<boolean> {
  if (Platform.OS === "web") return false;
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage,
    cancelLabel,
    disableDeviceFallback: true,
  });
  return result.success;
}
