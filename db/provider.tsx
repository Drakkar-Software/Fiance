import React, { createContext, useContext, useEffect, useState } from "react";
import { openDatabaseSync, type SQLiteDatabase } from "expo-sqlite";
import { drizzle, type ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite";
import { View, Text, ActivityIndicator, Platform } from "react-native";
import * as schema from "./schema";
import { hydrateAllStores, clearAllStores, loadFromLocalStorage } from "@/lib/persistence";
import m0001 from "./migrations/0001_initial.sql";
import m0002 from "./migrations/0002_planning_aspects.sql";
import m0003 from "./migrations/0003_no_table_needed.sql";
import m0004 from "./migrations/0004_remove_dinner_add_groups.sql";
import m0005 from "./migrations/0005_companion_id.sql";
import m0006 from "./migrations/0006_is_public_day_of.sql";
import m0007 from "./migrations/0007_wedding_description_faq.sql";
import m0008 from "./migrations/0008_day_of_item_date.sql";
import m0009 from "./migrations/0009_new_tables_and_columns.sql";
import m0010 from "./migrations/0010_children_count.sql";

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

        // Run migrations with tracking (never re-apply already-applied migrations)
        sqliteDb.execSync(
          `CREATE TABLE IF NOT EXISTS __migrations (
            name TEXT PRIMARY KEY NOT NULL,
            applied_at TEXT NOT NULL DEFAULT (datetime('now'))
          )`,
        );

        const migrationEntries: [string, string][] = [
          ["0001_initial", m0001],
          ["0002_planning_aspects", m0002],
          ["0003_no_table_needed", m0003],
          ["0004_remove_dinner_add_groups", m0004],
          ["0005_companion_id", m0005],
          ["0006_is_public_day_of", m0006],
          ["0007_wedding_description_faq", m0007],
          ["0008_day_of_item_date", m0008],
          ["0009_new_tables_and_columns", m0009],
          ["0010_children_count", m0010],
        ];

        // Detect legacy DB (existing data but no migration tracking yet)
        const trackedCount =
          sqliteDb.getFirstSync<{ count: number }>(
            "SELECT COUNT(*) as count FROM __migrations",
          )?.count ?? 0;
        if (trackedCount === 0) {
          const weddingExists =
            (sqliteDb.getFirstSync<{ count: number }>(
              "SELECT COUNT(*) as count FROM sqlite_master WHERE type='table' AND name='wedding'",
            )?.count ?? 0) > 0;
          if (weddingExists) {
            // Legacy DB: seed migration history based on observable schema state.
            // Check 0009 signature (accommodations table added in that migration).
            const m0009Applied =
              (sqliteDb.getFirstSync<{ count: number }>(
                "SELECT COUNT(*) as count FROM sqlite_master WHERE type='table' AND name='accommodations'",
              )?.count ?? 0) > 0;
            const alreadyApplied = m0009Applied
              ? migrationEntries.map(([name]) => name)
              : migrationEntries.slice(0, 8).map(([name]) => name);
            for (const name of alreadyApplied) {
              sqliteDb.execSync(
                `INSERT OR IGNORE INTO __migrations (name) VALUES ('${name}')`,
              );
            }
          }
        }

        const applied = new Set(
          sqliteDb
            .getAllSync<{ name: string }>("SELECT name FROM __migrations")
            .map((r) => r.name),
        );

        for (const [name, migrationSQL] of migrationEntries) {
          if (applied.has(name)) continue;
          const statements = migrationSQL
            .split(";")
            .map((s: string) => s.trim())
            .filter(Boolean);
          for (const stmt of statements) {
            sqliteDb.execSync(stmt + ";");
          }
          sqliteDb.execSync(
            `INSERT INTO __migrations (name) VALUES ('${name}')`,
          );
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
