import React, { createContext, useContext, useEffect, useState } from "react";
import type { SQLiteStorage } from "expo-sqlite/kv-store";
import { View, Text, ActivityIndicator } from "react-native-css/components";
import { initStorage, getStorage, closeStorage } from "@/lib/kv-storage";
import { hydrateAllStores, clearAllStores } from "@/lib/persistence";
// ─── Global storage singleton (accessible outside React) ─────────────────────

export function getDatabase(): SQLiteStorage | null {
  return getStorage();
}

// ─── React context for components ───────────────────────────────────────────

const StorageContext = createContext<SQLiteStorage | null>(null);

export function useDatabase(): SQLiteStorage {
  const storage = useContext(StorageContext);
  if (!storage) throw new Error("useDatabase must be used within DatabaseProvider");
  return storage;
}

interface DatabaseProviderProps {
  children: React.ReactNode;
  dbFileName?: string;
}

export function DatabaseProvider({ children, dbFileName }: DatabaseProviderProps) {
  const [storage, setStorage] = useState<SQLiteStorage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        if (!dbFileName) {
          setLoading(false);
          return;
        }

        clearAllStores();
        closeStorage();

        const kv = await initStorage(dbFileName);
        if (!kv) throw new Error(`Failed to open storage: ${dbFileName}`);

        hydrateAllStores(kv);

        if (!cancelled) {
          setStorage(kv);
          setError(null);
          setLoading(false);
        }
      } catch (e: any) {
        console.error("Storage init error:", e);
        if (!cancelled) {
          setError(e.message);
          setLoading(false);
        }
      }
    }

    init();

    return () => {
      cancelled = true;
    };
  }, [dbFileName]);

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "red" }}>Storage error: {error}</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 16 }}>Loading Fiancé...</Text>
      </View>
    );
  }

  return (
    <StorageContext.Provider value={storage}>{children}</StorageContext.Provider>
  );
}
