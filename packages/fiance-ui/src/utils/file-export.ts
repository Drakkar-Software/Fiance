import { Platform } from "react-native";

// ─── PDF / Print export ───────────────────────────────────────────────────────

/** Export HTML to PDF. Web: opens in new window and triggers print. Native: expo-print + expo-sharing. */
export async function exportToPdf(html: string, filename: string): Promise<void> {
  if (Platform.OS === "web") {
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
      win.print();
    }
  } else {
    const { printToFileAsync } = await import("expo-print");
    const { shareAsync } = await import("expo-sharing");
    const { uri } = await printToFileAsync({ html });
    await shareAsync(uri, { UTI: ".pdf", mimeType: "application/pdf" });
  }
}

// ─── CSV export ───────────────────────────────────────────────────────────────

/** Export CSV string. Web: browser download with BOM. Native: share sheet. */
export async function exportToCsv(csv: string, filename: string): Promise<void> {
  if (Platform.OS === "web") {
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } else {
    const { writeAsStringAsync, documentDirectory } = await import("expo-file-system/legacy");
    const { shareAsync } = await import("expo-sharing");
    const uri = `${documentDirectory}${filename}`;
    await writeAsStringAsync(uri, csv, { encoding: "utf8" });
    await shareAsync(uri, { mimeType: "text/csv", UTI: "public.comma-separated-values-text" });
  }
}

// ─── JSON export / import ─────────────────────────────────────────────────────

/** Download a JSON object as a file in the browser. */
export function exportJsonWeb(data: unknown, filename: string): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(url); document.body.removeChild(a); }, 100);
}

/** Write JSON to cache dir and open share sheet on native. */
export async function exportJsonNative(data: unknown, filename: string): Promise<void> {
  const { cacheDirectory, writeAsStringAsync, EncodingType } = await import("expo-file-system/legacy");
  const { shareAsync } = await import("expo-sharing");
  const json = JSON.stringify(data, null, 2);
  const uri = cacheDirectory + filename;
  await writeAsStringAsync(uri, json, { encoding: EncodingType.UTF8 });
  await shareAsync(uri, { mimeType: "application/json", UTI: "public.json", dialogTitle: filename });
}

/** Open a file picker in the browser and read the selected JSON file. Returns null if cancelled. */
export function importJsonWeb(): Promise<string | null> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,application/json";
    input.style.display = "none";
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) { resolve(null); return; }
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

/** Open expo-document-picker for a JSON file on native. Returns the file content or null if cancelled. */
export async function importJsonNative(): Promise<string | null> {
  const { getDocumentAsync } = await import("expo-document-picker");
  const { readAsStringAsync, EncodingType } = await import("expo-file-system/legacy");
  const result = await getDocumentAsync({ type: "application/json", copyToCacheDirectory: true });
  if (result.canceled || !result.assets?.[0]) return null;
  return readAsStringAsync(result.assets[0].uri, { encoding: EncodingType.UTF8 });
}
