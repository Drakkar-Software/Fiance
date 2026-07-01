import { buildCeremonyBookletHtml, exportToPdf } from "@/lib/pdf-export";
import type { CeremonyItem, Wedding, Guest, WeddingRole } from "@/db/schema";

export async function printCeremonyBooklet(
  items: CeremonyItem[],
  wedding: Wedding | null,
  guests: Guest[],
  roles: WeddingRole[],
  kindLabels: Record<string, string>,
  labels: { programOf: string; performedBy: string },
): Promise<void> {
  const html = buildCeremonyBookletHtml(items, wedding, guests, roles, kindLabels, labels);
  await exportToPdf(html, "livret-de-messe.pdf");
}
