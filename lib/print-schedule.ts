import { safeFormat, getDateLocale } from "@/i18n/dateFnsLocale";
import { buildPublicTimelineHtml, exportToPdf } from "@/lib/pdf-export";
import type { PublicDayOfItem, PublicWeddingPage } from "@/lib/public-page";

export async function printPublicSchedule(
  timeline: PublicDayOfItem[],
  about: PublicWeddingPage["about"],
  labels: { scheduleOf: string; until: (time: string) => string },
): Promise<void> {
  const dateHeaders: Record<string, string> = {};
  for (const item of timeline) {
    const rawDate = item.date || about.weddingDate || "";
    if (rawDate && !dateHeaders[rawDate]) {
      dateHeaders[rawDate] = safeFormat(
        new Date(rawDate + "T00:00:00"),
        "EEEE d MMMM yyyy",
        { locale: getDateLocale() },
      );
    }
  }

  const html = buildPublicTimelineHtml(timeline, about, { ...labels, dateHeaders });

  const coupleNames = [about.partner1Name, about.partner2Name].filter(Boolean).join(" & ");
  const safeName = coupleNames.replace(/\s+/g, "-") || "schedule";
  await exportToPdf(html, `${safeName}-schedule.pdf`);
}
