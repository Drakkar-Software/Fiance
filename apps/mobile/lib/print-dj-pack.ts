import { buildDjWitnessPackHtml, exportToPdf } from "@/lib/pdf-export";
import type { Speech, PlaylistTrack, DayOfItem, Vendor, Guest, WeddingRole } from "@/db/schema";

export async function printDjWitnessPack(
  speeches: Speech[],
  tracks: PlaylistTrack[],
  dayOfItems: DayOfItem[],
  djVendor: Vendor | null,
  guests: Guest[],
  roles: WeddingRole[],
  momentLabels: Record<string, string>,
): Promise<void> {
  const html = buildDjWitnessPackHtml(speeches, tracks, dayOfItems, djVendor, guests, roles, momentLabels);
  await exportToPdf(html, "pack-dj-temoins.pdf");
}
