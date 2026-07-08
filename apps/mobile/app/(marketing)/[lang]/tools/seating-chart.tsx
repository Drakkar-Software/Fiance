import React, { useState } from "react";
import { Platform } from "react-native";
import { View, Text, Pressable, TextInput } from "react-native-css/components";
import { useTranslation } from "react-i18next";
import { Plus, Trash2, ArrowLeft, Download } from "lucide-react-native";
import { Display } from "@/components/Display";
import { MarketingLink } from "@/components/marketing/MarketingLink";
import { Seo } from "@/components/Seo";
import { exportToPdf } from "@fiance/ui/utils/file-export";
import { localizedSeo, localizedUrl, localizedPath } from "@/lib/seo-urls";
import { theme as GP } from "@/lib/theme";

type TableShape = "round" | "rectangular";

interface GuestTable {
  id: string;
  name: string;
  shape: TableShape;
  capacity: number;
}

interface Guest {
  id: string;
  name: string;
  tableId: string | null;
}

const PALETTE = [GP.clay, GP.olive, GP.mustard, GP.blue, "#a3502f", "#8ea36f", "#7d9bb3", "#d9a441"];

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function colorFor(id: string): string {
  let hash = 0;
  for (const ch of id) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return PALETTE[hash % PALETTE.length];
}

function initial(name: string): string {
  return (name || "?").trim().charAt(0).toUpperCase();
}

function TableCard({
  table,
  guests,
  selectedGuestId,
  onSeat,
  onUnseat,
  onDelete,
  t,
}: {
  table: GuestTable;
  guests: Guest[];
  selectedGuestId: string | null;
  onSeat: () => void;
  onUnseat: (guestId: string) => void;
  onDelete: () => void;
  t: (key: string, opts?: Record<string, unknown>) => string;
}) {
  const assigned = guests.filter((g) => g.tableId === table.id);
  const isFull = assigned.length >= table.capacity;
  const seats = Array.from({ length: table.capacity }, (_, i) => assigned[i] ?? null);

  return (
    <View className="bg-white rounded-2xl p-4 border border-accent-rose-light mb-3" style={{ flexBasis: 280, flexGrow: 1, minWidth: 240, maxWidth: 340 }}>
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-2" style={{ flexShrink: 1 }}>
          <View
            style={{
              width: 22,
              height: 22,
              borderRadius: table.shape === "round" ? 11 : 6,
              borderWidth: 2,
              borderColor: GP.olive,
            }}
          />
          <Text className="text-base font-semibold text-typography-900" numberOfLines={1}>{table.name}</Text>
        </View>
        <View className="flex-row items-center gap-2" style={{ flexShrink: 0 }}>
          <View className={`px-2 py-0.5 rounded-full ${isFull ? "bg-success-100" : "bg-accent-paper"}`}>
            <Text className={`text-xs font-semibold ${isFull ? "text-success-700" : "text-typography-500"}`}>
              {t("tools.seatingChart.seatsTaken", { taken: assigned.length, total: table.capacity })}
            </Text>
          </View>
          <Pressable onPress={onDelete} className="p-1 active:opacity-60">
            <Trash2 size={14} className="text-typography-400" />
          </Pressable>
        </View>
      </View>
      <View className="flex-row flex-wrap gap-2">
        {seats.map((guest, i) =>
          guest ? (
            <Pressable
              key={guest.id}
              onPress={() => onUnseat(guest.id)}
              className="active:opacity-70"
              style={{
                width: 34, height: 34, borderRadius: 17,
                backgroundColor: colorFor(guest.id),
                alignItems: "center", justifyContent: "center",
              }}
            >
              <Text style={{ fontFamily: "Inter_700Bold", fontSize: 12, color: "#fff" }}>{initial(guest.name)}</Text>
            </Pressable>
          ) : (
            <Pressable
              key={`empty-${i}`}
              onPress={onSeat}
              disabled={!selectedGuestId}
              className="active:opacity-70"
              style={{
                width: 34, height: 34, borderRadius: 17,
                borderWidth: 1.4,
                borderColor: selectedGuestId ? GP.olive : "rgba(42,36,24,0.2)",
                backgroundColor: selectedGuestId ? GP.oliveSoft : "transparent",
                alignItems: "center", justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: 15, fontWeight: "700", color: selectedGuestId ? GP.olive : "#c8bfad" }}>+</Text>
            </Pressable>
          )
        )}
      </View>
    </View>
  );
}

export default function SeatingChartTool() {
  const { t, i18n } = useTranslation("marketing");
  const lang = i18n.language === "en" ? "en" : "fr";
  const seo = localizedSeo(lang, "/tools/seating-chart");

  const [tables, setTables] = useState<GuestTable[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [selectedGuestId, setSelectedGuestId] = useState<string | null>(null);

  const [newTableName, setNewTableName] = useState("");
  const [newTableShape, setNewTableShape] = useState<TableShape>("round");
  const [newTableCapacity, setNewTableCapacity] = useState("8");
  const [newGuestName, setNewGuestName] = useState("");

  function addTable() {
    const name = newTableName.trim();
    if (!name) return;
    setTables((prev) => [
      ...prev,
      { id: uid(), name, shape: newTableShape, capacity: parseInt(newTableCapacity, 10) || 8 },
    ]);
    setNewTableName("");
  }

  function deleteTable(id: string) {
    setTables((prev) => prev.filter((t2) => t2.id !== id));
    setGuests((prev) => prev.map((g) => (g.tableId === id ? { ...g, tableId: null } : g)));
  }

  function addGuest() {
    const name = newGuestName.trim();
    if (!name) return;
    setGuests((prev) => [...prev, { id: uid(), name, tableId: null }]);
    setNewGuestName("");
  }

  function clearAll() {
    setTables([]);
    setGuests([]);
    setSelectedGuestId(null);
  }

  function seatSelected(tableId: string) {
    if (!selectedGuestId) return;
    setGuests((prev) => prev.map((g) => (g.id === selectedGuestId ? { ...g, tableId } : g)));
    setSelectedGuestId(null);
  }

  function unseat(guestId: string) {
    setGuests((prev) => prev.map((g) => (g.id === guestId ? { ...g, tableId: null } : g)));
  }

  async function handleExport() {
    const lines: string[] = [`${t("tools.seatingChart.pdfTitle")}\n`];
    for (const table of tables) {
      const assigned = guests.filter((g) => g.tableId === table.id);
      lines.push(`\n${table.name} (${table.capacity} ${t("tools.seatingChart.seats")})`);
      if (assigned.length === 0) {
        lines.push("  —");
      } else {
        assigned.forEach((g) => lines.push(`  • ${g.name}`));
      }
    }
    const unassigned = guests.filter((g) => !g.tableId);
    if (unassigned.length > 0) {
      lines.push(`\n${t("tools.seatingChart.pdfUnassigned")}`);
      unassigned.forEach((g) => lines.push(`  • ${g.name}`));
    }
    const content = lines.join("\n");
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:system-ui,sans-serif;padding:40px 60px;line-height:1.7;color:#1a1a1a}pre{font-family:inherit;white-space:pre-wrap;margin:0}</style></head><body><pre>${content}</pre></body></html>`;
    await exportToPdf(html, t("tools.seatingChart.pdfFilename"));
  }

  const pool = guests.filter((g) => !g.tableId);
  const selectedGuest = guests.find((g) => g.id === selectedGuestId) ?? null;

  return (
    <View className="w-full">
      <Seo
        title={t("tools.seatingChart.meta.title")}
        description={t("tools.seatingChart.meta.description")}
        {...seo}
        jsonLd={[
          { "@context": "https://schema.org", "@type": "WebApplication", name: t("tools.seatingChart.meta.title"),
            url: seo.canonical,
            applicationCategory: "UtilityApplication",
            offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" } },
          { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
            { "@type": "ListItem", position: 1, name: "Fiancé", item: localizedUrl(lang, "/") },
            { "@type": "ListItem", position: 2, name: t("tools.seatingChart.meta.title"), item: seo.canonical },
          ]},
        ]}
      />
      {/* Header */}
      <View className="w-full py-12 px-6 bg-accent-cream">
        <View style={{ maxWidth: 1040, width: "100%", alignSelf: "center" }}>
          <MarketingLink
            href={localizedPath(lang, "/feature/seating-chart") as any}
            title={t("tools.backToTools")}
            className="flex-row items-center gap-1 mb-6 active:opacity-60"
          >
            <ArrowLeft size={14} className="text-typography-500" />
            <Text className="text-sm text-typography-500">{t("tools.backToTools")}</Text>
          </MarketingLink>
          <Display as="h1" size={32} weight="700" style={{ marginBottom: 8, lineHeight: 40 }}>
            {t("tools.seatingChart.title")}
          </Display>
          <Text className="text-base text-typography-500">{t("tools.seatingChart.subtitle")}</Text>
        </View>
      </View>

      {/* Tool body */}
      <View className="w-full py-8 px-6 bg-white">
        <View
          className="flex-row flex-wrap"
          style={{ maxWidth: 1040, width: "100%", alignSelf: "center", gap: 24, alignItems: "flex-start" }}
        >
          {/* Aside — add table / add guest / pool */}
          <View
            style={[
              { flexBasis: 300, flexGrow: 1, maxWidth: 320, gap: 14 },
              Platform.OS === "web" ? ({ position: "sticky", top: 88 } as any) : null,
            ]}
          >
            <View className="bg-accent-cream rounded-2xl p-4 gap-3">
              <Text className="text-base font-semibold text-typography-900">{t("tools.seatingChart.tables")}</Text>
              <TextInput
                value={newTableName}
                onChangeText={setNewTableName}
                placeholder={t("tools.seatingChart.tableName")}
                className="bg-white rounded-xl px-3 py-2.5 text-sm text-typography-900 border border-accent-rose-light"
              />
              <View className="flex-row gap-2">
                {(["round", "rectangular"] as TableShape[]).map((shape) => (
                  <Pressable
                    key={shape}
                    onPress={() => setNewTableShape(shape)}
                    className={`flex-1 py-2 rounded-xl items-center border active:opacity-70 ${
                      newTableShape === shape ? "bg-accent-sage border-accent-sage" : "bg-white border-accent-rose-light"
                    }`}
                  >
                    <Text className={`text-xs font-medium ${newTableShape === shape ? "text-white" : "text-typography-600"}`}>
                      {t(`tools.seatingChart.${shape}`)}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <View className="flex-row items-center gap-2">
                <Text className="text-sm text-typography-500">{t("tools.seatingChart.tableCapacity")}</Text>
                <TextInput
                  value={newTableCapacity}
                  onChangeText={setNewTableCapacity}
                  keyboardType="numeric"
                  textAlign="center"
                  className="bg-white rounded-xl px-3 py-2 text-sm text-typography-900 border border-accent-rose-light w-16"
                />
              </View>
              <Pressable
                onPress={addTable}
                className="bg-accent-sage rounded-xl py-2.5 flex-row items-center justify-center gap-1 active:opacity-70"
              >
                <Plus size={14} className="text-white" />
                <Text className="text-sm font-semibold text-white">{t("tools.seatingChart.addTable")}</Text>
              </Pressable>
            </View>

            <View className="bg-accent-cream rounded-2xl p-4 gap-3">
              <View className="flex-row items-baseline justify-between">
                <Text className="text-base font-semibold text-typography-900">{t("tools.seatingChart.guests")}</Text>
                <Text className="text-xs text-typography-400">{pool.length}</Text>
              </View>
              <View className="flex-row gap-2">
                <TextInput
                  value={newGuestName}
                  onChangeText={setNewGuestName}
                  placeholder={t("tools.seatingChart.guestName")}
                  className="bg-white rounded-xl px-3 py-2.5 text-sm text-typography-900 border border-accent-rose-light flex-1"
                />
                <Pressable onPress={addGuest} className="w-11 items-center justify-center bg-primary-500 rounded-xl active:opacity-70">
                  <Plus size={16} className="text-white" />
                </Pressable>
              </View>
              <View className="flex-row flex-wrap gap-2">
                {pool.map((g) => {
                  const selected = selectedGuestId === g.id;
                  return (
                    <Pressable
                      key={g.id}
                      onPress={() => setSelectedGuestId(selected ? null : g.id)}
                      className="flex-row items-center gap-1.5 rounded-full active:opacity-70"
                      style={{
                        paddingVertical: 5,
                        paddingRight: 12,
                        paddingLeft: 5,
                        backgroundColor: selected ? GP.mustardSoft : "#fff",
                        borderWidth: 1.5,
                        borderColor: selected ? GP.mustard : "transparent",
                      }}
                    >
                      <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: colorFor(g.id), alignItems: "center", justifyContent: "center" }}>
                        <Text style={{ fontFamily: "Inter_700Bold", fontSize: 9, color: "#fff" }}>{initial(g.name)}</Text>
                      </View>
                      <Text className="text-sm text-typography-800">{g.name}</Text>
                    </Pressable>
                  );
                })}
                {pool.length === 0 && (
                  <Text className="text-sm italic text-typography-400">{t("tools.seatingChart.everyoneSeated")}</Text>
                )}
              </View>
              {selectedGuest && (
                <View style={{ backgroundColor: GP.oliveSoft, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 }}>
                  <Text style={{ fontSize: 13.5, color: GP.olive }}>
                    {t("tools.seatingChart.selectHint", { name: selectedGuest.name })}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Table canvas */}
          <View style={{ flexGrow: 2, flexBasis: 400, minWidth: 280 }}>
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-semibold text-typography-900">{t("tools.seatingChart.preview")}</Text>
              <View className="flex-row gap-2">
                {(tables.length > 0 || guests.length > 0) && (
                  <Pressable onPress={clearAll} className="px-3 py-1.5 rounded-full border border-accent-rose-light active:opacity-70">
                    <Text className="text-xs text-typography-500">{t("tools.seatingChart.clearAll")}</Text>
                  </Pressable>
                )}
                {tables.length > 0 && (
                  <Pressable onPress={handleExport} className="flex-row items-center gap-1.5 bg-accent-gold px-3 py-1.5 rounded-full active:opacity-70">
                    <Download size={12} className="text-white" />
                    <Text className="text-xs font-semibold text-white">{t("tools.seatingChart.exportPdf")}</Text>
                  </Pressable>
                )}
              </View>
            </View>

            {tables.length === 0 ? (
              <View className="bg-accent-cream rounded-2xl p-8 items-center border border-accent-rose-light">
                <Text className="text-sm text-typography-400 text-center">{t("tools.seatingChart.noTables")}</Text>
              </View>
            ) : (
              <View className="flex-row flex-wrap gap-4">
                {tables.map((table) => (
                  <TableCard
                    key={table.id}
                    table={table}
                    guests={guests}
                    selectedGuestId={selectedGuestId}
                    onSeat={() => seatSelected(table.id)}
                    onUnseat={unseat}
                    onDelete={() => deleteTable(table.id)}
                    t={t}
                  />
                ))}
              </View>
            )}
          </View>
        </View>
      </View>

      {/* App CTA */}
      <View className="w-full py-12 px-6 bg-accent-blush items-center">
        <View style={{ maxWidth: 600, width: "100%", alignItems: "center" }}>
          <Display as="h2" size={22} weight="600" style={{ textAlign: "center", marginBottom: 8 }}>
            {t("tools.appCta.title")}
          </Display>
          <Text className="text-sm text-typography-500 text-center mb-5">
            {t("tools.appCta.description")}
          </Text>
          <MarketingLink
            href="/home"
            title={t("tools.appCta.cta")}
            className="bg-primary-500 px-8 py-3 rounded-full active:opacity-70"
          >
            <Text className="text-sm font-semibold text-white">{t("tools.appCta.cta")}</Text>
          </MarketingLink>
        </View>
      </View>
    </View>
  );
}
