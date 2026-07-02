import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation("common");
  const [storage, setStorage] = useState<SQLiteStorage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSwitching, setIsSwitching] = useState(false);
  // First provider mount = app boot; a later dbFileName change = a wedding switch.
  const isFirstRunRef = useRef(true);

  useEffect(() => {
    let cancelled = false;
    // On a switch, show the wait screen as an overlay ON TOP of the still-mounted
    // children (set `isSwitching`, NOT `loading`). Gating on `loading` would unmount
    // the tree, which makes expo-router briefly remount <Stack> at its
    // first-declared screen ("onboarding") — flashing the onboarding screen before
    // it redirects home. `loading` stays the boot-only gate.
    const isSwitch = !isFirstRunRef.current;
    isFirstRunRef.current = false;

    async function init() {
      try {
        if (isSwitch) setIsSwitching(true);

        if (!dbFileName) {
          clearAllStores();
          closeStorage();
          setLoading(false);
          setIsSwitching(false);
          return;
        }

        const startedAt = Date.now();
        closeStorage();
        clearAllStores();

        const kv = await initStorage(dbFileName);
        if (!kv) throw new Error(`Failed to open storage: ${dbFileName}`);

        hydrateAllStores(kv);

        // Keep the switch screen up for a short floor so a fast local swap
        // doesn't flash the loader for a single frame.
        if (isSwitch) {
          const elapsed = Date.now() - startedAt;
          if (elapsed < 400) await new Promise((r) => setTimeout(r, 400 - elapsed));
        }

        if (!cancelled) {
          setStorage(kv);
          setError(null);
          setLoading(false);
          setIsSwitching(false);
        }
      } catch (e: any) {
        console.error("Storage init error:", e);
        if (!cancelled) {
          setError(e.message);
          setLoading(false);
          setIsSwitching(false);
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

  // Boot-only gate. A wedding switch overlays the wait screen instead (below) so
  // the router tree (<Stack>) is never unmounted mid-switch.
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 16 }}>Loading Fiancé...</Text>
      </View>
    );
  }

  return (
    <StorageContext.Provider value={storage}>
      {children}
      {isSwitching && (
        // Wedding-switch wait screen, overlaid on the mounted children (paper bg +
        // clay spinner, like join.tsx) — keeps <Stack> mounted, no onboarding flash.
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 50,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#f2ece0",
          }}
        >
          <ActivityIndicator size="large" color="#b96a4a" />
          <Text style={{ marginTop: 16, color: "#2a2418" }}>{t("switchingWedding")}</Text>
        </View>
      )}
    </StorageContext.Provider>
  );
}
