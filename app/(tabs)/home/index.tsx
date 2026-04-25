import React, { useState, useCallback, useEffect } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native-css/components";
import { Alert, Platform, StatusBar as RNStatusBar } from "react-native";
import { useRouter } from "expo-router";
import { Settings, MapPin, AlertTriangle, PieChart, Users, Calendar, Briefcase, Sparkles, ChevronRight, Download, X, Clock, Circle, RefreshCw } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { differenceInDays, format } from "date-fns";
import { getDateLocale, safeFormat } from "@/i18n/dateFnsLocale";
import { useWeddingStore } from "@/store/useWeddingStore";
import { useVendorsStore } from "@/store/useVendorsStore";
import { useGuestsStore, computeCounts } from "@/store/useGuestsStore";
import { usePlanningStore } from "@/store/usePlanningStore";
import { useBudgetSummary } from "@/store/useBudgetStore";
import { useIdeasStore } from "@/store/useIdeasStore";
import { useWeddingRegistryStore } from "@/store/useWeddingRegistryStore";
import { pushRsvpRoster, fetchRsvpInbox, applyRsvpSubmissions } from "@/lib/rsvp-sync";
import { resolveServerConfig } from "@/lib/server";
import { ProgressBar } from "@/components/ProgressBar";
import { formatMoney } from "@/components/MoneyDisplay";
import { TimelineItem } from "@/components/TimelineItem";
import { usePwaInstall } from "@/lib/usePwaInstall";
import { analytics } from "@/lib/analytics";
import { theme as GP } from "@/lib/theme";
import { Display } from "@/components/Display";
import { Script } from "@/components/Script";

export default function HomeScreen() {
  return <DashboardScreen />;
}

function DashboardScreen() {
  const { t } = useTranslation("dashboard");
  const insets = useSafeAreaInsets();
  const topInset = insets.top || RNStatusBar.currentHeight || 0;
  const router = useRouter();
  const wedding = useWeddingStore((s) => s.wedding);
  const vendors = useVendorsStore((s) => s.vendors);
  const guests = useGuestsStore((s) => s.guests);
  const counts = React.useMemo(() => computeCounts(guests), [guests]);
  const tasks = usePlanningStore((s) => s.tasks);
  const overdueTasks = React.useMemo(
    () => tasks.filter((task) => task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "DONE"),
    [tasks]
  );
  const agendaEvents = usePlanningStore((s) => s.agendaEvents);
  const next3Events = React.useMemo(() => {
    const today = format(new Date(), "yyyy-MM-dd");
    return [...agendaEvents]
      .filter((e) => e.date >= today)
      .sort((a, b) => {
        const d = a.date.localeCompare(b.date);
        if (d !== 0) return d;
        return (a.time || "").localeCompare(b.time || "");
      })
      .slice(0, 3);
  }, [agendaEvents]);
  const next3Tasks = React.useMemo(() => {
    return [...tasks]
      .filter((task) => task.status === "TODO")
      .sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      })
      .slice(0, 3);
  }, [tasks]);
  const criticalUnstarted = React.useMemo(
    () => tasks.filter((task) => {
      if (task.priority !== "CRITICAL" || task.status !== "TODO" || !task.dueDate) return false;
      const days = differenceInDays(new Date(task.dueDate), new Date());
      return days >= 0 && days <= 30;
    }),
    [tasks]
  );
  const completionRate = React.useMemo(() => {
    if (tasks.length === 0) return 0;
    const done = tasks.filter((task) => task.status === "DONE").length;
    return Math.round((done / tasks.length) * 100);
  }, [tasks]);
  const budget = useBudgetSummary();
  const ideaCount = useIdeasStore((s) => s.ideas.length);

  const weddingDate = wedding?.weddingDate
    ? new Date(wedding.weddingDate)
    : null;
  const daysUntil = weddingDate
    ? differenceInDays(weddingDate, new Date())
    : null;

  const bookedVendors = vendors.filter((v) => v.status === "BOOKED");

  const urgentDeposits = vendors.filter((v) => {
    if (!v.depositDueDate || v.depositPaid) return false;
    const days = differenceInDays(new Date(v.depositDueDate), new Date());
    return days >= 0 && days <= 7;
  });

  const expiringQuotes = vendors.filter((v) => {
    if (!v.validityDate || v.status === "BOOKED" || v.status === "CANCELLED")
      return false;
    const days = differenceInDays(new Date(v.validityDate), new Date());
    return days >= 0 && days <= 7;
  });

  const hasUrgent =
    urgentDeposits.length > 0 ||
    expiringQuotes.length > 0 ||
    criticalUnstarted.length > 0;

  const { canInstall, install: installPwa, isIosSafari, dismissIosBanner } = usePwaInstall();

  const install = useCallback(() => {
    analytics.capture("pwa_install_clicked");
    installPwa();
  }, [installPwa]);

  useEffect(() => {
    analytics.capture("home_opened", { days_until: daysUntil ?? undefined });
  }, []);

  const registry = useWeddingRegistryStore((s) => s.registry);
  const activeEntry = registry?.weddings.find((w) => w.id === registry.activeWeddingId);
  const syncEnabled = !!activeEntry?.seedPhrase;
  const [syncing, setSyncing] = useState(false);

  const getRsvpConfig = useCallback(
    () => resolveServerConfig(activeEntry),
    [activeEntry?.seedPhrase, activeEntry?.serverUrl],
  );

  const handleRsvpSync = useCallback(async () => {
    analytics.capture("rsvp_sync_triggered");
    setSyncing(true);
    try {
      const config = await getRsvpConfig();
      if (!config) return;
      await pushRsvpRoster(config);
      const submissions = await fetchRsvpInbox(config);
      const count = applyRsvpSubmissions(submissions);
      if (count > 0) {
        Alert.alert(t("syncSuccess", { count }));
      } else {
        Alert.alert(t("syncNone"));
      }
    } catch (e: any) {
      Alert.alert(t("common:error"), e.message);
    } finally {
      setSyncing(false);
    }
  }, [getRsvpConfig, t]);

  return (
    <ScrollView
      className="flex-1 bg-accent-paper"
      showsVerticalScrollIndicator={false}
    >
      {/* Header / Countdown */}
      <View
        className="px-6 pb-10 relative"
        style={{
          paddingTop: topInset + 16,
          backgroundColor: GP.clay,
          borderBottomLeftRadius: 32,
          borderBottomRightRadius: 32,
        }}
      >
        <View className="absolute right-3 z-10" style={{ top: topInset + 8 }} pointerEvents="box-none">
          <Pressable
            onPress={(e) => {
              if (Platform.OS === "web") (e.currentTarget as any)?.blur?.();
              router.push("/(tabs)/settings");
            }}
            className="w-12 h-12 rounded-full bg-white/15 items-center justify-center"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Settings size={22} color="rgba(255,255,255,0.85)" />
          </Pressable>
        </View>
        <Script size={20} color="rgba(255,255,255,0.75)" weight="400">
          {wedding?.partner1Name && wedding?.partner2Name
            ? `${wedding.partner1Name} & ${wedding.partner2Name}`
            : "Fiancé"}
        </Script>
        {daysUntil != null && daysUntil >= 0 ? (
          <View className="mt-3">
            <View className="flex-row items-baseline">
              <Display size={72} weight="300" color="#fff">
                {daysUntil}
              </Display>
              <Text className="text-white/60 text-xl font-medium ml-2">
                {t("days")}
              </Text>
            </View>
            <Text className="text-white/60 text-sm mt-1">
              {weddingDate
                ? format(weddingDate, "EEEE d MMMM yyyy", { locale: getDateLocale() })
                : ""}
            </Text>
          </View>
        ) : daysUntil != null && daysUntil < 0 ? (
          <Display size={32} italic color="#fff" style={{ marginTop: 12 }}>
            {t("congratulations")}
          </Display>
        ) : (
          <Display size={24} italic color="rgba(255,255,255,0.9)" style={{ marginTop: 12 }}>
            {t("setYourDate")}
          </Display>
        )}
        {wedding?.venueName && (
          <View className="flex-row items-center mt-3 bg-white/10 self-start px-3 py-1.5 rounded-full">
            <MapPin size={14} color="rgba(255,255,255,0.8)" />
            <Text className="text-white/80 ml-1.5 text-sm">
              {wedding.venueName}
            </Text>
          </View>
        )}
      </View>

      {/* Quick action strip */}
      <View className="flex-row px-4 gap-2 -mt-5 mb-3">
        <Pressable
          onPress={() => router.push("/(tabs)/guests")}
          className="flex-1 bg-accent-card rounded-2xl py-3 items-center border border-gray-100 dark:border-gray-800 active:opacity-70"
        >
          <Users size={18} color={GP.clay} />
          <Text className="text-xs font-medium text-gray-700 dark:text-gray-300 mt-1">
            {t("quickAddGuest")}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => router.push("/(tabs)/planning")}
          className="flex-1 bg-accent-card rounded-2xl py-3 items-center border border-gray-100 dark:border-gray-800 active:opacity-70"
        >
          <Calendar size={18} color="#F59E0B" />
          <Text className="text-xs font-medium text-gray-700 dark:text-gray-300 mt-1">
            {t("quickAddTask")}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => router.push("/(tabs)/budget")}
          className="flex-1 bg-accent-card rounded-2xl py-3 items-center border border-gray-100 dark:border-gray-800 active:opacity-70"
        >
          <PieChart size={18} color="#10B981" />
          <Text className="text-xs font-medium text-gray-700 dark:text-gray-300 mt-1">
            {t("quickAddExpense")}
          </Text>
        </Pressable>
      </View>

      <View className="px-4">
        {/* Urgent actions */}
        {hasUrgent && (
          <View className="bg-red-50 dark:bg-red-950 rounded-2xl p-4 mb-3 border border-red-100 dark:border-red-900">
            <View className="flex-row items-center mb-2.5">
              <View className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-900 items-center justify-center mr-2">
                <AlertTriangle size={14} color="#EF4444" />
              </View>
              <Text className="text-sm font-semibold text-red-700 dark:text-red-300">
                {t("urgentActions")}
              </Text>
            </View>
            {urgentDeposits.map((v) => (
              <View key={v.id} className="flex-row items-center mb-1.5 ml-8">
                <Text className="text-sm text-red-600 dark:text-red-400 flex-1">
                  {t("deposit", { name: v.name, date: v.depositDueDate ? format(new Date(v.depositDueDate), "dd/MM") : "" })}
                </Text>
              </View>
            ))}
            {expiringQuotes.map((v) => (
              <View key={v.id} className="flex-row items-center mb-1.5 ml-8">
                <Text className="text-sm text-amber-600 dark:text-amber-400 flex-1">
                  {t("quoteExpiring", { name: v.name })}
                </Text>
              </View>
            ))}
            {criticalUnstarted.map((task) => (
              <View key={task.id} className="flex-row items-center mb-1.5 ml-8">
                <Text className="text-sm text-red-600 dark:text-red-400 flex-1">
                  {task.title}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* PWA install banner — Chromium browsers */}
        {canInstall && (
          <Pressable
            onPress={install}
            className="bg-accent-card rounded-2xl px-4 py-3 mb-3 border border-gray-100 dark:border-gray-800 flex-row items-center active:opacity-70"
          >
            <View className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900 items-center justify-center mr-3">
              <Download size={20} color={GP.clay} />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-semibold text-gray-900 dark:text-white">{t("installApp")}</Text>
              <Text className="text-xs text-gray-400 mt-0.5">{t("installAppDesc")}</Text>
            </View>
            <ChevronRight size={18} color="#C0C0C8" />
          </Pressable>
        )}

        {/* PWA install banner — iOS Safari */}
        {isIosSafari && (
          <View className="bg-accent-card rounded-2xl px-4 py-3 mb-3 border border-gray-100 dark:border-gray-800 flex-row items-center">
            <View className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900 items-center justify-center mr-3">
              <Download size={20} color={GP.clay} />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-semibold text-gray-900 dark:text-white">{t("installApp")}</Text>
              <Text className="text-xs text-gray-400 mt-0.5">{t("installIosSteps")}</Text>
            </View>
            <Pressable onPress={dismissIosBanner} className="p-1">
              <X size={18} color="#C0C0C8" />
            </Pressable>
          </View>
        )}

        {/* Budget summary card */}
        <Pressable
          onPress={() => router.push("/(tabs)/budget")}
          className="bg-accent-card rounded-2xl p-4 mb-3 border border-gray-100 dark:border-gray-800"
        >
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-accent-sage-light dark:bg-emerald-900 items-center justify-center mr-2.5">
                <PieChart size={16} color="#7B9A7B" />
              </View>
              <Text className="text-base font-semibold text-gray-900 dark:text-white">
                {t("budget")}
              </Text>
            </View>
            <Text className="text-xs text-gray-400">
              {t("booked", { count: bookedVendors.length })}
            </Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-sm text-gray-400">{t("committed")}</Text>
            <Text className="text-sm font-semibold text-gray-900 dark:text-white">
              {formatMoney(budget.totalEngaged)} /{" "}
              {formatMoney(budget.budgetTarget)}
            </Text>
          </View>
          <ProgressBar
            value={budget.totalEngaged}
            max={budget.budgetTarget}
            colorScheme="budget"
            showPercentage={false}
          />
          {budget.remaining < 0 && (
            <Text className="text-xs text-red-500 mt-2 font-medium">
              {t("overBudget", { amount: formatMoney(Math.abs(budget.remaining)) })}
            </Text>
          )}
        </Pressable>

        {/* Guests + Planning row */}
        <View className="flex-row gap-3 mb-3">
          <Pressable
            onPress={() => router.push("/(tabs)/guests")}
            className="flex-1 bg-accent-card rounded-2xl p-4 border border-gray-100 dark:border-gray-800"
          >
            <View className="flex-row items-center mb-3">
              <View className="w-8 h-8 rounded-full bg-accent-blush dark:bg-primary-900 items-center justify-center mr-2.5">
                <Users size={16} color="#b96a4a" />
              </View>
              <Text className="text-sm font-semibold text-gray-900 dark:text-white">
                {t("guests")}
              </Text>
            </View>
            <Display size={36} weight="400">
              {counts.accepted}
              <Text style={{ fontSize: 18, color: "#D1D5DB", fontFamily: "Inter_400Regular" }}>/{counts.total}</Text>
            </Display>
            <Text className="text-xs text-gray-400 mt-1">{t("confirmed")}</Text>
            {counts.no_table_count > 0 && (
              <View className="mt-2 bg-amber-50 dark:bg-amber-900 px-2 py-1 rounded-lg self-start">
                <Text className="text-xs text-amber-600 dark:text-amber-300 font-medium">
                  {t("noTable", { count: counts.no_table_count })}
                </Text>
              </View>
            )}
          </Pressable>
          <Pressable
            onPress={() => router.push("/(tabs)/planning")}
            className="flex-1 bg-accent-card rounded-2xl p-4 border border-gray-100 dark:border-gray-800"
          >
            <View className="flex-row items-center mb-3">
              <View className="w-8 h-8 rounded-full bg-accent-gold-light dark:bg-amber-900 items-center justify-center mr-2.5">
                <Calendar size={16} color="#C9956B" />
              </View>
              <Text className="text-sm font-semibold text-gray-900 dark:text-white">
                {t("planning")}
              </Text>
            </View>
            <Display size={36} weight="400">
              {completionRate}
              <Text style={{ fontSize: 18, color: "#D1D5DB", fontFamily: "Inter_400Regular" }}>%</Text>
            </Display>
            <Text className="text-xs text-gray-400 mt-1">{t("completed")}</Text>
            {overdueTasks.length > 0 && (
              <View className="mt-2 bg-red-50 dark:bg-red-900 px-2 py-1 rounded-lg self-start">
                <Text className="text-xs text-red-500 dark:text-red-300 font-medium">
                  {t("overdue", { count: overdueTasks.length })}
                </Text>
              </View>
            )}
          </Pressable>
        </View>

        {/* RSVP sync */}
        {syncEnabled && (
          <Pressable
            onPress={handleRsvpSync}
            disabled={syncing}
            className="bg-accent-card rounded-2xl px-4 py-3 mb-3 border border-gray-100 dark:border-gray-800 flex-row items-center active:opacity-70"
          >
            <View className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900 items-center justify-center mr-3">
              {syncing ? (
                <ActivityIndicator size="small" color="#3B82F6" />
              ) : (
                <RefreshCw size={16} color="#3B82F6" />
              )}
            </View>
            <View className="flex-1">
              <Text className="text-sm font-semibold text-gray-900 dark:text-white">
                {t("rsvpSyncButton")}
              </Text>
              <Text className="text-xs text-gray-400 leading-4 mt-0.5">
                {t("rsvpSyncDesc")}
              </Text>
            </View>
            <ChevronRight size={16} color="#C0C0C8" />
          </Pressable>
        )}

        {/* Vendors summary */}
        <Pressable
          onPress={() => router.push("/(tabs)/vendors")}
          className="bg-accent-card rounded-2xl p-4 mb-3 border border-gray-100 dark:border-gray-800"
        >
          <View className="flex-row items-center mb-3">
            <View className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 items-center justify-center mr-2.5">
              <Briefcase size={16} color={GP.clay} />
            </View>
            <Text className="text-base font-semibold text-gray-900 dark:text-white">
              {t("vendors")}
            </Text>
          </View>
          <View className="flex-row">
            <StatPill
              value={vendors.filter((v) => v.status === "BOOKED").length}
              label={t("statusBooked")}
              color="#10B981"
            />
            <StatPill
              value={vendors.filter((v) => v.status === "NEGOTIATING").length}
              label={t("statusNegotiating")}
              color="#F59E0B"
            />
            <StatPill
              value={vendors.filter((v) => v.status === "QUOTE_RECEIVED").length}
              label={t("statusQuote")}
              color="#3B82F6"
            />
            <StatPill
              value={vendors.filter((v) => v.status === "PROSPECT").length}
              label={t("statusProspect")}
              color="#9CA3AF"
            />
          </View>
        </Pressable>

        {/* Inspirations */}
        <Pressable
          onPress={() => router.push("/(tabs)/ideas")}
          className="bg-accent-card rounded-2xl px-4 py-3 mb-3 border border-gray-100 dark:border-gray-800 flex-row items-center active:opacity-70"
        >
          <View className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900 items-center justify-center mr-3">
            <Sparkles size={20} color="#A855F7" />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-semibold text-gray-900 dark:text-white">{t("myInspirations")}</Text>
            <Text className="text-xs text-gray-400 mt-0.5">{t("idea", { count: ideaCount })}</Text>
          </View>
          <ChevronRight size={18} color="#C0C0C8" />
        </Pressable>

        {/* Next appointments */}
        <Pressable
          onPress={() => router.push({ pathname: "/(tabs)/planning", params: { aspect: "agenda" } })}
          className="bg-accent-card rounded-2xl p-4 mb-3 border border-gray-100 dark:border-gray-800"
        >
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 items-center justify-center mr-2.5">
                <Calendar size={16} color={GP.clay} />
              </View>
              <Text className="text-base font-semibold text-gray-900 dark:text-white">
                {t("nextAppointments")}
              </Text>
            </View>
            <ChevronRight size={18} color="#C0C0C8" />
          </View>
          {next3Events.length > 0 ? (
            <View className="gap-3">
              {next3Events.map((event) => (
                <TimelineItem
                  key={event.id}
                  left={
                    <>
                      <Display size={20} weight="500" color="#b96a4a">
                        {safeFormat(new Date(event.date + "T00:00:00"), "dd")}
                      </Display>
                      <Text className="text-xs text-gray-400 capitalize">
                        {safeFormat(new Date(event.date + "T00:00:00"), "EEE", { locale: getDateLocale() })}
                      </Text>
                    </>
                  }
                >
                  <Text className="text-base font-medium text-gray-900 dark:text-white">
                    {event.title}
                  </Text>
                  <View className="flex-row items-center gap-3 mt-1 flex-wrap">
                    {event.time && (
                      <View className="flex-row items-center gap-1">
                        <Clock size={12} color="#9CA3AF" />
                        <Text className="text-xs text-gray-400">
                          {event.time}
                          {event.endTime ? ` - ${event.endTime}` : ""}
                        </Text>
                      </View>
                    )}
                    {event.location && (
                      <View className="flex-row items-center gap-1">
                        <MapPin size={12} color="#9CA3AF" />
                        <Text className="text-xs text-gray-400" numberOfLines={1}>
                          {event.location}
                        </Text>
                      </View>
                    )}
                  </View>
                </TimelineItem>
              ))}
            </View>
          ) : (
            <Text className="text-sm text-gray-400">
              {t("noUpcomingAppointment")}
            </Text>
          )}
        </Pressable>

        {/* Next tasks */}
        <Pressable
          onPress={() => router.push("/(tabs)/planning")}
          className="bg-accent-card rounded-2xl p-4 mb-3 border border-gray-100 dark:border-gray-800"
        >
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-accent-gold-light dark:bg-amber-900 items-center justify-center mr-2.5">
                <Circle size={16} color="#C9956B" />
              </View>
              <Text className="text-base font-semibold text-gray-900 dark:text-white">
                {t("nextTasks")}
              </Text>
            </View>
            <ChevronRight size={18} color="#C0C0C8" />
          </View>
          {next3Tasks.length > 0 ? (
            <View className="gap-2.5">
              {next3Tasks.map((task) => (
                <View key={task.id} className="flex-row items-center">
                  <Circle size={16} color="#D1D5DB" />
                  <View className="flex-1 ml-3">
                    <Text className="text-sm font-medium text-gray-900 dark:text-white" numberOfLines={1}>
                      {task.title}
                    </Text>
                    {task.dueDate && (
                      <Text className="text-xs text-gray-400 mt-0.5">
                        {safeFormat(new Date(task.dueDate + "T00:00:00"), "d MMM", { locale: getDateLocale() })}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <Text className="text-sm text-gray-400">
              {t("noUpcomingTask")}
            </Text>
          )}
        </Pressable>
      </View>

      <View className="h-6" />
    </ScrollView>
  );
}

function StatPill({
  value,
  label,
  color,
}: {
  value: number;
  label: string;
  color: string;
}) {
  return (
    <View className="flex-1 items-center">
      <Display size={22} weight="500" color={color}>
        {value}
      </Display>
      <Text className="text-[11px] text-gray-400 mt-0.5">{label}</Text>
    </View>
  );
}
