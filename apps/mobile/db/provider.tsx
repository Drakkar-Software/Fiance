import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import type { SQLiteStorage } from "expo-sqlite/kv-store";
import { View, Text, ActivityIndicator } from "react-native-css/components";
import { initStorage, getStorage, closeStorage } from "@/lib/kv-storage";
import { hydrateAllStores, clearAllStores } from "@/lib/persistence";
import { WeddingSwitchOverlay } from "@/components/WeddingSwitchOverlay";
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
  // The dbFileName currently backing `storage`. Compared against the incoming
  // `dbFileName` prop DURING RENDER (see `switching` below) so the switch
  // overlay is present in the very same commit the prop changes — no
  // post-render effect lag during which the old wedding's data could paint.
  const [loadedDbFileName, setLoadedDbFileName] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  // First provider mount = app boot; a later dbFileName change = a wedding switch.
  const isFirstRunRef = useRef(true);

  // On a switch, show the wait screen as an overlay ON TOP of the still-mounted
  // children — never gate on `loading`, which would unmount the tree and make
  // expo-router briefly remount <Stack> at its first-declared screen
  // ("onboarding"), flashing it before redirecting home. `loading` stays the
  // boot-only gate. Derived (not state set inside the effect below) so it's
  // true on the SAME render `dbFileName` changes, not one render later.
  const switching = !isFirstRunRef.current && !!dbFileName && dbFileName !== loadedDbFileName;

  useEffect(() => {
    let cancelled = false;
    const isSwitch = !isFirstRunRef.current;
    isFirstRunRef.current = false;

    async function init() {
      try {
        if (!dbFileName) {
          clearAllStores();
          closeStorage();
          setLoadedDbFileName(undefined);
          setLoading(false);
          return;
        }

        const startedAt = Date.now();
        closeStorage();
        clearAllStores();

        const kv = await initStorage(dbFileName);
        if (!kv) throw new Error(`Failed to open storage: ${dbFileName}`);

        hydrateAllStores(kv);

        // Keep the switch screen up for a short floor so the enter/exit
        // animation has room to play instead of flashing for a single frame.
        if (isSwitch) {
          const elapsed = Date.now() - startedAt;
          if (elapsed < 700) await new Promise((r) => setTimeout(r, 700 - elapsed));
        }

        if (!cancelled) {
          setStorage(kv);
          setLoadedDbFileName(dbFileName);
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
      {/* Wedding-switch wait screen, overlaid on the mounted children — keeps
          <Stack> mounted, no onboarding flash. Always rendered (not just when
          `switching`) so it can play its own exit animation on hide. */}
      <WeddingSwitchOverlay visible={switching} />
    </StorageContext.Provider>
  );
}
