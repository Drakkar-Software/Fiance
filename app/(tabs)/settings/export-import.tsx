import React, { useState, useCallback } from "react";
import { View, Text, ScrollView, Pressable } from "react-native-css/components";
import { Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { ChevronRight, Download, Upload, FileText, Table2 } from "lucide-react-native";
import { useGuestsStore } from "@/store/useGuestsStore";
import { useVendorsStore } from "@/store/useVendorsStore";
import { usePlanningStore } from "@/store/usePlanningStore";
import { useWeddingStore } from "@/store/useWeddingStore";
import { useWeddingRegistryStore } from "@/store/useWeddingRegistryStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useBudgetSummary } from "@/store/useBudgetStore";
import { exportWedding, importWedding } from "@/lib/export-import";
import {
  exportToPdf,
  buildGuestListHtml,
  buildBudgetHtml,
  buildTimelineHtml,
  buildVendorContactsHtml,
  exportToCsv,
  buildBudgetCsv,
  buildPaymentsCsv,
} from "@/lib/pdf-export";
import { rescheduleAllNotifications } from "@/lib/notifications";
import { SectionTitle, FormCard } from "@/components/FormSection";
import { ConfirmSheet } from "@/components/ConfirmSheet";

export default function ExportImportScreen() {
  const { t } = useTranslation("settings");
  const guests = useGuestsStore((s) => s.guests);
  const tables = useGuestsStore((s) => s.tables);
  const groups = useGuestsStore((s) => s.groups);
  const vendors = useVendorsStore((s) => s.vendors);
  const vendorPayments = useVendorsStore((s) => s.vendorPayments);
  const dayOfItems = usePlanningStore((s) => s.dayOfItems);
  const wedding = useWeddingStore((s) => s.wedding);
  const currency = useWeddingStore((s) => s.wedding?.currency ?? "EUR");
  const registry = useWeddingRegistryStore((s) => s.registry);
  const activeEntry = registry?.weddings.find((w) => w.id === registry.activeWeddingId);
  const budgetSummary = useBudgetSummary();

  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [showImportConfirm, setShowImportConfirm] = useState(false);

  const handleExportJson = useCallback(async () => {
    setExporting(true);
    try {
      await exportWedding(activeEntry?.label || "wedding");
    } catch (e: any) {
      Alert.alert(t("common:error"), e.message);
    } finally {
      setExporting(false);
    }
  }, [activeEntry?.label, t]);

  const doImport = useCallback(async () => {
    setShowImportConfirm(false);
    setImporting(true);
    try {
      const result = await importWedding();
      if (result === true) {
        Alert.alert(t("importSuccess"), t("importSuccessMsg"));
        if (useSettingsStore.getState().notificationsEnabled) {
          const { tasks: newTasks, agendaEvents: newEvents } = usePlanningStore.getState();
          rescheduleAllNotifications(newTasks, newEvents).catch((err) =>
            console.warn("[notifications] Reschedule failed:", err)
          );
        }
      } else if (result === "invalid_json") {
        Alert.alert(t("common:error"), t("invalidJson"));
      } else if (result === "invalid_backup") {
        Alert.alert(t("common:error"), t("invalidBackup"));
      }
    } catch (e: any) {
      Alert.alert(t("common:error"), e.message);
    } finally {
      setImporting(false);
    }
  }, [t]);

  const handleExportPdf = useCallback(
    async (type: "guests" | "budget" | "timeline" | "vendors") => {
      try {
        let html = "";
        let filename = "";
        switch (type) {
          case "guests":
            html = buildGuestListHtml(guests, tables, groups);
            filename = "invités.pdf";
            break;
          case "budget":
            html = buildBudgetHtml(budgetSummary, currency);
            filename = "budget.pdf";
            break;
          case "timeline":
            html = buildTimelineHtml(dayOfItems, wedding);
            filename = "programme.pdf";
            break;
          case "vendors":
            html = buildVendorContactsHtml(vendors);
            filename = "prestataires.pdf";
            break;
        }
        await exportToPdf(html, filename);
      } catch (e: any) {
        Alert.alert(t("common:error"), e.message);
      }
    },
    [guests, tables, groups, vendors, dayOfItems, wedding, budgetSummary, currency, t]
  );

  const handleExportCsv = useCallback(
    async (type: "budget" | "payments") => {
      try {
        let csv = "";
        let filename = "";
        switch (type) {
          case "budget":
            csv = buildBudgetCsv(budgetSummary, currency);
            filename = "budget.csv";
            break;
          case "payments":
            csv = buildPaymentsCsv(vendorPayments, vendors);
            filename = "paiements.csv";
            break;
        }
        await exportToCsv(csv, filename);
      } catch (e: any) {
        Alert.alert(t("common:error"), e.message);
      }
    },
    [budgetSummary, vendorPayments, vendors, currency, t]
  );

  return (
    <>
      <ScrollView
        className="flex-1 bg-gray-50 dark:bg-gray-950"
        showsVerticalScrollIndicator={false}
      >
        {/* PDF exports */}
        <View className="px-4 pt-4">
          <SectionTitle>{t("pdfSection")}</SectionTitle>
          <FormCard>
            <ExportRow
              icon={<FileText size={18} color="#EC4899" />}
              label={t("exportGuestList")}
              onPress={() => handleExportPdf("guests")}
            />
            <ExportRow
              icon={<FileText size={18} color="#EC4899" />}
              label={t("exportBudget")}
              onPress={() => handleExportPdf("budget")}
            />
            <ExportRow
              icon={<FileText size={18} color="#EC4899" />}
              label={t("exportTimeline")}
              onPress={() => handleExportPdf("timeline")}
            />
            <ExportRow
              icon={<FileText size={18} color="#EC4899" />}
              label={t("exportVendors")}
              onPress={() => handleExportPdf("vendors")}
              last
            />
          </FormCard>
        </View>

        {/* CSV exports */}
        <View className="px-4">
          <SectionTitle>{t("csvSection")}</SectionTitle>
          <FormCard>
            <ExportRow
              icon={<Table2 size={18} color="#10B981" />}
              label={t("exportBudgetCsv")}
              onPress={() => handleExportCsv("budget")}
            />
            <ExportRow
              icon={<Table2 size={18} color="#10B981" />}
              label={t("exportPaymentsCsv")}
              onPress={() => handleExportCsv("payments")}
              last
            />
          </FormCard>
        </View>

        {/* JSON Backup */}
        <View className="px-4">
          <SectionTitle>{t("backupSection")}</SectionTitle>
          <Text className="text-sm text-gray-500 dark:text-gray-400 leading-5 mb-3 -mt-1">
            {t("backupSectionDesc")}
          </Text>
          <FormCard>
            <ExportRow
              icon={<Download size={18} color="#3B82F6" />}
              label={exporting ? t("exporting") : t("exportData")}
              sublabel={t("exportDesc")}
              onPress={handleExportJson}
            />
            <ExportRow
              icon={<Upload size={18} color="#F59E0B" />}
              label={importing ? t("importing") : t("importData")}
              sublabel={t("importDesc")}
              onPress={() => setShowImportConfirm(true)}
              last
            />
          </FormCard>
        </View>

        <View className="h-8" />
      </ScrollView>

      <ConfirmSheet
        visible={showImportConfirm}
        title={t("importConfirmTitle")}
        message={t("importConfirmMsg")}
        confirmLabel={t("import")}
        destructive
        onConfirm={doImport}
        onCancel={() => setShowImportConfirm(false)}
      />
    </>
  );
}

function ExportRow({
  icon,
  label,
  sublabel,
  onPress,
  last = false,
}: {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  onPress: () => void;
  last?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center py-3.5 active:opacity-70 ${!last ? "border-b border-gray-50 dark:border-gray-800" : ""}`}
    >
      <View className="w-8 h-8 items-center justify-center mr-3">{icon}</View>
      <View className="flex-1">
        <Text className="text-base text-gray-900 dark:text-white font-medium">{label}</Text>
        {sublabel && (
          <Text className="text-xs text-gray-400 mt-0.5">{sublabel}</Text>
        )}
      </View>
      <ChevronRight size={16} color="#C0C0C8" />
    </Pressable>
  );
}
