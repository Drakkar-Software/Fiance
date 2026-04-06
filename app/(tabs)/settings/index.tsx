import React, { useState, useCallback, useEffect } from "react";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  Share,
  Platform,
} from "react-native";
import { format } from "date-fns";
import { Share2, ChevronRight, Cloud, CloudOff, Heart, CheckCircle2, Lock, Bell, PlusCircle, Trash2, Download, Upload } from "lucide-react-native";
import { isLockEnabled, setLockEnabled } from "@/lib/app-lock";
import { isPremium } from "@/lib/premium";
import { PinSetup } from "@/components/PinSetup";
import {
  initStarfish,
  teardownStarfish,
  getStarfishStore,
  getLastSyncTimestamp,
  getSyncStatus,
  onSyncStatusChange,
} from "@/lib/starfish";
import { deriveAuthToken, deriveEncryptionKey, buildInviteUrl, generatePassphrase } from "@/lib/identity";
import { useWeddingStore } from "@/store/useWeddingStore";
import { usePlanningStore } from "@/store/usePlanningStore";
import { useWeddingRegistryStore } from "@/store/useWeddingRegistryStore";
import { recalculateDueDates } from "@/lib/planning";
import { exportWedding, importWedding } from "@/lib/export-import";
import { useSettingsStore } from "@/store/useSettingsStore";
import {
  requestPermissions,
  cancelAllNotifications,
  rescheduleAllNotifications,
} from "@/lib/notifications";
import {
  SectionTitle,
  FormCard,
  InputRow,
  DateRow,
} from "@/components/FormSection";
import { ConfirmSheet } from "@/components/ConfirmSheet";

export default function SettingsScreen() {
  const router = useRouter();
  const { t } = useTranslation("settings");
  const language = useSettingsStore((s) => s.language);
  const setLanguage = useSettingsStore((s) => s.setLanguage);
  const wedding = useWeddingStore((s) => s.wedding);
  const updateWedding = useWeddingStore((s) => s.updateWedding);
  const tasks = usePlanningStore((s) => s.tasks);
  const setTasks = usePlanningStore((s) => s.setTasks);

  const registry = useWeddingRegistryStore((s) => s.registry);
  const switchWedding = useWeddingRegistryStore((s) => s.switchWedding);
  const createWedding = useWeddingRegistryStore((s) => s.createWedding);
  const deleteWedding = useWeddingRegistryStore((s) => s.deleteWedding);
  const updateRegistryWedding = useWeddingRegistryStore((s) => s.updateWedding);

  const activeEntry = registry?.weddings.find(
    (w) => w.id === registry.activeWeddingId
  );

  // Wedding label (stored in registry, not wedding store)
  const [weddingLabel, _setWeddingLabel] = useState(activeEntry?.label || "");
  const setWeddingLabel = useCallback((value: string) => {
    _setWeddingLabel(value);
    if (activeEntry?.id) {
      updateRegistryWedding(activeEntry.id, { label: value });
    }
  }, [activeEntry?.id]);

  // Wedding fields — local state for smooth typing, save to store immediately
  const [partner1, _setPartner1] = useState(wedding?.partner1Name || "");
  const setPartner1 = useCallback((value: string) => {
    _setPartner1(value);
    updateWedding({ partner1Name: value || null });
  }, []);

  const [partner2, _setPartner2] = useState(wedding?.partner2Name || "");
  const setPartner2 = useCallback((value: string) => {
    _setPartner2(value);
    updateWedding({ partner2Name: value || null });
  }, []);

  const [weddingDate, _setWeddingDate] = useState(wedding?.weddingDate || "");
  const setWeddingDate = useCallback((value: string) => {
    _setWeddingDate(value);
    updateWedding({ weddingDate: value || null });
  }, []);

  const [venueName, _setVenueName] = useState(wedding?.venueName || "");
  const setVenueName = useCallback((value: string) => {
    _setVenueName(value);
    updateWedding({ venueName: value || null });
  }, []);

  // Recalculate due dates when wedding date changes
  useEffect(() => {
    if (weddingDate && weddingDate !== wedding?.weddingDate) {
      const updated = recalculateDueDates(tasks, weddingDate);
      setTasks(updated);
      if (useSettingsStore.getState().notificationsEnabled) {
        rescheduleAllNotifications(updated, usePlanningStore.getState().agendaEvents)
          .catch((err) => console.warn("[notifications] Reschedule failed:", err));
      }
    }
  }, [weddingDate]);

  // Sync state — reactive: listens for init/teardown events
  const [syncEnabled, setSyncEnabled] = useState(!!getStarfishStore());
  useEffect(() => {
    // Re-check on mount in case Starfish initialized after initial render
    setSyncEnabled(!!getStarfishStore());
    return onSyncStatusChange(setSyncEnabled);
  }, []);
  const lastSync = syncEnabled ? getLastSyncTimestamp() : null;
  const [syncStatusLabel, setSyncStatusLabel] = useState<string | null>(null);
  useEffect(() => {
    if (!syncEnabled) { setSyncStatusLabel(null); return; }
    const interval = setInterval(() => {
      const s = getSyncStatus();
      if (s) {
        const key = `syncStatus${s.status.charAt(0).toUpperCase() + s.status.slice(1)}` as const;
        setSyncStatusLabel(t(key));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [syncEnabled, t]);

  const premium = isPremium();

  const handleToggleSync = useCallback(async () => {
    if (!activeEntry?.id) return;

    if (syncEnabled) {
      teardownStarfish();
      setSyncEnabled(false);
      updateRegistryWedding(activeEntry.id, { syncDisabled: true });
      return;
    }

    if (!premium) return; // blocked by UI, but guard anyway

    const password = activeEntry?.seedPhrase;
    const serverUrl = activeEntry?.serverUrl || process.env.EXPO_PUBLIC_SYNC_URL;
    if (!password || !serverUrl) {
      Alert.alert(
        t("syncImpossible"),
        t("noServerOrPassword")
      );
      return;
    }

    if (!activeEntry?.serverUrl) {
      updateRegistryWedding(activeEntry.id, { serverUrl });
    }

    updateRegistryWedding(activeEntry.id, { syncDisabled: false });

    const authToken = await deriveAuthToken(password);
    const userId = authToken.slice(0, 16);
    const encryptionKey = await deriveEncryptionKey(password, userId);

    initStarfish({
      serverUrl,
      authToken,
      userId,
      encryptionKey,
    });
    setSyncEnabled(true);
  }, [syncEnabled, activeEntry, premium]);

  const handleInvite = useCallback(async () => {
    const password = activeEntry?.seedPhrase;
    const name = activeEntry?.label;
    if (!password || !name) {
      Alert.alert(t("common:error"), t("noPassword"));
      return;
    }
    const url = buildInviteUrl(name, password);
    try {
      await Share.share({
        message: t("joinOurWedding", { url }),
      });
    } catch {
      // User cancelled share
    }
  }, [activeEntry]);

  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);

  const handleExport = useCallback(async () => {
    setExporting(true);
    try {
      await exportWedding(activeEntry?.label || "wedding");
    } catch (e: any) {
      Alert.alert(t("common:error"), e.message);
    } finally {
      setExporting(false);
    }
  }, [activeEntry?.label, t]);

  const [showImportConfirm, setShowImportConfirm] = useState(false);

  const doImport = useCallback(async () => {
    setShowImportConfirm(false);
    setImporting(true);
    try {
      const result = await importWedding();
      if (result === true) {
        Alert.alert(t("importSuccess"), t("importSuccessMsg"));
        if (useSettingsStore.getState().notificationsEnabled) {
          const { tasks: newTasks, agendaEvents: newEvents } = usePlanningStore.getState();
          rescheduleAllNotifications(newTasks, newEvents)
            .catch((err) => console.warn("[notifications] Reschedule failed:", err));
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

  const [showCreateConfirm, setShowCreateConfirm] = useState(false);

  const doCreateWedding = useCallback(async () => {
    setShowCreateConfirm(false);
    const passphrase = generatePassphrase();
    await createWedding(t("myWedding"), passphrase);
    router.replace("/(tabs)");
  }, [createWedding, t, router]);

  // App lock
  const [lockEnabled, setLockEnabledState] = useState(false);
  const [showPinSetup, setShowPinSetup] = useState(false);

  useEffect(() => {
    isLockEnabled().then(setLockEnabledState);
  }, []);

  const [showDisableLock, setShowDisableLock] = useState(false);

  const handleToggleLock = useCallback(() => {
    if (lockEnabled) {
      setShowDisableLock(true);
    } else {
      setShowPinSetup(true);
    }
  }, [lockEnabled]);


  // Notifications
  const notificationsEnabled = useSettingsStore((s) => s.notificationsEnabled);
  const setNotificationsEnabled = useSettingsStore((s) => s.setNotificationsEnabled);
  const agendaEvents = usePlanningStore((s) => s.agendaEvents);

  const handleToggleNotifications = useCallback(async () => {
    try {
      if (notificationsEnabled) {
        await cancelAllNotifications();
        setNotificationsEnabled(false);
      } else {
        const granted = await requestPermissions();
        if (!granted) return;
        await rescheduleAllNotifications(tasks, agendaEvents);
        setNotificationsEnabled(true);
      }
    } catch (err) {
      console.warn("[notifications] Toggle failed:", err);
    }
  }, [notificationsEnabled, tasks, agendaEvents]);

  const [deleteWeddingId, setDeleteWeddingId] = useState<string | null>(null);
  const deleteWeddingEntry = registry?.weddings.find((w) => w.id === deleteWeddingId);

  return (
    <>
    <ScrollView
      className="flex-1 bg-gray-50 dark:bg-gray-950"
      showsVerticalScrollIndicator={false}
    >
      {/* Wedding info */}
      <View className="px-4 pt-4">
        <SectionTitle>{t("weddingInfo")}</SectionTitle>
        <FormCard>
          <InputRow label={t("weddingName")} value={weddingLabel} onChangeText={setWeddingLabel} placeholder={t("weddingNamePlaceholder")} />
          <InputRow label={t("partner1")} value={partner1} onChangeText={setPartner1} placeholder={t("partnerPlaceholder")} />
          <InputRow label={t("partner2")} value={partner2} onChangeText={setPartner2} placeholder={t("partnerPlaceholder")} />
          <DateRow label={t("weddingDate")} value={weddingDate} onChange={setWeddingDate} />
          <InputRow label={t("mainVenue")} value={venueName} onChangeText={setVenueName} placeholder={t("venuePlaceholder")} />
        </FormCard>
      </View>

      {/* Sauvegarde et partage */}
      <View className="px-4">
        <SectionTitle>{t("backupAndSharing")}</SectionTitle>
        <Text className="text-sm text-gray-500 dark:text-gray-400 leading-5 mb-3 -mt-1">
          {!premium ? t("premiumSyncMsg") : syncEnabled ? t("syncOnDesc") : t("syncOffDesc")}
        </Text>
        <Pressable
          onPress={premium ? handleToggleSync : undefined}
          className={`bg-white dark:bg-gray-900 rounded-2xl p-4 mb-3 flex-row items-center border border-gray-100 dark:border-gray-800 ${
            premium ? "active:opacity-80" : "opacity-50"
          }`}
        >
          <View
            className="w-10 h-10 rounded-xl items-center justify-center"
            style={{ backgroundColor: syncEnabled ? "#ECFDF5" : "#F3F4F6" }}
          >
            {syncEnabled ? (
              <Cloud size={20} color="#10B981" />
            ) : (
              <CloudOff size={20} color="#9CA3AF" />
            )}
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-base font-medium text-gray-900 dark:text-white">
              {!premium ? t("premiumFeature") : syncEnabled ? t("syncEnabled") : t("syncDisabled")}
            </Text>
            <Text className="text-xs text-gray-400 mt-0.5">
              {!premium
                ? t("premiumSyncMsg")
                : syncEnabled
                  ? syncStatusLabel
                    ? lastSync
                      ? `${syncStatusLabel} · ${t("lastSync", { date: format(new Date(lastSync), "dd/MM/yyyy HH:mm") })}`
                      : syncStatusLabel
                    : lastSync
                      ? t("lastSync", { date: format(new Date(lastSync), "dd/MM/yyyy HH:mm") })
                      : t("syncAutomatic")
                  : t("tapToEnable")}
            </Text>
          </View>
          <View
            className="w-12 h-7 rounded-full justify-center px-0.5"
            style={{ backgroundColor: syncEnabled && premium ? "#EC4899" : "#D1D5DB" }}
          >
            <View
              className="w-6 h-6 rounded-full bg-white"
              style={{ alignSelf: syncEnabled && premium ? "flex-end" : "flex-start" }}
            />
          </View>
        </Pressable>
        {activeEntry?.seedPhrase && (
          <Pressable
            onPress={syncEnabled ? handleInvite : undefined}
            className={`bg-white dark:bg-gray-900 rounded-2xl p-4 mb-3 flex-row items-center border border-gray-100 dark:border-gray-800 ${
              syncEnabled ? "active:opacity-80" : "opacity-50"
            }`}
          >
            <View className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900 items-center justify-center">
              <Share2 size={20} color={syncEnabled ? "#EC4899" : "#9CA3AF"} />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-base font-medium text-gray-900 dark:text-white">
                {t("shareInviteLink")}
              </Text>
              <Text className="text-xs text-gray-400 mt-0.5">
                {syncEnabled
                  ? t("sendLinkToJoin")
                  : t("enableSyncToShare")}
              </Text>
            </View>
            <ChevronRight size={18} color="#C0C0C8" />
          </Pressable>
        )}

        {/* Export / Import */}
        <Pressable
          onPress={handleExport}
          disabled={exporting}
          className="bg-white dark:bg-gray-900 rounded-2xl p-4 mb-3 flex-row items-center border border-gray-100 dark:border-gray-800 active:opacity-80"
        >
          <View className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900 items-center justify-center">
            <Download size={20} color="#3B82F6" />
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-base font-medium text-gray-900 dark:text-white">
              {exporting ? t("exporting") : t("exportData")}
            </Text>
            <Text className="text-xs text-gray-400 mt-0.5">
              {t("exportDesc")}
            </Text>
          </View>
          <ChevronRight size={18} color="#C0C0C8" />
        </Pressable>

        <Pressable
          onPress={() => setShowImportConfirm(true)}
          disabled={importing}
          className="bg-white dark:bg-gray-900 rounded-2xl p-4 mb-3 flex-row items-center border border-gray-100 dark:border-gray-800 active:opacity-80"
        >
          <View className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900 items-center justify-center">
            <Upload size={20} color="#F59E0B" />
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-base font-medium text-gray-900 dark:text-white">
              {importing ? t("importing") : t("importData")}
            </Text>
            <Text className="text-xs text-gray-400 mt-0.5">
              {t("importDesc")}
            </Text>
          </View>
          <ChevronRight size={18} color="#C0C0C8" />
        </Pressable>
      </View>

      {/* Mes mariages */}
      <View className="px-4 mt-4">
        <SectionTitle>{t("myWeddings")}</SectionTitle>
        {registry?.weddings.map((w) => {
          const isActive = w.id === registry.activeWeddingId;
          return (
            <View
              key={w.id}
              className={`bg-white dark:bg-gray-900 rounded-2xl p-4 mb-2 border flex-row items-center ${
                isActive
                  ? "border-primary-300 dark:border-primary-700"
                  : "border-gray-100 dark:border-gray-800"
              }`}
            >
              <Pressable
                onPress={() => {
                  if (!isActive) {
                    switchWedding(w.id);
                    router.replace("/(tabs)");
                  }
                }}
                className="flex-row items-center flex-1 active:opacity-80"
              >
                <View
                  className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                  style={{
                    backgroundColor: isActive ? "#EC489915" : "#F3F4F6",
                  }}
                >
                  <Heart
                    size={20}
                    color={isActive ? "#EC4899" : "#9CA3AF"}
                    fill={isActive ? "#EC4899" : "transparent"}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-medium text-gray-900 dark:text-white">
                    {w.label}
                  </Text>
                  <Text className="text-xs text-gray-400 mt-0.5">
                    {isActive ? t("activeWedding") : t("tapToSwitch")}
                  </Text>
                </View>
                {isActive && (
                  <CheckCircle2 size={20} color="#EC4899" />
                )}
              </Pressable>
              <Pressable
                onPress={() => setDeleteWeddingId(w.id)}
                className="ml-2 w-8 h-8 items-center justify-center rounded-lg"
              >
                <Trash2 size={16} color="#EF4444" />
              </Pressable>
            </View>
          );
        })}
        <Pressable
          onPress={() => setShowCreateConfirm(true)}
          className="bg-white dark:bg-gray-900 rounded-2xl p-4 mb-2 border border-dashed border-gray-300 dark:border-gray-700 flex-row items-center active:opacity-80"
        >
          <View className="w-10 h-10 rounded-xl items-center justify-center mr-3 bg-gray-50 dark:bg-gray-800">
            <PlusCircle size={20} color="#9CA3AF" />
          </View>
          <View className="flex-1">
            <Text className="text-base font-medium text-gray-500 dark:text-gray-400">
              {t("createNewWedding")}
            </Text>
          </View>
        </Pressable>
      </View>

      {/* Security */}
      <View className="px-4 mt-4">
        <SectionTitle>{t("security")}</SectionTitle>
        <Pressable
          onPress={handleToggleLock}
          className="bg-white dark:bg-gray-900 rounded-2xl p-4 mb-2 border border-gray-100 dark:border-gray-800 flex-row items-center active:opacity-80"
        >
          <View className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 items-center justify-center">
            <Lock size={20} color={lockEnabled ? "#EC4899" : "#C0C0C8"} />
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-base text-gray-900 dark:text-white font-medium">
              {t("appLock")}
            </Text>
            <Text className="text-xs text-gray-400 mt-0.5">
              {lockEnabled ? t("pinBioEnabled") : t("disabled")}
            </Text>
          </View>
          <View
            className="w-12 h-7 rounded-full justify-center px-0.5"
            style={{ backgroundColor: lockEnabled ? "#EC4899" : "#D1D5DB" }}
          >
            <View
              className="w-6 h-6 rounded-full bg-white"
              style={{ alignSelf: lockEnabled ? "flex-end" : "flex-start" }}
            />
          </View>
        </Pressable>
      </View>

      {/* Notifications */}
      {Platform.OS !== "web" && (
        <View className="px-4 mt-4">
          <SectionTitle>{t("notifications")}</SectionTitle>
          <Pressable
            onPress={handleToggleNotifications}
            className="bg-white dark:bg-gray-900 rounded-2xl p-4 mb-2 border border-gray-100 dark:border-gray-800 flex-row items-center active:opacity-80"
          >
            <View className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 items-center justify-center">
              <Bell size={20} color={notificationsEnabled ? "#EC4899" : "#C0C0C8"} />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-base text-gray-900 dark:text-white font-medium">
                {t("notificationsToggle")}
              </Text>
              <Text className="text-xs text-gray-400 mt-0.5">
                {notificationsEnabled ? t("notificationsOnDesc") : t("notificationsOffDesc")}
              </Text>
            </View>
            <View
              className="w-12 h-7 rounded-full justify-center px-0.5"
              style={{ backgroundColor: notificationsEnabled ? "#EC4899" : "#D1D5DB" }}
            >
              <View
                className="w-6 h-6 rounded-full bg-white"
                style={{ alignSelf: notificationsEnabled ? "flex-end" : "flex-start" }}
              />
            </View>
          </Pressable>
        </View>
      )}

      {/* Language */}
      <View className="px-4 mt-4">
        <SectionTitle>{t("language")}</SectionTitle>
        <View className="flex-row gap-2">
          <Pressable
            onPress={() => setLanguage("fr")}
            className={`flex-1 py-3 rounded-2xl items-center border ${
              language === "fr"
                ? "bg-primary-500 border-primary-500"
                : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
            }`}
          >
            <Text className={`text-base font-medium ${language === "fr" ? "text-white" : "text-gray-500"}`}>
              Français
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setLanguage("en")}
            className={`flex-1 py-3 rounded-2xl items-center border ${
              language === "en"
                ? "bg-primary-500 border-primary-500"
                : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
            }`}
          >
            <Text className={`text-base font-medium ${language === "en" ? "text-white" : "text-gray-500"}`}>
              English
            </Text>
          </Pressable>
        </View>
      </View>

      <PinSetup
        visible={showPinSetup}
        onComplete={() => {
          setShowPinSetup(false);
          setLockEnabledState(true);
        }}
        onCancel={() => setShowPinSetup(false)}
      />

      {/* About */}
      <View className="px-4 mt-4 mb-8">
        <SectionTitle>{t("about")}</SectionTitle>
        <View className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
          <Text className="text-base font-semibold text-gray-900 dark:text-white">
            WeddingOS
          </Text>
          <Text className="text-sm text-gray-400 mt-1">
            Version 1.0.0
          </Text>
          <View className="mt-3 pt-3 border-t border-gray-50 dark:border-gray-800">
            <Text className="text-xs text-gray-400 leading-4">
              {t("privacyLine")}
            </Text>
          </View>
        </View>
      </View>

      <View className="h-8" />
    </ScrollView>

    <ConfirmSheet
      visible={!!deleteWeddingId}
      title={t("deleteWeddingTitle")}
      message={t("deleteWeddingMsg", { label: deleteWeddingEntry?.label ?? "" })}
      confirmLabel={t("delete")}
      destructive
      onConfirm={() => {
        if (deleteWeddingId) deleteWedding(deleteWeddingId);
        setDeleteWeddingId(null);
      }}
      onCancel={() => setDeleteWeddingId(null)}
    />

    <ConfirmSheet
      visible={showCreateConfirm}
      title={t("createNewWedding")}
      message={t("newWeddingConfirm", { count: registry?.weddings.length ?? 0 })}
      onConfirm={doCreateWedding}
      onCancel={() => setShowCreateConfirm(false)}
    />

    <ConfirmSheet
      visible={showImportConfirm}
      title={t("importConfirmTitle")}
      message={t("importConfirmMsg")}
      confirmLabel={t("import")}
      destructive
      onConfirm={doImport}
      onCancel={() => setShowImportConfirm(false)}
    />

    <ConfirmSheet
      visible={showDisableLock}
      title={t("disableLock")}
      message={t("disableLockMsg")}
      confirmLabel={t("disable")}
      destructive
      onConfirm={() => {
        setShowDisableLock(false);
        setLockEnabled(false).then(() => setLockEnabledState(false));
      }}
      onCancel={() => setShowDisableLock(false)}
    />
    </>
  );
}

