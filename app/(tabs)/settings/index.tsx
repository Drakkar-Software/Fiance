import React, { useState, useCallback, useEffect } from "react";
import { useRouter } from "expo-router";
import { useSunglasses } from "@drakkar.software/sunglasses-react-native";
import { analytics, starfishAnalyticsAdapter, getAnalyticsCore } from "@/lib/analytics";
import { useTranslation } from "react-i18next";
import { View, Text, ScrollView, Pressable } from "react-native-css/components";
import { Alert, Platform } from "react-native";
import { format } from "date-fns";
import { Share2, ChevronRight, Cloud, CloudOff, Heart, CheckCircle2, Lock, Bell, PlusCircle, Trash2, Download, Globe, Pencil } from "lucide-react-native";
import { isLockEnabled, setLockEnabled } from "@/lib/app-lock";
import { PinSetup } from "@/components/PinSetup";
import {
  initStarfish,
  teardownStarfish,
  getStarfishStore,
  getLastSyncTimestamp,
  getSyncStatus,
  onSyncStatusChange,
} from "@/lib/starfish";
import { buildInviteUrl, generatePassphrase } from "@/lib/identity";
import { resolveServerConfig, resolveServerUrl } from "@/lib/server";
import { createGroupInvite } from "@/lib/group-crypto";
import { usePlanningStore } from "@/store/usePlanningStore";
import { useWeddingRegistryStore } from "@/store/useWeddingRegistryStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import {
  requestPermissions,
  cancelAllNotifications,
  rescheduleAllNotifications,
} from "@/lib/notifications";
import { SectionTitle } from "@/components/FormSection";
import { ConfirmSheet } from "@/components/ConfirmSheet";
import { RenameSheet } from "@/components/RenameSheet";
import { InviteQRSheet } from "@/components/InviteQRSheet";
import { ToggleCard } from "@/components/ToggleCard";
import { IconCard } from "@/components/IconCard";
import { PaywallSheet } from "@/components/PaywallSheet";
import { useIsPremium } from "@/lib/premium";

export default function SettingsScreen() {
  const router = useRouter();
  const { t } = useTranslation("settings");
  const language = useSettingsStore((s) => s.language);
  const setLanguage = useSettingsStore((s) => s.setLanguage);
  const colorScheme = useSettingsStore((s) => s.colorScheme);
  const setColorScheme = useSettingsStore((s) => s.setColorScheme);
  const tasks = usePlanningStore((s) => s.tasks);

  const registry = useWeddingRegistryStore((s) => s.registry);
  const switchWedding = useWeddingRegistryStore((s) => s.switchWedding);
  const createWedding = useWeddingRegistryStore((s) => s.createWedding);
  const deleteWedding = useWeddingRegistryStore((s) => s.deleteWedding);
  const updateRegistryWedding = useWeddingRegistryStore((s) => s.updateWedding);

  const activeEntry = registry?.weddings.find(
    (w) => w.id === registry.activeWeddingId
  );

  // Rename wedding
  const [renameWeddingId, setRenameWeddingId] = useState<string | null>(null);
  const renameWeddingEntry = registry?.weddings.find((w) => w.id === renameWeddingId);

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
    const sf = getStarfishStore();
    if (!sf) return;
    const update = () => {
      const s = getSyncStatus();
      if (s) {
        const key = `syncStatus${s.status.charAt(0).toUpperCase() + s.status.slice(1)}` as const;
        setSyncStatusLabel(t(key));
      }
    };
    update();
    return sf.subscribe(update);
  }, [syncEnabled, t]);

  const analyticsClient = useSunglasses();
  const [analyticsConsented, setAnalyticsConsented] = useState(
    analyticsClient.getConsentStatus() === "opted-in"
  );

  const handleToggleAnalytics = useCallback(async (value: boolean) => {
    if (value) await analyticsClient.optIn();
    else await analyticsClient.optOut();
    setAnalyticsConsented(value);
  }, [analyticsClient]);

  const premium = useIsPremium();
  const [showPaywall, setShowPaywall] = useState(false);
  const [starfishUserId, setStarfishUserId] = useState<string>("");
  useEffect(() => {
    if (!activeEntry?.seedPhrase) return;
    resolveServerConfig(activeEntry).then((c) => { if (c) setStarfishUserId(c.userId); }).catch(() => {});
  }, [activeEntry?.id, activeEntry?.seedPhrase]);

  const handleToggleSync = useCallback(async () => {
    if (!activeEntry?.id) return;

    if (syncEnabled) {
      teardownStarfish();
      starfishAnalyticsAdapter.deactivate();
      analytics.capture("sync_disabled");
      setSyncEnabled(false);
      updateRegistryWedding(activeEntry.id, { syncDisabled: true });
      return;
    }

    if (!premium) { setShowPaywall(true); return; }

    const serverUrl = resolveServerUrl(activeEntry);
    if (!activeEntry?.seedPhrase || !serverUrl) {
      Alert.alert(t("syncImpossible"), t("noServerOrPassword"));
      return;
    }

    if (!activeEntry?.serverUrl) {
      updateRegistryWedding(activeEntry.id, { serverUrl });
    }
    updateRegistryWedding(activeEntry.id, { syncDisabled: false });

    const config = await resolveServerConfig(activeEntry);
    if (!config) return;

    await initStarfish(config);
    const userData = await getAnalyticsCore()?.exportUserData();
    starfishAnalyticsAdapter.activate(config.serverUrl, userData?.anonymousId ?? "anonymous");
    analytics.capture("sync_enabled");
    setSyncEnabled(true);
  }, [syncEnabled, activeEntry, premium]);

  const [showInviteQR, setShowInviteQR] = useState(false);
  const [inviteUrl, setInviteUrl] = useState("");

  const handleInvite = useCallback(async () => {
    if (!premium) { setShowPaywall(true); return; }
    if (!activeEntry?.seedPhrase) {
      Alert.alert(t("common:error"), t("noPassword"));
      return;
    }

    // Group-crypto invite: create/reuse keyring when sync is configured
    if (syncEnabled && activeEntry) {
      try {
        const config = await resolveServerConfig(activeEntry);
        if (config) {
          // Reuse existing keyring if present (admin already created one)
          if (!activeEntry.groupKeyring) {
            const result = await createGroupInvite(activeEntry, config);
            updateRegistryWedding(activeEntry.id, { groupKeyring: result.groupKeyringJson });
            setInviteUrl(result.inviteUrl);
          } else {
            // Rebuild invite URL from existing keyring (same admin+partner already set)
            setInviteUrl(buildInviteUrl(activeEntry.label, activeEntry.seedPhrase));
          }
          setShowInviteQR(true);
          return;
        }
      } catch (err) {
        console.warn("[invite] Group-crypto setup failed, falling back:", err);
      }
    }

    // Legacy fallback: share seedPhrase directly (no group keyring)
    setInviteUrl(buildInviteUrl(activeEntry.label, activeEntry.seedPhrase));
    setShowInviteQR(true);
  }, [activeEntry, syncEnabled, updateRegistryWedding, t]);

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
        <IconCard
          icon={
            <View className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900 items-center justify-center">
              <Globe size={20} color="#EC4899" />
            </View>
          }
          title={t("publicPageTitle")}
          subtitle={t("publicPageDesc")}
          right={<ChevronRight size={18} color="#C0C0C8" />}
          onPress={() => router.push("/(tabs)/settings/public-page")}
        />
      </View>

      {/* Sauvegarde et partage */}
      <View className="px-4">
        <SectionTitle>{t("backupAndSharing")}</SectionTitle>
        <Text className="text-sm text-gray-500 dark:text-gray-400 leading-5 mb-3 -mt-1">
          {!premium ? t("premiumSyncMsg") : syncEnabled ? t("syncOnDesc") : t("syncOffDesc")}
        </Text>
        <ToggleCard
          icon={
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
          }
          title={!premium ? t("premiumFeature") : syncEnabled ? t("syncEnabled") : t("syncDisabled")}
          subtitle={
            !premium
              ? t("premiumSyncMsg")
              : syncEnabled
                ? syncStatusLabel
                  ? lastSync
                    ? `${syncStatusLabel} · ${t("lastSync", { date: format(new Date(lastSync), "dd/MM/yyyy HH:mm") })}`
                    : syncStatusLabel
                  : lastSync
                    ? t("lastSync", { date: format(new Date(lastSync), "dd/MM/yyyy HH:mm") })
                    : t("syncAutomatic")
                : t("tapToEnable")
          }
          enabled={syncEnabled && premium}
          onToggle={handleToggleSync}
        />
        {activeEntry?.seedPhrase && (
          <IconCard
            icon={
              <View className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900 items-center justify-center">
                <Share2 size={20} color="#EC4899" />
              </View>
            }
            title={t("shareInviteLink")}
            subtitle={t("sendLinkToJoin")}
            right={<ChevronRight size={18} color="#C0C0C8" />}
            onPress={handleInvite}
          />
        )}

        {/* Export / Import */}
        <IconCard
          icon={
            <View className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900 items-center justify-center">
              <Download size={20} color="#3B82F6" />
            </View>
          }
          title={t("exportImportTitle")}
          subtitle={t("exportImportDesc")}
          right={<ChevronRight size={18} color="#C0C0C8" />}
          onPress={() => router.push("/(tabs)/settings/export-import")}
        />
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
                    analytics.capture("wedding_switched");
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
                onPress={() => setRenameWeddingId(w.id)}
                className="ml-2 w-8 h-8 items-center justify-center rounded-lg"
              >
                <Pencil size={16} color="#9CA3AF" />
              </Pressable>
              <Pressable
                onPress={() => setDeleteWeddingId(w.id)}
                className="ml-1 w-8 h-8 items-center justify-center rounded-lg"
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
        <ToggleCard
          icon={
            <View className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 items-center justify-center">
              <Lock size={20} color={lockEnabled ? "#EC4899" : "#C0C0C8"} />
            </View>
          }
          title={t("appLock")}
          subtitle={lockEnabled ? t("pinBioEnabled") : t("disabled")}
          enabled={lockEnabled}
          onToggle={handleToggleLock}
        />
      </View>

      {/* Notifications */}
      {Platform.OS !== "web" && (
        <View className="px-4 mt-4">
          <SectionTitle>{t("notifications")}</SectionTitle>
          <ToggleCard
            icon={
              <View className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 items-center justify-center">
                <Bell size={20} color={notificationsEnabled ? "#EC4899" : "#C0C0C8"} />
              </View>
            }
            title={t("notificationsToggle")}
            subtitle={notificationsEnabled ? t("notificationsOnDesc") : t("notificationsOffDesc")}
            enabled={notificationsEnabled}
            onToggle={handleToggleNotifications}
          />
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

      {/* Appearance */}
      <View className="px-4 mt-4">
        <SectionTitle>{t("appearance")}</SectionTitle>
        <View className="flex-row gap-2">
          {(["light", "dark"] as const).map((scheme) => (
            <Pressable
              key={scheme}
              onPress={() => setColorScheme(scheme)}
              className={`flex-1 py-3 rounded-2xl items-center border ${
                colorScheme === scheme
                  ? "bg-primary-500 border-primary-500"
                  : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  colorScheme === scheme ? "text-white" : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {t(`theme${scheme.charAt(0).toUpperCase()}${scheme.slice(1)}` as "themeSystem" | "themeLight" | "themeDark")}
              </Text>
            </Pressable>
          ))}
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

      {/* Analytics */}
      <View className="px-4 mt-4">
        <SectionTitle>{t("analytics")}</SectionTitle>
        <ToggleCard
          icon={
            <View className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 items-center justify-center">
              <Text style={{ fontSize: 18 }}>📊</Text>
            </View>
          }
          title={t("analyticsToggle")}
          subtitle={analyticsConsented ? t("analyticsOnDesc") : t("analyticsOffDesc")}
          enabled={analyticsConsented}
          onToggle={() => handleToggleAnalytics(!analyticsConsented)}
        />
      </View>

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

    <RenameSheet
      visible={!!renameWeddingId}
      title={t("renameWeddingTitle")}
      initialValue={renameWeddingEntry?.label ?? ""}
      placeholder={t("weddingNamePlaceholder")}
      onConfirm={(value) => {
        if (renameWeddingId) updateRegistryWedding(renameWeddingId, { label: value });
        setRenameWeddingId(null);
      }}
      onCancel={() => setRenameWeddingId(null)}
    />

    <InviteQRSheet
      visible={showInviteQR}
      onClose={() => setShowInviteQR(false)}
      inviteUrl={inviteUrl}
    />

    <PaywallSheet
      visible={showPaywall}
      onClose={() => setShowPaywall(false)}
      userId={starfishUserId}
    />
    </>
  );
}

