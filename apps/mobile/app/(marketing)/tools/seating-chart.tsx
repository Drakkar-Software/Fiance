import React, { useState } from "react";
import { View, Text, Pressable, TextInput, ScrollView } from "react-native-css/components";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Plus, Trash2, ArrowLeft } from "lucide-react-native";
import { Seo } from "@/components/Seo";
import { exportToPdf } from "@drakkar.software/seahorse/utils/file-export";

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

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function TableCard({
  table,
  guests,
  onDelete,
  t,
}: {
  table: GuestTable;
  guests: Guest[];
  onDelete: () => void;
  t: (key: string, opts?: Record<string, unknown>) => string;
}) {
  const assigned = guests.filter((g) => g.tableId === table.id);
  const available = table.capacity - assigned.length;
  const isFull = available <= 0;

  return (
    <View className="bg-white rounded-2xl p-4 border border-accent-rose-light mb-3">
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center gap-2">
          <View
            className={`w-8 h-8 items-center justify-center ${
              table.shape === "round" ? "rounded-full" : "rounded-lg"
            } bg-accent-blush`}
          />
          <Text className="text-base font-semibold text-typography-900">{table.name}</Text>
        </View>
        <View className="flex-row items-center gap-2">
          <View className={`px-2 py-0.5 rounded-full ${isFull ? "bg-error-100" : "bg-success-100"}`}>
            <Text className={`text-xs font-medium ${isFull ? "text-error-600" : "text-success-600"}`}>
              {isFull
                ? t("tools.seatingChart.seatsFull")
                : t("tools.seatingChart.seatsTaken", { taken: assigned.length, total: table.capacity })}
            </Text>
          </View>
          <Pressable onPress={onDelete} className="p-1 active:opacity-60">
            <Trash2 size={14} className="text-typography-400" />
          </Pressable>
        </View>
      </View>
      {assigned.length > 0 && (
        <View className="flex-row flex-wrap gap-1 mt-1">
          {assigned.map((g) => (
            <View key={g.id} className="bg-accent-cream px-2 py-0.5 rounded-full">
              <Text className="text-xs text-typography-600">{g.name}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

export default function SeatingChartTool() {
  const { t } = useTranslation("marketing");
  const router = useRouter();

  const [tables, setTables] = useState<GuestTable[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);

  const [newTableName, setNewTableName] = useState("");
  const [newTableShape, setNewTableShape] = useState<TableShape>("round");
  const [newTableCapacity, setNewTableCapacity] = useState("8");

  const [newGuestName, setNewGuestName] = useState("");
  const [newGuestTable, setNewGuestTable] = useState<string | null>(null);

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
    setTables((prev) => prev.filter((t) => t.id !== id));
    setGuests((prev) => prev.map((g) => (g.tableId === id ? { ...g, tableId: null } : g)));
  }

  function addGuest() {
    const name = newGuestName.trim();
    if (!name) return;
    setGuests((prev) => [...prev, { id: uid(), name, tableId: newGuestTable }]);
    setNewGuestName("");
  }

  function deleteGuest(id: string) {
    setGuests((prev) => prev.filter((g) => g.id !== id));
  }

  function clearAll() {
    setTables([]);
    setGuests([]);
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

  return (
    <View className="w-full">
      <Seo
        title={t("tools.seatingChart.meta.title")}
        description={t("tools.seatingChart.meta.description")}
        canonical={t("tools.seatingChart.meta.canonical")}
        jsonLd={[
          { "@type": "WebApplication", name: t("tools.seatingChart.meta.title"),
            url: t("tools.seatingChart.meta.canonical"),
            applicationCategory: "UtilityApplication",
            offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" } },
          { "@type": "BreadcrumbList", itemListElement: [
            { "@type": "ListItem", position: 1, name: "Fiancé", item: "https://fiance.drakkar.software" },
            { "@type": "ListItem", position: 2, name: t("tools.seatingChart.meta.title"), item: t("tools.seatingChart.meta.canonical") },
          ]},
        ]}
      />
      {/* Header */}
      <View className="w-full py-12 px-6 bg-accent-cream">
        <View style={{ maxWidth: 900, width: "100%", alignSelf: "center" }}>
          <Pressable
            onPress={() => router.push("/feature/seating-chart" as any)}
            className="flex-row items-center gap-1 mb-6 active:opacity-60"
          >
            <ArrowLeft size={14} className="text-typography-500" />
            <Text className="text-sm text-typography-500">{t("tools.backToTools")}</Text>
          </Pressable>
          <Text className="text-3xl font-bold text-typography-900 mb-2">
            {t("tools.seatingChart.title")}
          </Text>
          <Text className="text-base text-typography-500">{t("tools.seatingChart.subtitle")}</Text>
        </View>
      </View>

      {/* Tool body */}
      <View className="w-full py-8 px-6 bg-white">
        <View
          className="flex-row flex-wrap gap-8"
          style={{ maxWidth: 900, width: "100%", alignSelf: "center" }}
        >
          {/* Left: add tables & guests */}
          <View style={{ flex: 1, minWidth: 280 }}>
            {/* Add table form */}
            <Text className="text-lg font-semibold text-typography-900 mb-4">
              {t("tools.seatingChart.tables")}
            </Text>
            <View className="bg-accent-cream rounded-2xl p-4 mb-4 gap-3">
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
                      newTableShape === shape
                        ? "bg-primary-500 border-primary-500"
                        : "bg-white border-accent-rose-light"
                    }`}
                  >
                    <Text
                      className={`text-xs font-medium ${
                        newTableShape === shape ? "text-white" : "text-typography-600"
                      }`}
                    >
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
                  className="bg-white rounded-xl px-3 py-2 text-sm text-typography-900 border border-accent-rose-light w-16 text-center"
                />
              </View>
              <Pressable
                onPress={addTable}
                className="bg-primary-500 rounded-xl py-2.5 flex-row items-center justify-center gap-1 active:opacity-70"
              >
                <Plus size={14} className="text-white" />
                <Text className="text-sm font-semibold text-white">{t("tools.seatingChart.addTable")}</Text>
              </Pressable>
            </View>

            {/* Add guest form */}
            <Text className="text-lg font-semibold text-typography-900 mb-4">
              {t("tools.seatingChart.guests")}
            </Text>
            <View className="bg-accent-cream rounded-2xl p-4 mb-4 gap-3">
              <TextInput
                value={newGuestName}
                onChangeText={setNewGuestName}
                placeholder={t("tools.seatingChart.guestName")}
                className="bg-white rounded-xl px-3 py-2.5 text-sm text-typography-900 border border-accent-rose-light"
              />
              {tables.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View className="flex-row gap-2">
                    <Pressable
                      onPress={() => setNewGuestTable(null)}
                      className={`px-3 py-1.5 rounded-full border active:opacity-70 ${
                        newGuestTable === null
                          ? "bg-primary-500 border-primary-500"
                          : "bg-white border-accent-rose-light"
                      }`}
                    >
                      <Text className={`text-xs font-medium ${newGuestTable === null ? "text-white" : "text-typography-600"}`}>
                        {t("tools.seatingChart.unassigned")}
                      </Text>
                    </Pressable>
                    {tables.map((table) => (
                      <Pressable
                        key={table.id}
                        onPress={() => setNewGuestTable(table.id)}
                        className={`px-3 py-1.5 rounded-full border active:opacity-70 ${
                          newGuestTable === table.id
                            ? "bg-primary-500 border-primary-500"
                            : "bg-white border-accent-rose-light"
                        }`}
                      >
                        <Text className={`text-xs font-medium ${newGuestTable === table.id ? "text-white" : "text-typography-600"}`}>
                          {table.name}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </ScrollView>
              )}
              <Pressable
                onPress={addGuest}
                className="bg-primary-500 rounded-xl py-2.5 flex-row items-center justify-center gap-1 active:opacity-70"
              >
                <Plus size={14} className="text-white" />
                <Text className="text-sm font-semibold text-white">{t("tools.seatingChart.addGuest")}</Text>
              </Pressable>
            </View>

            {/* Unassigned guests */}
            {guests.filter((g) => !g.tableId).length > 0 && (
              <View className="bg-accent-cream rounded-2xl p-4">
                <Text className="text-sm font-semibold text-typography-500 mb-2">
                  {t("tools.seatingChart.unassigned")}
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {guests
                    .filter((g) => !g.tableId)
                    .map((g) => (
                      <View key={g.id} className="flex-row items-center gap-1 bg-white px-2 py-1 rounded-full border border-accent-rose-light">
                        <Text className="text-xs text-typography-700">{g.name}</Text>
                        <Pressable onPress={() => deleteGuest(g.id)} className="active:opacity-60">
                          <Trash2 size={10} className="text-typography-400" />
                        </Pressable>
                      </View>
                    ))}
                </View>
              </View>
            )}
          </View>

          {/* Right: table preview */}
          <View style={{ flex: 1, minWidth: 280 }}>
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-semibold text-typography-900">
                {t("tools.seatingChart.preview")}
              </Text>
              <View className="flex-row gap-2">
                {(tables.length > 0 || guests.length > 0) && (
                  <Pressable onPress={clearAll} className="px-3 py-1.5 rounded-full border border-accent-rose-light active:opacity-70">
                    <Text className="text-xs text-typography-500">{t("tools.seatingChart.clearAll")}</Text>
                  </Pressable>
                )}
                {tables.length > 0 && (
                  <Pressable
                    onPress={handleExport}
                    className="bg-accent-gold px-3 py-1.5 rounded-full active:opacity-70"
                  >
                    <Text className="text-xs font-semibold text-white">{t("tools.seatingChart.exportPdf")}</Text>
                  </Pressable>
                )}
              </View>
            </View>

            {tables.length === 0 ? (
              <View className="bg-accent-cream rounded-2xl p-8 items-center">
                <Text className="text-sm text-typography-400 text-center">
                  {t("tools.seatingChart.noTables")}
                </Text>
              </View>
            ) : (
              <View>
                {tables.map((table) => (
                  <TableCard
                    key={table.id}
                    table={table}
                    guests={guests}
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
          <Text className="text-xl font-bold text-typography-900 text-center mb-2">
            {t("tools.appCta.title")}
          </Text>
          <Text className="text-sm text-typography-500 text-center mb-5">
            {t("tools.appCta.description")}
          </Text>
          <Pressable
            onPress={() => router.push("/home" as any)}
            className="bg-primary-500 px-8 py-3 rounded-full active:opacity-70"
          >
            <Text className="text-sm font-semibold text-white">{t("tools.appCta.cta")}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
