/**
 * Document file I/O for Fiancé.
 * Native: copies the picked file into FileSystem.documentDirectory/wedding-docs/{id}{ext}.
 * Web: no real filesystem — stores the file as a base64 data URL in KV, keyed by
 * document id; Document.localUri holds that same KV key as a reference (not a URI).
 */

import { Platform } from "react-native";
import { getDocumentAsync } from "expo-document-picker";
import { readCollection, writeCollection } from "./kv-storage";

export interface PickedDocumentFile {
  fileName: string;
  mimeType: string | null;
  fileSize: number | null;
  localUri: string;
}

function blobKeyFor(id: string): string {
  return `document-blob-${id}`;
}

function readAssetAsDataUrl(uri: string): Promise<string> {
  return fetch(uri)
    .then((res) => res.blob())
    .then(
      (blob) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        }),
    );
}

/** Opens the file picker and stores the picked file. Returns null if the user cancels. */
export async function pickAndStoreDocument(id: string): Promise<PickedDocumentFile | null> {
  const result = await getDocumentAsync({ copyToCacheDirectory: true, type: "*/*" });
  if (result.canceled || !result.assets?.[0]) return null;
  const asset = result.assets[0];

  if (Platform.OS === "web") {
    const dataUrl = await readAssetAsDataUrl(asset.uri);
    const blobKey = blobKeyFor(id);
    writeCollection(blobKey, dataUrl);
    return {
      fileName: asset.name,
      mimeType: asset.mimeType ?? null,
      fileSize: asset.size ?? null,
      localUri: blobKey,
    };
  }

  const { documentDirectory, makeDirectoryAsync, copyAsync } = await import("expo-file-system/legacy");
  const dir = `${documentDirectory}wedding-docs/`;
  await makeDirectoryAsync(dir, { intermediates: true }).catch(() => {});
  const ext = asset.name.includes(".") ? asset.name.slice(asset.name.lastIndexOf(".")) : "";
  const destUri = `${dir}${id}${ext}`;
  await copyAsync({ from: asset.uri, to: destUri });

  return {
    fileName: asset.name,
    mimeType: asset.mimeType ?? null,
    fileSize: asset.size ?? null,
    localUri: destUri,
  };
}

/** Reads a document's content back as a data URL for viewing/downloading on web. Native callers use localUri directly as a file:// path (e.g. with expo-sharing). */
export function readDocumentBlob(localUri: string): string | null {
  return readCollection<string>(localUri);
}

/** True when the file/blob is available on this device (absent after a fresh backup import — the localUri was stripped and needs re-attaching). */
export function isDocumentAvailableOnDevice(localUri: string): boolean {
  if (!localUri) return false;
  if (Platform.OS === "web") return readCollection<string>(localUri) != null;
  return true; // native: localUri is a real file:// path already scoped to this device
}

/** Deletes the on-device file/blob backing a document (best-effort). */
export async function deleteDocumentFile(localUri: string): Promise<void> {
  if (!localUri) return;
  if (Platform.OS === "web") {
    writeCollection(localUri, null as unknown as string);
    return;
  }
  const { deleteAsync } = await import("expo-file-system/legacy");
  await deleteAsync(localUri, { idempotent: true }).catch(() => {});
}
