import React, { createContext, useContext, useEffect, useState } from "react";
import { openDatabaseSync, type SQLiteDatabase } from "expo-sqlite";
import { drizzle, type ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite";
import { View, Text, ActivityIndicator } from "react-native";
import * as schema from "./schema";
import { hydrateAllStores } from "@/lib/persistence";

const DB_NAME = "weddingos.db";

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

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = useState<DrizzleDB | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      try {
        const sqliteDb: SQLiteDatabase = openDatabaseSync(DB_NAME);
        // Enable WAL mode
        sqliteDb.execSync("PRAGMA journal_mode = WAL;");

        const drizzleDb = drizzle(sqliteDb, { schema });

        // Run migrations
        const migrationSQL = require("./migrations/0001_initial.sql");
        if (typeof migrationSQL === "string") {
          const statements = migrationSQL
            .split(";")
            .map((s: string) => s.trim())
            .filter(Boolean);
          for (const stmt of statements) {
            sqliteDb.execSync(stmt + ";");
          }
        }

        // Set global instance
        dbInstance = drizzleDb;

        // Hydrate all Zustand stores from SQLite
        await hydrateAllStores(drizzleDb);

        setDb(drizzleDb);
      } catch (e: any) {
        console.error("Database init error:", e);
        setError(e.message);
      }
    }
    init();
  }, []);

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "red" }}>Database error: {error}</Text>
      </View>
    );
  }

  if (!db) {
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
