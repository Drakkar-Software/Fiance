import React, { useCallback, useEffect } from "react";
import { View, Text, ScrollView, Pressable } from "react-native-css/components";
import { Platform, StatusBar as RNStatusBar } from "react-native";
import { useRouter } from "expo-router";
import { Settings, MapPin, AlertTriangle, Briefcase, Sparkles, ChevronRight, Download, X, Clock, Circle } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { differenceInDays, format } from "date-fns";
import { getDateLocale, safeFormat } from "@/i18n/dateFnsLocale";
import { useWeddingStore } from "@/store/useWeddingStore";
import { useWeddingEventsStore } from "@/store/useWeddingEventsStore";
import { useVendorsStore } from "@/store/useVendorsStore";
import { useGuestsStore, computeCounts } from "@/store/useGuestsStore";
import { usePlanningStore } from "@/store/usePlanningStore";
import { useBudgetSummary } from "@/store/useBudgetStore";
import { useIdeasStore } from "@/store/useIdeasStore";
import { formatMoney } from "@/components/MoneyDisplay";
import { TimelineItem } from "@/components/TimelineItem";
import { usePwaInstall } from "@/lib/usePwaInstall";
import { analytics } from "@/lib/analytics";
import { theme as GP } from "@/lib/theme";
import { Display } from "@/components/Display";
import { Script } from "@/components/Script";
import { Label } from "@/components/Label";
import { Sprig } from "@/components/Sprig";
import { PageHeader } from "@/components/PageHeader";
import { useIsWideScreen } from "@/lib/useIsWideScreen";
import { useSyncStatusDot } from "@/lib/useSyncStatusDot";
import { getPrimaryEvent } from "@fiance/sdk";

export default function HomeScreen() {
  return <DashboardScreen />;
}

function DashboardScreen() {
  const { t } = useTranslation("dashboard");
  const insets = useSafeAreaInsets();
  const topInset = insets.top || RNStatusBar.currentHeight || 0;
  const router = useRouter();
  const isWide = useIsWideScreen();
  const syncDotColor = useSyncStatusDot();
  const wedding = useWeddingStore((s) => s.wedding);
  const weddingEvents = useWeddingEventsStore((s) => s.weddingEvents);
  const primaryEvent = React.useMemo(() => getPrimaryEvent(weddingEvents), [weddingEvents]);
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
    () =>
      tasks.filter((task) => {
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

  const countdownDateStr = primaryEvent?.date ?? wedding?.weddingDate;
  const weddingDate = countdownDateStr ? new Date(countdownDateStr) : null;
  const daysUntil = weddingDate ? differenceInDays(weddingDate, new Date()) : null;

  const urgentDeposits = vendors.filter((v) => {
    if (!v.depositDueDate || v.depositPaid) return false;
    const days = differenceInDays(new Date(v.depositDueDate), new Date());
    return days >= 0 && days <= 7;
  });
  const expiringQuotes = vendors.filter((v) => {
    if (!v.validityDate || v.status === "BOOKED" || v.status === "CANCELLED") return false;
    const days = differenceInDays(new Date(v.validityDate), new Date());
    return days >= 0 && days <= 7;
  });
  const hasUrgent =
    urgentDeposits.length > 0 || expiringQuotes.length > 0 || criticalUnstarted.length > 0;

  const { canInstall, install: installPwa, isIosSafari, dismissIosBanner } = usePwaInstall();
  const install = useCallback(() => {
    analytics.capture("pwa_install_clicked");
    installPwa();
  }, [installPwa]);

  useEffect(() => {
    analytics.capture("home_opened", { days_until: daysUntil ?? undefined });
    if (daysUntil === 0) {
      router.replace("/(tabs)/home/wedding-day");
    }
  }, [daysUntil]);

  const coupleNames = [wedding?.partner1Name, wedding?.partner2Name].filter(Boolean).join(" & ");

  const guestPct =
    counts.total > 0 ? Math.min(Math.round((counts.accepted / counts.total) * 100), 100) : 0;
  const budgetPct =
    budget.budgetTarget > 0
      ? Math.min(Math.round((budget.totalEngaged / budget.budgetTarget) * 100), 100)
      : 0;
  const budgetOverflow = budget.remaining < 0;

  return (
    <ScrollView
      className="flex-1 bg-accent-paper"
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior="never"
    >
      {/* ── Hero ── */}
      <View
        className="px-6 pb-10 relative"
        style={{
          paddingTop: topInset + 16,
          backgroundColor: GP.clay,
          borderBottomLeftRadius: 32,
          borderBottomRightRadius: 32,
        }}
      >
        {!isWide && (
          <View className="absolute right-3 z-10" style={{ top: topInset + 8 }} pointerEvents="box-none">
            <Pressable
              onPress={(e) => {
                if (Platform.OS === "web") (e.currentTarget as any)?.blur?.();
                router.push("/settings");
              }}
              className="w-12 h-12 rounded-full bg-white/15 items-center justify-center"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <View style={{ width: 22, height: 22 }}>
                <Settings size={22} color="rgba(255,255,255,0.85)" />
                {syncDotColor && (
                  <View
                    style={{
                      position: "absolute",
                      top: -2,
                      right: -2,
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: syncDotColor,
                      borderWidth: 1.5,
                      borderColor: "rgba(255,255,255,0.3)",
                    }}
                  />
                )}
              </View>
            </Pressable>
          </View>
        )}
        <View
          style={{ position: "absolute", top: topInset + 14, right: 58, opacity: 0.4, pointerEvents: "none" }}
        >
          <Sprig size={22} color="#fff" angle={16} />
        </View>

        {coupleNames ? (
          <Script size={19} color="rgba(255,255,255,0.8)" style={{ marginBottom: 2 }}>
            {coupleNames}
          </Script>
        ) : null}

        {daysUntil != null && daysUntil >= 0 ? (
          <>
            <PageHeader
              eyebrow={t("common:homeEyebrow")}
              title={daysUntil}
              tagline={t("common:homeTagline")}
              taglineColor="rgba(255,255,255,0.75)"
              eyebrowColor="rgba(255,255,255,0.6)"
              titleColor="#fff"
              titleSize={72}
              style={{ paddingHorizontal: 0, paddingTop: 0 }}
            />
            <Text className="text-white/60 text-sm mt-1">
              {weddingDate
                ? format(weddingDate, "EEEE d MMMM yyyy", { locale: getDateLocale() })
                : ""}
            </Text>
          </>
        ) : daysUntil != null && daysUntil < 0 ? (
          <>
            <Label color="rgba(255,255,255,0.6)" style={{ marginBottom: 4 }}>
              {t("common:tabs.home")}
            </Label>
            <Display size={32} italic color="#fff" style={{ marginTop: 12 }}>
              {t("congratulations")}
            </Display>
          </>
        ) : (
          <>
            <Label color="rgba(255,255,255,0.6)" style={{ marginBottom: 4 }}>
              {t("common:tabs.home")}
            </Label>
            <Display size={24} italic color="rgba(255,255,255,0.9)" style={{ marginTop: 12 }}>
              {t("setYourDate")}
            </Display>
          </>
        )}

        {wedding?.venueName && (
          <View className="flex-row items-center mt-3 bg-white/10 self-start px-3 py-1.5 rounded-full">
            <MapPin size={14} color="rgba(255,255,255,0.8)" />
            <Text className="text-white/80 ml-1.5 text-sm">{wedding.venueName}</Text>
          </View>
        )}
      </View>

      {/* ── Content — overlaps hero by 20px ── */}
      <View className="px-4 -mt-5">
        {/* Urgent actions */}
        {hasUrgent && (
          <View
            className="rounded-2xl p-4 mb-3 border"
            style={{ backgroundColor: GP.claySoft, borderColor: `${GP.clay}33` }}
          >
            <View className="flex-row items-center mb-2.5">
              <View
                className="w-6 h-6 rounded-full items-center justify-center mr-2"
                style={{ backgroundColor: `${GP.clay}22` }}
              >
                <AlertTriangle size={14} color={GP.clay} />
              </View>
              <Text className="text-sm font-semibold" style={{ color: GP.clay }}>
                {t("urgentActions")}
              </Text>
            </View>
            {urgentDeposits.map((v) => (
              <View key={v.id} className="flex-row items-center mb-1.5 ml-8">
                <Text className="text-sm flex-1" style={{ color: GP.inkSoft }}>
                  {t("deposit", {
                    name: v.name,
                    date: v.depositDueDate ? format(new Date(v.depositDueDate), "dd/MM") : "",
                  })}
                </Text>
              </View>
            ))}
            {expiringQuotes.map((v) => (
              <View key={v.id} className="flex-row items-center mb-1.5 ml-8">
                <Text className="text-sm flex-1" style={{ color: GP.mustard }}>
                  {t("quoteExpiring", { name: v.name })}
                </Text>
              </View>
            ))}
            {criticalUnstarted.map((task) => (
              <View key={task.id} className="flex-row items-center mb-1.5 ml-8">
                <Text className="text-sm flex-1" style={{ color: GP.inkSoft }}>
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
            className="bg-accent-card rounded-2xl px-4 py-3 mb-3 border border-hair flex-row items-center active:opacity-70"
          >
            <View className="w-10 h-10 rounded-xl bg-accent-clay-soft items-center justify-center mr-3">
              <Download size={20} color={GP.clay} />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-semibold text-ink">{t("installApp")}</Text>
              <Text className="text-xs text-mute mt-0.5">{t("installAppDesc")}</Text>
            </View>
            <ChevronRight size={18} color={GP.mute} />
          </Pressable>
        )}

        {/* PWA install banner — iOS Safari */}
        {isIosSafari && (
          <View className="bg-accent-card rounded-2xl px-4 py-3 mb-3 border border-hair flex-row items-center">
            <View className="w-10 h-10 rounded-xl bg-accent-clay-soft items-center justify-center mr-3">
              <Download size={20} color={GP.clay} />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-semibold text-ink">{t("installApp")}</Text>
              <Text className="text-xs text-mute mt-0.5">{t("installIosSteps")}</Text>
            </View>
            <Pressable onPress={dismissIosBanner} className="p-1">
              <X size={18} color={GP.mute} />
            </Pressable>
          </View>
        )}

        {/* Progression: Invités · Budget · Tâches */}
        <View className="bg-accent-card rounded-2xl p-4 mb-3 border border-hair">
          <Label style={{ marginBottom: 12 }}>{t("progress")}</Label>
          <View className="flex-row">
            {/* Invités */}
            <Pressable
              onPress={() => router.push("/(tabs)/guests")}
              className="flex-1 active:opacity-70"
              style={{ paddingRight: 12 }}
            >
              <Label color={GP.olive} style={{ marginBottom: 6 }}>
                {t("guests")}
              </Label>
              <Display size={24} weight="500" color={GP.ink}>
                {counts.accepted}
                <Text style={{ fontSize: 14, color: GP.mute, fontFamily: "Inter_400Regular" }}>
                  /{counts.total}
                </Text>
              </Display>
              <View
                style={{
                  height: 4,
                  backgroundColor: GP.hair,
                  borderRadius: 2,
                  marginTop: 8,
                  overflow: "hidden",
                }}
              >
                <View
                  style={{
                    width: `${guestPct}%`,
                    height: "100%",
                    backgroundColor: GP.olive,
                    borderRadius: 2,
                  }}
                />
              </View>
              {counts.no_table_count > 0 && (
                <Text className="text-[10px] font-medium mt-1.5" style={{ color: GP.mustard }}>
                  {t("noTable", { count: counts.no_table_count })}
                </Text>
              )}
            </Pressable>

            <View style={{ width: 1, backgroundColor: GP.hair }} />

            {/* Budget */}
            <Pressable
              onPress={() => router.push("/(tabs)/budget")}
              className="flex-1 active:opacity-70"
              style={{ paddingHorizontal: 12 }}
            >
              <Label color={GP.mustard} style={{ marginBottom: 6 }}>
                {t("budget")}
              </Label>
              <Display size={24} weight="500" color={GP.ink}>
                {budgetPct}
                <Text style={{ fontSize: 14, color: GP.mute, fontFamily: "Inter_400Regular" }}>%</Text>
              </Display>
              <View
                style={{
                  height: 4,
                  backgroundColor: GP.hair,
                  borderRadius: 2,
                  marginTop: 8,
                  overflow: "hidden",
                }}
              >
                <View
                  style={{
                    width: `${budgetPct}%`,
                    height: "100%",
                    backgroundColor: budgetOverflow ? GP.clay : GP.mustard,
                    borderRadius: 2,
                  }}
                />
              </View>
              {budgetOverflow ? (
                <Text className="text-[10px] font-medium mt-1.5" style={{ color: GP.clay }}>
                  {t("overBudget", { amount: formatMoney(Math.abs(budget.remaining)) })}
                </Text>
              ) : (
                <Text className="text-[10px] mt-1.5" style={{ color: GP.mute }} numberOfLines={1}>
                  {formatMoney(budget.totalEngaged)} / {formatMoney(budget.budgetTarget)}
                </Text>
              )}
            </Pressable>

            <View style={{ width: 1, backgroundColor: GP.hair }} />

            {/* Tâches */}
            <Pressable
              onPress={() => router.push("/(tabs)/planning")}
              className="flex-1 active:opacity-70"
              style={{ paddingLeft: 12 }}
            >
              <Label color={GP.clay} style={{ marginBottom: 6 }}>
                {t("planning")}
              </Label>
              <Display size={24} weight="500" color={GP.ink}>
                {completionRate}
                <Text style={{ fontSize: 14, color: GP.mute, fontFamily: "Inter_400Regular" }}>%</Text>
              </Display>
              <View
                style={{
                  height: 4,
                  backgroundColor: GP.hair,
                  borderRadius: 2,
                  marginTop: 8,
                  overflow: "hidden",
                }}
              >
                <View
                  style={{
                    width: `${completionRate}%`,
                    height: "100%",
                    backgroundColor: GP.clay,
                    borderRadius: 2,
                  }}
                />
              </View>
              {overdueTasks.length > 0 && (
                <Text className="text-[10px] font-medium mt-1.5" style={{ color: GP.clay }}>
                  {t("overdue", { count: overdueTasks.length })}
                </Text>
              )}
            </Pressable>
          </View>
        </View>

        {/* À venir: appointments + tasks merged */}
        <Pressable
          onPress={() => router.push("/(tabs)/planning/agenda")}
          className="bg-accent-card rounded-2xl p-4 mb-3 border border-hair"
        >
          <View className="flex-row items-center justify-between mb-3">
            <Label>{t("upcoming")}</Label>
            <ChevronRight size={16} color={GP.mute} />
          </View>
          {next3Events.length === 0 && next3Tasks.length === 0 ? (
            <Text className="text-sm text-mute">{t("nothingUpcoming")}</Text>
          ) : (
            <>
              {next3Events.length > 0 && (
                <View className="gap-3">
                  {next3Events.map((event) => (
                    <TimelineItem
                      key={event.id}
                      left={
                        <>
                          <Display size={20} weight="500" color={GP.clay}>
                            {safeFormat(new Date(event.date + "T00:00:00"), "dd")}
                          </Display>
                          <Text className="text-xs text-mute capitalize">
                            {safeFormat(new Date(event.date + "T00:00:00"), "EEE", {
                              locale: getDateLocale(),
                            })}
                          </Text>
                        </>
                      }
                    >
                      <Text className="text-sm font-medium text-ink">{event.title}</Text>
                      <View className="flex-row items-center gap-3 mt-0.5 flex-wrap">
                        {event.time && (
                          <View className="flex-row items-center gap-1">
                            <Clock size={11} color={GP.mute} />
                            <Text className="text-xs text-mute">
                              {event.time}
                              {event.endTime ? ` - ${event.endTime}` : ""}
                            </Text>
                          </View>
                        )}
                        {event.location && (
                          <View className="flex-row items-center gap-1">
                            <MapPin size={11} color={GP.mute} />
                            <Text className="text-xs text-mute" numberOfLines={1}>
                              {event.location}
                            </Text>
                          </View>
                        )}
                      </View>
                    </TimelineItem>
                  ))}
                </View>
              )}
              {next3Events.length > 0 && next3Tasks.length > 0 && (
                <View style={{ height: 1, backgroundColor: GP.hair, marginVertical: 12 }} />
              )}
              {next3Tasks.length > 0 && (
                <View className="gap-2.5">
                  {next3Tasks.map((task) => (
                    <View key={task.id} className="flex-row items-center">
                      <Circle size={14} color={GP.mute} />
                      <View className="flex-1 ml-3">
                        <Text className="text-sm text-ink" numberOfLines={1}>
                          {task.title}
                        </Text>
                        {task.dueDate && (
                          <Text className="text-xs text-mute mt-0.5">
                            {safeFormat(new Date(task.dueDate + "T00:00:00"), "d MMM", {
                              locale: getDateLocale(),
                            })}
                          </Text>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </>
          )}
        </Pressable>

        {/* Prestataires */}
        <Pressable
          onPress={() => router.push("/(tabs)/vendors")}
          className="bg-accent-card rounded-2xl p-4 mb-3 border border-hair"
        >
          <View className="flex-row items-center mb-3">
            <View className="w-7 h-7 rounded-full bg-accent-clay-soft items-center justify-center mr-2.5">
              <Briefcase size={14} color={GP.clay} />
            </View>
            <Text className="text-sm font-semibold text-ink flex-1">{t("vendors")}</Text>
            <ChevronRight size={16} color={GP.mute} />
          </View>
          <View className="flex-row">
            <StatPill
              value={vendors.filter((v) => v.status === "BOOKED").length}
              label={t("statusBooked")}
              color={GP.olive}
            />
            <StatPill
              value={vendors.filter((v) => v.status === "NEGOTIATING").length}
              label={t("statusNegotiating")}
              color={GP.mustard}
            />
            <StatPill
              value={vendors.filter((v) => v.status === "QUOTE_RECEIVED").length}
              label={t("statusQuote")}
              color={GP.blue}
            />
            <StatPill
              value={vendors.filter((v) => v.status === "PROSPECT").length}
              label={t("statusProspect")}
              color={GP.mute}
            />
          </View>
        </Pressable>

        {/* Inspirations */}
        <Pressable
          onPress={() => router.push("/ideas")}
          className="bg-accent-card rounded-2xl px-4 py-3 mb-3 border border-hair flex-row items-center active:opacity-70"
        >
          <View className="w-8 h-8 rounded-full bg-accent-mustard-soft items-center justify-center mr-3">
            <Sparkles size={16} color={GP.mustard} />
          </View>
          <Text className="text-sm font-semibold text-ink flex-1">{t("myInspirations")}</Text>
          <Text className="text-xs text-mute mr-2">{t("idea", { count: ideaCount })}</Text>
          <ChevronRight size={16} color={GP.mute} />
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
      <Text className="text-[11px] text-mute mt-0.5">{label}</Text>
    </View>
  );
}
