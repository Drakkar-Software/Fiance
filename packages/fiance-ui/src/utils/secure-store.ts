/**
 * Centralized SecureStore wrapper with web platform guard.
 * expo-secure-store is native-only; on web falls back to localStorage.
 */

import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

export async function secureGet(key: string): Promise<string | null> {
  if (Platform.OS === "web") return localStorage.getItem(key);
  return SecureStore.getItemAsync(key);
}

export async function secureSet(key: string, value: string): Promise<void> {
  if (Platform.OS === "web") { localStorage.setItem(key, value); return; }
  await SecureStore.setItemAsync(key, value);
}

export async function secureDelete(key: string): Promise<void> {
  if (Platform.OS === "web") { localStorage.removeItem(key); return; }
  await SecureStore.deleteItemAsync(key);
}
