import React, { useState, useCallback } from "react";
import { View, Text, ScrollView, Pressable } from "react-native-css/components";
import { Alert, Platform } from "react-native";
import { toast } from "@/lib/toast/sonner";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import { ChevronRight, Download, Upload, FileText, Table2, Sparkles, FileSpreadsheet } from "lucide-react-native";
import { useGuestsStore } from "@/store/useGuestsStore";
import { useVendorsStore } from "@/store/useVendorsStore";
import { usePlanningStore } from "@/store/usePlanningStore";
import { useMealSelectionsStore } from "@/store/useMealSelectionsStore";
import { useWeddingEventsStore } from "@/store/useWeddingEventsStore";
import { MEAL_CHOICE_LABELS, type MealChoice } from "@fiance/sdk";
import { useWeddingStore } from "@/store/useWeddingStore";
import { useWeddingRegistryStore } from "@/store/useWeddingRegistryStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useBudgetSummary } from "@/store/useBudgetStore";
import { exportWedding, pickBackupJson, applyBackup, applyLegacyToSpace } from "@/lib/export-import";
import { WEDDING_SAMPLES, getSampleBackupJson, type SampleSize } from "@/samples";
import { getActiveWeddingNodeId } from "@/lib/starfish";
import { ArrowRightLeft } from "lucide-react-native";
import {
  exportToPdf,
  buildGuestListHtml,
  buildBudgetHtml,
  buildTimelineHtml,
  buildVendorContactsHtml,
  buildMenuSummaryHtml,
  exportToCsv,
  buildBudgetCsv,
  buildPaymentsCsv,
  buildGuestLogisticsCsv,
} from "@/lib/pdf-export";
import { rescheduleAllNotifications } from "@/lib/notifications";
import { analytics } from "@/lib/analytics";
import { SectionTitle, FormCard } from "@/components/FormSection";
import { ConfirmSheet } from "@/components/ConfirmSheet";

export default function ExportImportScreen() {
  const { t } = useTranslation("settings");
  const router = useRouter();
  const guests = useGuestsStore((s) => s.guests);
  const tables = useGuestsStore((s) => s.tables);
  const groups = useGuestsStore((s) => s.groups);
  const vendors = useVendorsStore((s) => s.vendors);
  const vendorPayments = useVendorsStore((s) => s.vendorPayments);
  const dayOfItems = usePlanningStore((s) => s.dayOfItems);
  const mealSelections = useMealSelectionsStore((s) => s.mealSelections);
  const weddingEvents = useWeddingEventsStore((s) => s.weddingEvents);
  const wedding = useWeddingStore((s) => s.wedding);
  const currency = useWeddingStore((s) => s.wedding?.currency ?? "EUR");
  const registry = useWeddingRegistryStore((s) => s.registry);
  const activeEntry = registry?.weddings.find((w) => w.id === registry.activeWeddingId);
  const budgetSummary = useBudgetSummary();

  const isLegacy = !!wedding && !getActiveWeddingNodeId();

  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [pickedJson, setPickedJson] = useState<string | null>(null);
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [importingToSpace, setImportingToSpace] = useState(false);
  const [pickedLegacyJson, setPickedLegacyJson] = useState<string | null>(null);
  const [showImportToSpaceConfirm, setShowImportToSpaceConfirm] = useState(false);
  const [selectedSampleId, setSelectedSampleId] = useState<SampleSize | null>(null);
  const [showSampleConfirm, setShowSampleConfirm] = useState(false);
  const [importingSample, setImportingSample] = useState(false);

  const handleExportJson = useCallback(async () => {
    setExporting(true);
    try {
      await exportWedding(activeEntry?.label || "wedding");
      analytics.capture("export_data", { format: "json", kind: "backup" });
    } catch (e: any) {
      Alert.alert(t("common:error"), e.message);
    } finally {
      setExporting(false);
    }
  }, [activeEntry?.label, t]);

  const handlePickImport = useCallback(() => {
    pickBackupJson().then((json) => {
      if (!json) return;
      setPickedJson(json);
      setShowImportConfirm(true);
    });
  }, []);

  const doImport = useCallback(async () => {
    if (!pickedJson) return;
    setShowImportConfirm(false);
    setImporting(true);
    try {
      const result = await applyBackup(pickedJson);
      setPickedJson(null);
      if (result === true) {
        analytics.capture("import_data", { source: "backup" });
        toast.success(t("importSuccessMsg"));
        if (useSettingsStore.getState().notificationsEnabled) {
          const { tasks: newTasks, agendaEvents: newEvents } = usePlanningStore.getState();
          rescheduleAllNotifications(newTasks, newEvents).catch((err) =>
            console.warn("[notifications] Reschedule failed:", err)
          );
        }
      } else if (result === "invalid_json") {
        toast.error(t("invalidJson"));
      } else if (result === "invalid_backup") {
        toast.error(t("invalidBackup"));
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setImporting(false);
    }
  }, [pickedJson, t]);

  const handlePickLegacyImport = useCallback(() => {
    pickBackupJson().then((json) => {
      if (!json) return;
      setPickedLegacyJson(json);
      setShowImportToSpaceConfirm(true);
    });
  }, []);

  const doImportToSpace = useCallback(async () => {
    if (!pickedLegacyJson) return;
    setShowImportToSpaceConfirm(false);
    setImportingToSpace(true);
    try {
      const result = await applyLegacyToSpace(pickedLegacyJson);
      setPickedLegacyJson(null);
      if (!result.ok) {
        const msgKey = result.error === "no_session"
          ? "importToSpaceNoSession"
          : result.error === "push_failed"
          ? "importToSpaceFailed"
          : result.error === "invalid_json"
          ? "invalidJson"
          : "invalidBackup";
        toast.error(t(msgKey));
      } else {
        analytics.capture("import_data", { source: "legacy" });
        toast.success(t("importToSpaceSuccessMsg", { count: result.result.nodeCount }));
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setImportingToSpace(false);
    }
  }, [pickedLegacyJson, t]);

  const selectedSample = selectedSampleId
    ? WEDDING_SAMPLES.find((sample) => sample.id === selectedSampleId)
    : undefined;

  const handlePickSample = useCallback((sampleId: SampleSize) => {
    setSelectedSampleId(sampleId);
    setShowSampleConfirm(true);
  }, []);

  const doImportSample = useCallback(async () => {
    if (!selectedSampleId) return;
    setShowSampleConfirm(false);
    setImportingSample(true);
    try {
      const result = await applyBackup(getSampleBackupJson(selectedSampleId));
      setSelectedSampleId(null);
      if (result === true) {
        analytics.capture("import_data", { source: "sample", sample: selectedSampleId });
        toast.success(t("importSuccessMsg"));
        if (useSettingsStore.getState().notificationsEnabled) {
          const { tasks: newTasks, agendaEvents: newEvents } = usePlanningStore.getState();
          rescheduleAllNotifications(newTasks, newEvents).catch((err) =>
            console.warn("[notifications] Reschedule failed:", err)
          );
        }
      } else if (result === "invalid_json") {
        toast.error(t("invalidJson"));
      } else if (result === "invalid_backup") {
        toast.error(t("invalidBackup"));
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setImportingSample(false);
    }
  }, [selectedSampleId, t]);

  const handleExportPdf = useCallback(
    async (type: "guests" | "budget" | "timeline" | "vendors" | "menu") => {
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
          case "menu": {
            const mealChoiceLabels = Object.fromEntries(
              (Object.keys(MEAL_CHOICE_LABELS) as MealChoice[]).map((m) => [m, t(MEAL_CHOICE_LABELS[m])])
            );
            html = buildMenuSummaryHtml(guests, mealSelections, weddingEvents, mealChoiceLabels, t("menuSummaryTitle"));
            filename = "synthese-menu-traiteur.pdf";
            break;
          }
        }
        await exportToPdf(html, filename);
        analytics.capture("export_data", { format: "pdf", kind: type });
      } catch (e: any) {
        Alert.alert(t("common:error"), e.message);
      }
    },
    [guests, tables, groups, vendors, dayOfItems, wedding, budgetSummary, currency, mealSelections, weddingEvents, t]
  );

  const handleExportCsv = useCallback(
    async (type: "budget" | "payments" | "logistics") => {
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
          case "logistics":
            csv = buildGuestLogisticsCsv(guests, vendors);
            filename = "logistique-invites.csv";
            break;
        }
        await exportToCsv(csv, filename);
        analytics.capture("export_data", { format: "csv", kind: type });
      } catch (e: any) {
        Alert.alert(t("common:error"), e.message);
      }
    },
    [budgetSummary, vendorPayments, vendors, guests, currency, t]
  );

  return (
    <>
      <ScrollView
        className="flex-1 bg-accent-paper"
        showsVerticalScrollIndicator={false}
      >
        {/* PDF exports */}
        <View className="px-4 pt-4">
          <SectionTitle>{t("pdfSection")}</SectionTitle>
          <FormCard>
            <ExportRow
              icon={<FileText size={18} color="#b96a4a" />}
              label={t("exportGuestList")}
              onPress={() => handleExportPdf("guests")}
            />
            <ExportRow
              icon={<FileText size={18} color="#b96a4a" />}
              label={t("exportBudget")}
              onPress={() => handleExportPdf("budget")}
            />
            <ExportRow
              icon={<FileText size={18} color="#b96a4a" />}
              label={t("exportTimeline")}
              onPress={() => handleExportPdf("timeline")}
            />
            <ExportRow
              icon={<FileText size={18} color="#b96a4a" />}
              label={t("exportVendors")}
              onPress={() => handleExportPdf("vendors")}
            />
            <ExportRow
              icon={<FileText size={18} color="#b96a4a" />}
              label={t("exportMenuSummary")}
              onPress={() => handleExportPdf("menu")}
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
            />
            <ExportRow
              icon={<Table2 size={18} color="#10B981" />}
              label={t("exportLogisticsCsv")}
              onPress={() => handleExportCsv("logistics")}
              last
            />
          </FormCard>
        </View>

        {/* Migration wizard — visible when local data exists but Space is not yet active */}
        {isLegacy && (
          <View className="px-4">
            <SectionTitle>{t("migrationSection")}</SectionTitle>
            <Text className="text-sm text-mute leading-5 mb-3 -mt-1">
              {t("migrationSectionDesc")}
            </Text>
            <FormCard>
              <ExportRow
                icon={<Download size={18} color="#b96a4a" />}
                label={exporting ? t("exporting") : t("migrationBackup")}
                sublabel={t("migrationBackupDesc")}
                onPress={handleExportJson}
              />
              {Platform.OS === "web" ? (
                <WebFileRow
                  icon={<ArrowRightLeft size={18} color="#8B5CF6" />}
                  label={t("migrationImport")}
                  sublabel={t("migrationImportDesc")}
                  last
                  onJson={(json) => { setPickedLegacyJson(json); setShowImportToSpaceConfirm(true); }}
                />
              ) : (
                <ExportRow
                  icon={<ArrowRightLeft size={18} color="#8B5CF6" />}
                  label={importingToSpace ? t("importing") : t("migrationImport")}
                  sublabel={t("migrationImportDesc")}
                  onPress={handlePickLegacyImport}
                  last
                />
              )}
            </FormCard>
          </View>
        )}

        {/* Sample weddings */}
        <View className="px-4">
          <SectionTitle>{t("samplesSection")}</SectionTitle>
          <Text className="text-sm text-mute leading-5 mb-3 -mt-1">
            {t("samplesSectionDesc")}
          </Text>
          <FormCard>
            {WEDDING_SAMPLES.map((sample, index) => (
              <ExportRow
                key={sample.id}
                icon={<Sparkles size={18} color="#6e7a4a" />}
                label={importingSample && selectedSampleId === sample.id ? t("importing") : t(sample.labelKey)}
                sublabel={t(sample.descriptionKey)}
                onPress={() => handlePickSample(sample.id)}
                last={index === WEDDING_SAMPLES.length - 1}
              />
            ))}
          </FormCard>
        </View>

        {/* External guest import */}
        <View className="px-4">
          <SectionTitle>{t("importExternalSection")}</SectionTitle>
          <FormCard>
            <ExportRow
              icon={<FileSpreadsheet size={18} color="#6e7a4a" />}
              label={t("importExternalRow")}
              sublabel={t("importExternalRowDesc")}
              onPress={() => router.push("/settings/import-external")}
              last
            />
          </FormCard>
        </View>

        {/* JSON Backup */}
        <View className="px-4">
          <SectionTitle>{t("backupSection")}</SectionTitle>
          <Text className="text-sm text-mute leading-5 mb-3 -mt-1">
            {t("backupSectionDesc")}
          </Text>
          <FormCard>
            <ExportRow
              icon={<Download size={18} color="#3B82F6" />}
              label={exporting ? t("exporting") : t("exportData")}
              sublabel={t("exportDesc")}
              onPress={handleExportJson}
            />
            {Platform.OS === "web" ? (
              <WebFileRow
                icon={<Upload size={18} color="#F59E0B" />}
                label={t("importData")}
                sublabel={t("importDesc")}
                last
                onJson={(json) => { setPickedJson(json); setShowImportConfirm(true); }}
              />
            ) : (
              <ExportRow
                icon={<Upload size={18} color="#F59E0B" />}
                label={importing ? t("importing") : t("importData")}
                sublabel={t("importDesc")}
                onPress={handlePickImport}
                last
              />
            )}
          </FormCard>
        </View>

        <View className="h-8" />
      </ScrollView>

      <ConfirmSheet
        visible={showImportConfirm}
        title={t("importConfirmTitle")}
        message={t("importConfirmMsg")}
        confirmLabel={t("import")}
        onConfirm={doImport}
        onCancel={() => setShowImportConfirm(false)}
      />

      <ConfirmSheet
        visible={showSampleConfirm}
        title={t("samplesImportConfirmTitle")}
        message={t("samplesImportConfirmMsg", {
          label: selectedSample ? t(selectedSample.labelKey) : "",
        })}
        confirmLabel={t("import")}
        onConfirm={doImportSample}
        onCancel={() => {
          setShowSampleConfirm(false);
          setSelectedSampleId(null);
        }}
      />

      <ConfirmSheet
        visible={showImportToSpaceConfirm}
        title={t("importToSpaceConfirmTitle")}
        message={t("importToSpaceConfirmMsg")}
        confirmLabel={t("import")}
        onConfirm={doImportToSpace}
        onCancel={() => setShowImportToSpaceConfirm(false)}
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
      className={`flex-row items-center py-3.5 active:opacity-70 ${!last ? "border-b border-hair" : ""}`}
    >
      <View className="w-8 h-8 items-center justify-center mr-3">{icon}</View>
      <View className="flex-1">
        <Text className="text-base text-ink font-medium">{label}</Text>
        {sublabel && (
          <Text className="text-xs text-mute mt-0.5">{sublabel}</Text>
        )}
      </View>
      <ChevronRight size={16} color="#C0C0C8" />
    </Pressable>
  );
}

/**
 * Web-only file import row. Uses a native <label>+<input type="file"> so the
 * browser opens the file picker via its own mechanism — bypasses the JS
 * programmatic click restriction in Safari PWA standalone mode.
 */
function WebFileRow({
  icon,
  label,
  sublabel,
  last = false,
  onJson,
}: {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  last?: boolean;
  onJson: (json: string) => void;
}) {
  const borderStyle = last ? {} : { borderBottomWidth: 1, borderBottomColor: "rgba(0,0,0,0.08)", borderBottomStyle: "solid" as const };
  return (
    // @ts-ignore — <label> is valid HTML on web; not a RN primitive
    <label style={{ display: "flex", flexDirection: "row", alignItems: "center", paddingTop: 14, paddingBottom: 14, cursor: "pointer", ...borderStyle }}>
      {/* @ts-ignore */}
      <input
        type="file"
        accept=".json,application/json"
        style={{ position: "absolute", opacity: 0, width: 1, height: 1, pointerEvents: "none" } as any}
        onChange={(e: any) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = () => {
            if (reader.result) onJson(reader.result as string);
          };
          reader.readAsText(file);
          e.target.value = "";
        }}
      />
      <div style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", marginRight: 12 }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 16, color: "var(--color-ink, #1a1a1a)", fontWeight: "500" }}>{label}</div>
        {sublabel && <div style={{ fontSize: 12, color: "var(--color-mute, #9ca3af)", marginTop: 2 }}>{sublabel}</div>}
      </div>
      <ChevronRight size={16} color="#C0C0C8" />
    </label>
  );
}
