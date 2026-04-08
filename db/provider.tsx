import React, { createContext, useContext, useEffect, useState } from "react";
import { openDatabaseSync, type SQLiteDatabase } from "expo-sqlite";
import { drizzle, type ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite";
import { View, Text, ActivityIndicator, Platform } from "react-native";
import * as schema from "./schema";
import { hydrateAllStores, clearAllStores, loadFromLocalStorage } from "@/lib/persistence";
import m0001 from "./migrations/0001_initial";
import m0002 from "./migrations/0002_planning_aspects";
import m0003 from "./migrations/0003_no_table_needed";
import m0004 from "./migrations/0004_remove_dinner_add_groups";
import m0005 from "./migrations/0005_companion_id";
import m0006 from "./migrations/0006_is_public_day_of";
import m0007 from "./migrations/0007_wedding_description_faq";
import m0008 from "./migrations/0008_day_of_item_date";
import m0009 from "./migrations/0009_new_tables_and_columns";

type DrizzleDB = ExpoSQLiteDatabase<typeof schema>;

// ─── Global DB singleton (accessible outside React) ─────────────────────────

let dbInstance: DrizzleDB | null = null;

export function getDatabase(): DrizzleDB | null {
  return dbInstance;
}

// ─── React context for components ───────────────────────────────────────────

const DatabaseContext = createContext<DrizzleDB | null>(null);

export function useDatabase(): DrizzleDB {
  const db = useContext(DatabaseContext);
  if (!db) throw new Error("useDatabase must be used within DatabaseProvider");
  return db;
}

interface DatabaseProviderProps {
  children: React.ReactNode;
  dbFileName?: string;
}

export function DatabaseProvider({ children, dbFileName }: DatabaseProviderProps) {
  const [db, setDb] = useState<DrizzleDB | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        if (Platform.OS === "web") {
          clearAllStores();
          loadFromLocalStorage();
          if (!cancelled) {
            setDb(null as any);
            setLoading(false);
          }
          return;
        }

        if (!dbFileName) {
          setLoading(false);
          return;
        }

        // Clear stores before opening a new DB
        clearAllStores();
        dbInstance = null;

        const sqliteDb: SQLiteDatabase = openDatabaseSync(dbFileName);
        sqliteDb.execSync("PRAGMA journal_mode = WAL;");

        const drizzleDb = drizzle(sqliteDb, { schema });

        // Run migrations
        const migrations = [m0001, m0002, m0003, m0004, m0005, m0006, m0007, m0008, m0009];
        for (const migrationSQL of migrations) {
          const statements = migrationSQL
            .split(";")
            .map((s: string) => s.trim())
            .filter(Boolean);
          for (const stmt of statements) {
            sqliteDb.execSync(stmt + ";");
          }
        }

        dbInstance = drizzleDb;

        await hydrateAllStores(drizzleDb);

        if (!cancelled) {
          setDb(drizzleDb);
          setError(null);
          setLoading(false);
        }
      } catch (e: any) {
        console.error("Database init error:", e);
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
        <Text style={{ color: "red" }}>Database error: {error}</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 16 }}>Loading WeddingOS...</Text>
      </View>
    );
  }

  return (
    <DatabaseContext.Provider value={db}>{children}</DatabaseContext.Provider>
  );
}
