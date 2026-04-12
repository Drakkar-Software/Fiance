import { Platform } from "react-native";
import { SunglassesCore, asTyped } from "@drakkar.software/sunglasses-core";
import type { IAnalyticsAdapter, SunglassesEvent } from "@drakkar.software/sunglasses-core";
import { AsyncStorageAdapter } from "@drakkar.software/sunglasses-storage-async-storage";
import { ConsoleAdapter } from "@drakkar.software/sunglasses-adapter-console";
import { StarfishAnalyticsAdapter } from "@drakkar.software/sunglasses-adapter-starfish";

export type WeddingOSEvents = {
  // Lifecycle
  wedding_created:             { method: "new" | "import" | "invite" };
  wedding_switched:            undefined;
  // Home
  home_opened:                 { days_until?: number };
  rsvp_sync_triggered:         undefined;
  pwa_install_clicked:         undefined;
  // Guests
  guest_added:                 undefined;
  // Vendors
  vendor_added:                { category: string };
  // Planning
  task_completed:              undefined;
  planning_template_generated: undefined;
  // Budget
  budget_template_applied:     { template: string };
  // Ideas
  idea_added:                  undefined;
  // Settings
  sync_enabled:                undefined;
  sync_disabled:               undefined;
  export_data:                 undefined;
  import_data:                 undefined;
};

/**
 * Lazy wrapper around StarfishAnalyticsAdapter.
 * Included in the adapter list from app start (so the core knows about it),
 * but is a no-op until activate() is called once sync credentials are available.
 */
class LazyStarfishAnalyticsAdapter implements IAnalyticsAdapter {
  private inner: StarfishAnalyticsAdapter | null = null;

  activate(serverUrl: string, authToken: string) {
    this.inner?.shutdown().catch(() => {});
    this.inner = new StarfishAnalyticsAdapter({
      serverUrl,
      storagePath: "analytics/{identity}/events",
      authToken,
    });
  }

  deactivate() {
    this.inner?.shutdown().catch(() => {});
    this.inner = null;
  }

  async send(batch: SunglassesEvent[]): Promise<void> {
    await this.inner?.send(batch);
  }

  async reset(): Promise<void> {
    await this.inner?.reset();
  }

  async shutdown(): Promise<void> {
    await this.inner?.shutdown();
  }
}

export const starfishAnalyticsAdapter = new LazyStarfishAnalyticsAdapter();

let _core: SunglassesCore | null = null;

// Pre-init stub — noops until initAnalytics() resolves
export const analytics = { capture: () => {} } as unknown as ReturnType<
  typeof asTyped<WeddingOSEvents>
>;

export async function initAnalytics(): Promise<SunglassesCore> {
  const adapters: IAnalyticsAdapter[] = [starfishAnalyticsAdapter];
  if (__DEV__) adapters.unshift(new ConsoleAdapter());

  _core = await SunglassesCore.create({
    storage: new AsyncStorageAdapter(""),
    adapters,
    defaultOptIn: true,
    platform: Platform.OS === "web" ? "web" : "react-native",
    debug: __DEV__,
    enableSessionTracking: true,
    enableEventCounting: true,
  });

  Object.assign(analytics, asTyped<WeddingOSEvents>(_core));
  return _core;
}

export function getAnalyticsCore(): SunglassesCore | null {
  return _core;
}
