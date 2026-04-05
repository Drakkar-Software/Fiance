/**
 * Centralized SecureStore wrapper with web platform guards.
 * expo-secure-store is native-only; these helpers no-op on web.
 */

import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

export async function secureGet(key: string): Promise<string | null> {
  if (Platform.OS === "web") return null;
  return SecureStore.getItemAsync(key);
}

export async function secureSet(key: string, value: string): Promise<void> {
  if (Platform.OS === "web") return;
  await SecureStore.setItemAsync(key, value);
}

export async function secureDelete(key: string): Promise<void> {
  if (Platform.OS === "web") return;
  await SecureStore.deleteItemAsync(key);
}
