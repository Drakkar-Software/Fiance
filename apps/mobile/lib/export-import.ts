/**
 * Plain-text (unencrypted) JSON export / import for Fiancé.
 * Works on both web (browser download/upload) and native (share sheet / document picker).
 */

import { Platform } from "react-native";
import {
  cacheDirectory,
  writeAsStringAsync,
  readAsStringAsync,
  EncodingType,
} from "expo-file-system/legacy";
import { shareAsync } from "expo-sharing";
import { getDocumentAsync } from "expo-document-picker";
import { createBackupDocument, restoreFromBackup } from "./sync";
import { notifySync } from "./starfish";
import { getStorage } from "@/lib/kv-storage";
import { parseAndRestore, importLegacyBackup, type ImportResult } from "@fiance/sdk";
import { getActiveSession, getActiveSpaceId, getActiveWeddingNodeId } from "@/lib/starfish";
import { hydrateFromSpace, pushSpaceSnapshot, suppressSyncPush, restoreSyncPush } from "@/lib/space-sync";

export type ImportError = "invalid_json" | "invalid_backup";

function buildFilename(label: string): string {
  const safe = label.replace(/[^a-zA-Z0-9À-ÿ&_ -]/g, "").trim() || "wedding";
  const date = new Date().toISOString().slice(0, 10);
  return `Fiancé_${safe}_${date}.json`;
}

// ─── Export ─────────────────────────────────────────────────────────────────

export async function exportWedding(label: string): Promise<void> {
  const data = createBackupDocument();
  const json = JSON.stringify(data, null, 2);
  const filename = buildFilename(label);

  if (Platform.OS === "web") {
    exportWeb(json, filename);
  } else {
    await exportNative(json, filename);
  }
}

function exportWeb(json: string, filename: string): void {
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }, 100);
}

async function exportNative(json: string, filename: string): Promise<void> {
  const uri = cacheDirectory + filename;
  await writeAsStringAsync(uri, json, { encoding: EncodingType.UTF8 });
  await shareAsync(uri, {
    mimeType: "application/json",
    UTI: "public.json",
    dialogTitle: filename,
  });
}

// ─── Import ─────────────────────────────────────────────────────────────────

/**
 * Pick a JSON file, validate it, and restore into the active wedding.
 * Returns true on success, null if the user cancelled, or an ImportError string.
 */
export async function importWedding(): Promise<true | null | ImportError> {
  const json = Platform.OS === "web" ? await importWeb() : await importNative();
  if (!json) return null;

  let data: Record<string, unknown>;
  try {
    data = JSON.parse(json);
  } catch {
    return "invalid_json";
  }

  if (!data.version) {
    return "invalid_backup";
  }

  restoreFromBackup(data, getStorage());
  // Push to Space immediately so the restored data survives the next hydrateFromSpace.
  // Without this, the debounced push races with boot hydration and may be overwritten.
  const _session = getActiveSession();
  const _spaceId = getActiveSpaceId();
  const _weddingNodeId = getActiveWeddingNodeId();
  if (_session && _spaceId && _weddingNodeId) {
    await pushSpaceSnapshot(_session, _spaceId, _weddingNodeId).catch((err) => {
      console.warn("[import-wedding] Space push failed:", err);
    });
  } else {
    notifySync();
  }
  return true;
}

// ─── Import legacy backup → Space ───────────────────────────────────────────

export type LegacyImportResult =
  | { ok: true; result: ImportResult }
  | { ok: false; error: "no_session" | "invalid_json" | "invalid_backup" | "push_failed" };

/**
 * Pick a v6 backup JSON, parse it, and push all entities into the active Space
 * as ObjectNodes using `importLegacyBackup`. Does NOT restore local store state —
 * the next `hydrateFromSpace` at login will pull the imported nodes.
 */
export async function importLegacyToSpace(): Promise<LegacyImportResult | null> {
  const json = Platform.OS === "web" ? await importWeb() : await importNative();
  if (!json) return null;

  const snapshot = parseAndRestore(json);
  if (snapshot === "invalid_json") return { ok: false, error: "invalid_json" };
  if (snapshot === "invalid_backup") return { ok: false, error: "invalid_backup" };

  const session = getActiveSession();
  const spaceId = getActiveSpaceId();
  const weddingNodeId = getActiveWeddingNodeId();
  if (!session || !spaceId || !weddingNodeId) return { ok: false, error: "no_session" };

  // Block any debounced push from firing during the import window.
  // A pending timer's replace-domain merge would overwrite the freshly pushed legacy nodes.
  suppressSyncPush();
  try {
    const result = await importLegacyBackup(session, spaceId, snapshot, weddingNodeId);
    await hydrateFromSpace(session, spaceId, weddingNodeId).catch((err) => {
      console.warn("[import-to-space] post-import hydrate failed:", err);
    });
    return { ok: true, result };
  } catch (err) {
    console.warn("[import-to-space] importLegacyBackup failed:", err);
    return { ok: false, error: "push_failed" };
  } finally {
    restoreSyncPush();
  }
}

function importWeb(): Promise<string | null> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,application/json";
    input.style.display = "none";
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) {
        resolve(null);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsText(file);
    };
    input.oncancel = () => resolve(null);
    document.body.appendChild(input);
    input.click();
    setTimeout(() => document.body.removeChild(input), 60_000);
  });
}

async function importNative(): Promise<string | null> {
  const result = await getDocumentAsync({
    type: "application/json",
    copyToCacheDirectory: true,
  });

  if (result.canceled || !result.assets?.[0]) return null;

  const uri = result.assets[0].uri;
  return readAsStringAsync(uri, { encoding: EncodingType.UTF8 });
}
