import React, { useState, useCallback, useEffect } from "react";
import { useRouter } from "expo-router";
import { useTelemetry as useSunglasses } from "@drakkar.software/dk-spaces-analytics-sdk";
import { analytics } from "@/lib/analytics";
import { useTranslation } from "react-i18next";
import { View, Text, ScrollView, Pressable } from "react-native-css/components";
import { Alert, Platform } from "react-native";
import { toast } from "@/lib/toast/sonner";
import { format } from "date-fns";
import Constants from "expo-constants";
import { useUpdates } from "expo-updates";
import { Share2, ChevronRight, Cloud, CloudOff, Heart, CheckCircle2, Lock, Bell, PlusCircle, Trash2, Download, Globe, Pencil, Sparkles, FileText, QrCode, RefreshCw } from "lucide-react-native";
import { isLockEnabled, setLockEnabled } from "@/lib/app-lock";
import { PinSetup } from "@/components/PinSetup";
import { QRScannerScreen } from "@/components/QRScannerScreen";
import { parseSpaceInviteUrl } from "@/lib/identity";
import { joinWeddingByToken } from "@/lib/join-space";
import {
  teardownStarfish,
  getStarfishStore,
  isSyncActive,
  getLastSyncTimestamp,
  getSyncStatus,
  onSyncStatusChange,
  subscribeSyncStatus,
} from "@/lib/starfish";
import { activateSync } from "@/lib/providers";
import { needsNamespaceResync, resyncWeddingToCurrentNamespace } from "@/lib/space-resync";
import { generatePassphrase } from "@/lib/identity";
import { resolveServerConfig, resolveServerUrl } from "@/lib/server";
import { createInviteLink } from "@/lib/invite-link";
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
import { Display } from "@/components/Display";
import { Label } from "@/components/Label";
import { PageHeader } from "@/components/PageHeader";
import { useWeddingStore } from "@/store/useWeddingStore";

export default function SettingsScreen() {
  const router = useRouter();
  const { t } = useTranslation("settings");
  const language = useSettingsStore((s) => s.language);
  const setLanguage = useSettingsStore((s) => s.setLanguage);
  const colorScheme = useSettingsStore((s) => s.colorScheme);
  const setColorScheme = useSettingsStore((s) => s.setColorScheme);
  const tasks = usePlanningStore((s) => s.tasks);

  const appVersion = Constants.expoConfig?.version ?? "";
  const { currentlyRunning } = useUpdates();
  const updateDate = currentlyRunning?.createdAt ?? null;

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
    return subscribeSyncStatus(sf, () => update());
  }, [syncEnabled, t]);

  const wedding = useWeddingStore((s) => s.wedding);
  const partner1 = wedding?.partner1Name || "";
  const partner2 = wedding?.partner2Name || "";

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
    console.log("[sync] handleToggleSync called", { id: activeEntry?.id, syncEnabled, premium, hasSeed: !!activeEntry?.seedPhrase, serverUrl: activeEntry?.serverUrl });
    if (!activeEntry?.id) return;

    if (syncEnabled) {
      teardownStarfish();
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

    let activated: { userId: string } | null = null;
    try {
      activated = await activateSync(activeEntry);
    } catch (err: any) {
      console.error("[sync] activateSync failed:", err);
      updateRegistryWedding(activeEntry.id, { syncDisabled: true });
      setSyncEnabled(false);
      Alert.alert(t("syncImpossible"), err?.message ?? String(err));
      return;
    }
    if (!activated) return;

    analytics.capture("sync_enabled");
    setSyncEnabled(isSyncActive());

    // If the user has local data that hasn't been pushed to Space yet, offer migration.
    if (wedding) {
      Alert.alert(
        t("migrationDetectedTitle"),
        t("migrationDetectedMsg"),
        [
          { text: t("migrationLater"), style: "cancel" },
          { text: t("migrationNow"), onPress: () => router.push("/settings/export-import") },
        ],
      );
    }
  }, [syncEnabled, activeEntry, premium, wedding, router, t]);

  const [showInviteQR, setShowInviteQR] = useState(false);

  const handleInvite = useCallback(() => {
    if (!premium) { setShowPaywall(true); return; }
    if (!activeEntry?.seedPhrase) { toast.error(t("noPassword")); return; }
    if (!syncEnabled) { toast.error(t("enableSyncToShare")); return; }
    setShowInviteQR(true);
  }, [activeEntry, syncEnabled, premium, t]);

  const generateInvite = useCallback(
    () => createInviteLink(activeEntry!),
    [activeEntry],
  );

  const [showCreateConfirm, setShowCreateConfirm] = useState(false);

  const doCreateWedding = useCallback(async () => {
    setShowCreateConfirm(false);
    const passphrase = generatePassphrase();
    await createWedding(t("myWedding"), passphrase);
    analytics.capture("wedding_created", { method: "new" });
    router.replace("/(tabs)");
  }, [createWedding, t, router]);

  const [showJoinScanner, setShowJoinScanner] = useState(false);

  const handleJoinScanned = useCallback(async (url: string) => {
    setShowJoinScanner(false);
    const token = parseSpaceInviteUrl(url);
    if (!token) {
      Alert.alert(t("common:error"), t("common:onboarding.invalidQR"));
      return;
    }
    try {
      await joinWeddingByToken(token);
      analytics.capture("wedding_created", { method: "invite" });
      router.replace("/(tabs)");
    } catch (e: any) {
      Alert.alert(t("common:error"), e?.message ?? String(e));
    }
  }, [router, t]);

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

  const [showResyncConfirm, setShowResyncConfirm] = useState(false);
  const [resyncing, setResyncing] = useState(false);
  const handleResync = useCallback(async () => {
    if (!activeEntry) return;
    setShowResyncConfirm(false);
    setResyncing(true);
    try {
      await resyncWeddingToCurrentNamespace(activeEntry);
      analytics.capture("wedding_resynced");
      toast.success(t("resyncWeddingSuccess"));
    } catch (err) {
      toast.error(t("resyncWeddingError"));
      console.warn("[settings] resync failed:", err);
    } finally {
      setResyncing(false);
    }
  }, [activeEntry, t]);

  return (
    <>
    <ScrollView
      className="flex-1 bg-accent-paper"
      showsVerticalScrollIndicator={false}
    >
      {/* Page header (web only) */}
      {Platform.OS === 'web' && (
        <View className="px-4 pt-5 pb-3">
          <PageHeader
            eyebrow={t("common:tabs.settings")}
            title={partner1 && partner2 ? `${partner1} & ${partner2}` : t("title")}
            titleSize={28}
            style={{ paddingHorizontal: 0, paddingTop: 0 }}
          />
        </View>
      )}

      {/* Premium (hidden for now) */}
      {false && (
      <View className="px-4 pt-2">
        <IconCard
          icon={
            <View className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900 items-center justify-center">
              <Sparkles size={20} color="#b96a4a" />
            </View>
          }
          title={premium ? t("premiumUnlocked") : t("premiumTitle")}
          subtitle={premium ? t("premiumPitch") : t("premiumSectionDesc")}
          right={<ChevronRight size={18} color="#C0C0C8" />}
          onPress={() => router.push("/settings/premium")}
        />
      </View>
      )}

      {/* Wedding info */}
      <View className="px-4 pt-2">
        <IconCard
          icon={
            <View className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900 items-center justify-center">
              <Globe size={20} color="#b96a4a" />
            </View>
          }
          title={t("publicPageTitle")}
          subtitle={t("publicPageDesc")}
          right={<ChevronRight size={18} color="#C0C0C8" />}
          onPress={() => router.push("/settings/public-page")}
        />
        {/* Documents button hidden until feature ready */}
        {/* <IconCard
          icon={
            <View className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900 items-center justify-center">
              <FileText size={20} color="#b96a4a" />
            </View>
          }
          title={t("documentsTitle")}
          subtitle={t("documentsDesc")}
          right={<ChevronRight size={18} color="#C0C0C8" />}
          onPress={() => router.push("/settings/documents")}
        /> */}
      </View>

      {/* Sauvegarde et partage */}
      <View className="px-4">
        <SectionTitle>{t("backupAndSharing")}</SectionTitle>
        <Text className="text-sm text-mute leading-5 mb-3 -mt-1">
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
        {activeEntry?.seedPhrase && activeEntry.role !== "member" && (
          <IconCard
            icon={
              <View className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900 items-center justify-center">
                <Share2 size={20} color="#b96a4a" />
              </View>
            }
            title={t("shareInviteLink")}
            subtitle={t("sendLinkToJoin")}
            right={<ChevronRight size={18} color="#C0C0C8" />}
            onPress={handleInvite}
          />
        )}
        {needsNamespaceResync(activeEntry) && (
          <IconCard
            icon={
              <View className="w-10 h-10 rounded-xl items-center justify-center" style={{ backgroundColor: "#FBF0DD" }}>
                <RefreshCw size={20} color="#c9922f" />
              </View>
            }
            title={t("resyncWedding")}
            subtitle={t("resyncWeddingDesc")}
            right={resyncing ? undefined : <ChevronRight size={18} color="#C0C0C8" />}
            onPress={resyncing ? undefined : () => setShowResyncConfirm(true)}
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
          onPress={() => router.push("/settings/export-import")}
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
              className={`bg-accent-card rounded-2xl p-4 mb-2 border flex-row items-center ${
                isActive
                  ? "border-primary-300 dark:border-primary-700"
                  : "border-hair"
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
                    backgroundColor: isActive ? "#b96a4a15" : "#F3F4F6",
                  }}
                >
                  <Heart
                    size={20}
                    color={isActive ? "#b96a4a" : "#9CA3AF"}
                    fill={isActive ? "#b96a4a" : "transparent"}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-medium text-ink">
                    {w.label}
                  </Text>
                  <Text className="text-xs text-mute mt-0.5">
                    {isActive ? t("activeWedding") : t("tapToSwitch")}
                  </Text>
                </View>
                {isActive && (
                  <CheckCircle2 size={20} color="#b96a4a" />
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
          className="bg-accent-card rounded-2xl p-4 mb-2 border border-hair dark:border-hair flex-row items-center active:opacity-80"
        >
          <View className="w-10 h-10 rounded-xl items-center justify-center mr-3 bg-accent-paper">
            <PlusCircle size={20} color="#9CA3AF" />
          </View>
          <View className="flex-1">
            <Text className="text-base font-medium text-mute">
              {t("createNewWedding")}
            </Text>
          </View>
        </Pressable>
        <Pressable
          onPress={() => setShowJoinScanner(true)}
          className="bg-accent-card rounded-2xl p-4 mb-2 border border-hair dark:border-hair flex-row items-center active:opacity-80"
        >
          <View className="w-10 h-10 rounded-xl items-center justify-center mr-3 bg-accent-paper">
            <QrCode size={20} color="#9CA3AF" />
          </View>
          <View className="flex-1">
            <Text className="text-base font-medium text-mute">
              {t("common:onboarding.joinWedding")}
            </Text>
          </View>
        </Pressable>
      </View>

      {/* Security */}
      <View className="px-4 mt-4">
        <SectionTitle>{t("security")}</SectionTitle>
        <ToggleCard
          icon={
            <View className="w-10 h-10 rounded-xl bg-accent-paper items-center justify-center">
              <Lock size={20} color={lockEnabled ? "#b96a4a" : "#C0C0C8"} />
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
              <View className="w-10 h-10 rounded-xl bg-accent-paper items-center justify-center">
                <Bell size={20} color={notificationsEnabled ? "#b96a4a" : "#C0C0C8"} />
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
                : "bg-accent-card border-hair"
            }`}
          >
            <Text className={`text-base font-medium ${language === "fr" ? "text-white" : "text-mute"}`}>
              Français
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setLanguage("en")}
            className={`flex-1 py-3 rounded-2xl items-center border ${
              language === "en"
                ? "bg-primary-500 border-primary-500"
                : "bg-accent-card border-hair"
            }`}
          >
            <Text className={`text-base font-medium ${language === "en" ? "text-white" : "text-mute"}`}>
              English
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Appearance (hidden for now, keep code) */}
      {false && (
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
                    : "bg-accent-card border-hair"
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    colorScheme === scheme ? "text-white" : "text-mute"
                  }`}
                >
                  {t(`theme${scheme.charAt(0).toUpperCase()}${scheme.slice(1)}` as "themeSystem" | "themeLight" | "themeDark")}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

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
            <View className="w-10 h-10 rounded-xl bg-accent-paper items-center justify-center">
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
        <View className="bg-accent-card rounded-2xl p-5 border border-hair">
          <Text className="text-base font-semibold text-ink">
            Fiancé
          </Text>
          <Text className="text-sm text-mute mt-1">
            Version {appVersion}
            {updateDate ? ` (${format(updateDate, "dd/MM/yyyy")})` : ""}
          </Text>
          <Text className="text-xs text-mute mt-2">
            {t("madeBy")}
          </Text>
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
        if (deleteWeddingId) {
          deleteWedding(deleteWeddingId);
          analytics.capture("wedding_deleted");
        }
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
      onConfirm={() => {
        setShowDisableLock(false);
        setLockEnabled(false).then(() => setLockEnabledState(false));
      }}
      onCancel={() => setShowDisableLock(false)}
    />

    <ConfirmSheet
      visible={showResyncConfirm}
      title={t("resyncWeddingTitle")}
      message={t("resyncWeddingMsg")}
      confirmLabel={t("resyncWeddingConfirm")}
      onConfirm={handleResync}
      onCancel={() => setShowResyncConfirm(false)}
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
      generate={generateInvite}
    />

    <PaywallSheet
      visible={showPaywall}
      onClose={() => setShowPaywall(false)}
      userId={starfishUserId}
      weddingId={activeEntry?.id}
    />

    {showJoinScanner && (
      <QRScannerScreen
        onScanned={handleJoinScanned}
        onClose={() => setShowJoinScanner(false)}
      />
    )}
    </>
  );
}

