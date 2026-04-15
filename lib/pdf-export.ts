/**
 * PDF export utilities for WeddingOS
 * Builds HTML documents for printing/PDF generation.
 */

import { Platform } from "react-native";
import type { Guest, Table, GuestGroup, Vendor, DayOfItem, Wedding, VendorPayment } from "@/db/schema";
import type { BudgetSummary } from "@/store/useBudgetStore";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatMoney(amount: number, currency = "EUR"): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
}

const BASE_STYLES = `
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1F2937; margin: 20px; font-size: 12px; }
  h1 { font-size: 20px; color: #EC4899; margin-bottom: 4px; }
  h2 { font-size: 14px; color: #6B7280; margin-top: 16px; border-bottom: 1px solid #E5E7EB; padding-bottom: 4px; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; }
  th, td { text-align: left; padding: 4px 8px; border-bottom: 1px solid #F3F4F6; }
  th { background: #F9FAFB; font-size: 11px; color: #6B7280; text-transform: uppercase; }
  .badge { display: inline-block; padding: 1px 6px; border-radius: 8px; font-size: 10px; font-weight: 600; }
  .accepted { background: #D1FAE5; color: #065F46; }
  .declined { background: #FEE2E2; color: #991B1B; }
  .pending { background: #FEF3C7; color: #92400E; }
  .maybe { background: #DBEAFE; color: #1E40AF; }
  .footer { margin-top: 24px; text-align: center; color: #9CA3AF; font-size: 10px; }
`;

const RSVP_CLASS: Record<string, string> = {
  ACCEPTED: "accepted",
  DECLINED: "declined",
  PENDING: "pending",
  MAYBE: "maybe",
};

// ─── Guest list HTML ─────────────────────────────────────────────────────────

export function buildGuestListHtml(
  guests: Guest[],
  tables: Table[],
  groups: GuestGroup[],
): string {
  const tableMap = new Map(tables.map((t) => [t.id, t.name]));
  const groupMap = new Map(groups.map((g) => [g.id, g.name]));
  const sorted = [...guests].sort((a, b) =>
    `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`)
  );

  const rows = sorted
    .map(
      (g) => `
    <tr>
      <td>${escapeHtml(g.lastName)} ${escapeHtml(g.firstName)}</td>
      <td><span class="badge ${RSVP_CLASS[g.rsvpStatus ?? "PENDING"]}">${g.rsvpStatus}</span></td>
      <td>${g.diet ?? "—"}</td>
      <td>${g.tableId ? escapeHtml(tableMap.get(g.tableId) ?? "") : "—"}</td>
      <td>${g.groupId ? escapeHtml(groupMap.get(g.groupId) ?? "") : "—"}</td>
      <td>${g.companionId ? "✓" : "—"}</td>
    </tr>`,
    )
    .join("");

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${BASE_STYLES}</style></head><body>
    <h1>Liste des invités</h1>
    <p>${guests.length} invités</p>
    <table><thead><tr><th>Nom</th><th>RSVP</th><th>Régime</th><th>Table</th><th>Groupe</th><th>Accompagnant</th></tr></thead><tbody>${rows}</tbody></table>
    <div class="footer">Exporté depuis WeddingOS</div>
  </body></html>`;
}

// ─── Budget HTML ─────────────────────────────────────────────────────────────

export function buildBudgetHtml(
  summary: BudgetSummary,
  currency: string,
): string {
  const catRows = summary.categories
    .filter((c) => c.vendors.length > 0)
    .map(
      (c) => `
    <tr>
      <td><strong>${escapeHtml(c.categoryName)}</strong></td>
      <td>${formatMoney(c.totalEngaged, currency)}</td>
      <td>${formatMoney(c.totalConfirmed, currency)}</td>
      <td>${c.targetAmount != null ? formatMoney(c.targetAmount, currency) : "—"}</td>
      <td>${c.overage > 0 ? `+${formatMoney(c.overage, currency)}` : "—"}</td>
    </tr>`,
    )
    .join("");

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${BASE_STYLES}</style></head><body>
    <h1>Budget</h1>
    <p>Cible : ${formatMoney(summary.budgetTarget, currency)} · Engagé : ${formatMoney(summary.totalEngaged, currency)} · Confirmé : ${formatMoney(summary.totalConfirmed, currency)}</p>
    <p>Reste à payer : ${formatMoney(summary.remainingToPay, currency)}</p>
    <h2>Par catégorie</h2>
    <table><thead><tr><th>Catégorie</th><th>Engagé</th><th>Confirmé</th><th>Objectif</th><th>Dépassement</th></tr></thead><tbody>${catRows}</tbody></table>
    <div class="footer">Exporté depuis WeddingOS</div>
  </body></html>`;
}

// ─── Public timeline HTML (for guests) ──────────────────────────────────────

const PUBLIC_STYLES = `
  @page { margin: 18mm 15mm; }
  * { box-sizing: border-box; }
  body {
    font-family: 'Georgia', 'Times New Roman', serif;
    color: #1F2937;
    margin: 0;
    padding: 24px 28px;
    background: #FFF9F5;
    font-size: 13px;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .header {
    text-align: center;
    padding-bottom: 20px;
    border-bottom: 2px solid #F3E8E0;
    margin-bottom: 24px;
  }
  .subtitle {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 3px;
    color: #C9956B;
    margin-bottom: 8px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }
  .couple {
    font-size: 26px;
    font-weight: bold;
    color: #1F2937;
    margin-bottom: 6px;
  }
  .meta {
    font-size: 12px;
    color: #9CA3AF;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }
  .date-header {
    font-size: 11px;
    font-weight: 600;
    color: #C9956B;
    text-transform: uppercase;
    letter-spacing: 2px;
    margin: 22px 0 12px 0;
    padding-bottom: 6px;
    border-bottom: 1px solid #F3E8E0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }
  .item {
    display: flex;
    flex-direction: row;
    margin-bottom: 12px;
    page-break-inside: avoid;
    gap: 12px;
  }
  .time-col {
    width: 72px;
    flex-shrink: 0;
    padding-top: 12px;
    text-align: right;
  }
  .time {
    font-size: 15px;
    font-weight: bold;
    color: #C9956B;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }
  .end-time {
    font-size: 10px;
    color: #B0B0B8;
    margin-top: 2px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }
  .details {
    flex: 1;
    background: #FFFFFF;
    border-radius: 10px;
    padding: 10px 14px;
    border: 1px solid #F3E8E0;
    box-shadow: 0 1px 4px rgba(232,180,184,0.12);
  }
  .title {
    font-size: 14px;
    font-weight: 600;
    color: #1F2937;
  }
  .location {
    font-size: 11px;
    color: #C9956B;
    margin-top: 5px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }
  .footer {
    margin-top: 32px;
    text-align: center;
    color: #D0D0D8;
    font-size: 10px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }
`;

export function buildPublicTimelineHtml(
  items: { title: string; date?: string | null; time: string; endTime?: string | null; location?: string | null }[],
  about: { partner1Name?: string | null; partner2Name?: string | null; weddingDate?: string | null; venueName?: string | null },
  labels: { scheduleOf: string; until: (time: string) => string; dateHeaders: Record<string, string> },
): string {
  // Group by raw date key, preserving insertion order (items are already sorted)
  const groups: Record<string, typeof items> = {};
  for (const item of items) {
    const key = item.date || about.weddingDate || "";
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  }
  const isMultiDay = Object.keys(groups).length > 1;

  const coupleNames = [about.partner1Name, about.partner2Name].filter(Boolean).join(" & ");
  const metaParts = [about.venueName].filter((s): s is string => s != null);

  let body = "";

  for (const [dateKey, dateItems] of Object.entries(groups)) {
    if (isMultiDay) {
      const label = labels.dateHeaders[dateKey] ?? dateKey;
      body += `<div class="date-header">${escapeHtml(label)}</div>`;
    }
    for (const item of dateItems) {
      const endTimeHtml = item.endTime
        ? `<div class="end-time">${escapeHtml(labels.until(item.endTime))}</div>`
        : "";
      const locationHtml = item.location
        ? `<div class="location">📍 ${escapeHtml(item.location)}</div>`
        : "";
      body += `
        <div class="item">
          <div class="time-col">
            <div class="time">${escapeHtml(item.time)}</div>
            ${endTimeHtml}
          </div>
          <div class="details">
            <div class="title">${escapeHtml(item.title)}</div>
            ${locationHtml}
          </div>
        </div>`;
    }
  }

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>${PUBLIC_STYLES}</style></head>
<body>
  <div class="header">
    <div class="subtitle">${escapeHtml(labels.scheduleOf)}</div>
    <div class="couple">${escapeHtml(coupleNames || "—")}</div>
    ${metaParts.length ? `<div class="meta">${metaParts.map(escapeHtml).join(" · ")}</div>` : ""}
  </div>
  ${body}
  <div class="footer">WeddingOS</div>
</body>
</html>`;
}

// ─── Day-of timeline HTML ────────────────────────────────────────────────────

export function buildTimelineHtml(
  items: DayOfItem[],
  wedding: Wedding | null,
): string {
  const sorted = [...items].sort(
    (a, b) => (a.time ?? "").localeCompare(b.time ?? ""),
  );

  const rows = sorted
    .map(
      (item) => `
    <tr>
      <td>${escapeHtml(item.time)}</td>
      <td>${item.endTime ? escapeHtml(item.endTime) : ""}</td>
      <td>${escapeHtml(item.title)}</td>
      <td>${item.location ? escapeHtml(item.location) : ""}</td>
      <td>${item.responsible ? escapeHtml(item.responsible) : ""}</td>
    </tr>`,
    )
    .join("");

  const title = wedding
    ? `Programme — ${wedding.partner1Name ?? ""} & ${wedding.partner2Name ?? ""}`
    : "Programme du Jour J";

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${BASE_STYLES}</style></head><body>
    <h1>${escapeHtml(title)}</h1>
    <table><thead><tr><th>Début</th><th>Fin</th><th>Moment</th><th>Lieu</th><th>Responsable</th></tr></thead><tbody>${rows}</tbody></table>
    <div class="footer">Exporté depuis WeddingOS</div>
  </body></html>`;
}

// ─── Vendor contacts HTML ────────────────────────────────────────────────────

export function buildVendorContactsHtml(vendors: Vendor[]): string {
  const sorted = [...vendors]
    .filter((v) => v.status !== "CANCELLED")
    .sort((a, b) => a.type.localeCompare(b.type));

  const rows = sorted
    .map(
      (v) => `
    <tr>
      <td>${escapeHtml(v.type)}</td>
      <td>${escapeHtml(v.name)}</td>
      <td>${v.contactName ? escapeHtml(v.contactName) : ""}</td>
      <td>${v.phone ? escapeHtml(v.phone) : ""}</td>
      <td>${v.email ? escapeHtml(v.email) : ""}</td>
    </tr>`,
    )
    .join("");

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${BASE_STYLES}</style></head><body>
    <h1>Contacts prestataires</h1>
    <table><thead><tr><th>Type</th><th>Nom</th><th>Contact</th><th>Tél.</th><th>Email</th></tr></thead><tbody>${rows}</tbody></table>
    <div class="footer">Exporté depuis WeddingOS</div>
  </body></html>`;
}

// ─── Budget CSV ──────────────────────────────────────────────────────────────

export function buildBudgetCsv(summary: BudgetSummary, _currency: string): string {
  const fmt = (n: number | null | undefined) => (n != null ? n.toFixed(2) : "");
  const header = ["Catégorie", "Prestataire", "Total calculé", "Confirmé", "Acompte versé", "Objectif catégorie", "Dépassement"].join(";");
  const rows = summary.categories.flatMap((c) =>
    c.vendors.length > 0
      ? c.vendors.map((v) =>
          [
            c.categoryName,
            v.vendor.name,
            fmt(v.calculatedTotal),
            v.isBooked ? fmt(v.calculatedTotal) : "0.00",
            v.vendor.depositPaid ? "Oui" : "Non",
            fmt(c.targetAmount),
            c.overage > 0 ? fmt(c.overage) : "0.00",
          ].join(";")
        )
      : []
  );
  return [header, ...rows].join("\n");
}

// ─── Payments CSV ─────────────────────────────────────────────────────────────

export function buildPaymentsCsv(
  payments: VendorPayment[],
  vendors: Vendor[],
): string {
  const vendorMap = new Map(vendors.map((v) => [v.id, v.name]));
  const sorted = [...payments].sort((a, b) =>
    (a.paidDate ?? "").localeCompare(b.paidDate ?? "")
  );
  const header = ["Prestataire", "Montant", "Date", "Méthode", "Libellé"].join(";");
  const rows = sorted.map((p) =>
    [
      vendorMap.get(p.vendorId) ?? "",
      p.amount.toFixed(2),
      p.paidDate ?? "",
      p.method ?? "",
      p.label ?? "",
    ].join(";")
  );
  return [header, ...rows].join("\n");
}

// ─── CSV export helper ────────────────────────────────────────────────────────

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

// ─── Export helper ───────────────────────────────────────────────────────────

export async function exportToPdf(
  html: string,
  filename: string,
): Promise<void> {
  if (Platform.OS === "web") {
    // Web: open in new window and trigger print
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
      win.print();
    }
  } else {
    // Native: use expo-print + expo-sharing
    const { printToFileAsync } = await import("expo-print");
    const { shareAsync } = await import("expo-sharing");
    const { uri } = await printToFileAsync({ html });
    await shareAsync(uri, { UTI: ".pdf", mimeType: "application/pdf" });
  }
}
