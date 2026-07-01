export * from "@fiance/ui/utils/kv-storage";

/** Native stub — on native the database file is deleted directly; no-op here.
 *  Web implementation lives in kv-storage.web.ts. */
export function purgeStorage(_dbFileName: string): void {}
