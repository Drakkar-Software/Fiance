import React, { useState, useMemo, useCallback } from "react";
import { View, Text, ScrollView, Pressable } from "react-native-css/components";
import { Alert, Share } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  List, LayoutGrid, Calendar, CheckCircle2, Circle, Sparkles,
  Clock, MapPin, User, Share2,
} from "lucide-react-native";
import { isBefore } from "date-fns";
import { getDateLocale, safeFormat } from "@/i18n/dateFnsLocale";
import { usePlanningStore } from "@/store/usePlanningStore";
import { useWeddingStore } from "@/store/useWeddingStore";
import { useVendorsStore } from "@/store/useVendorsStore";
import { TASK_STATUS_LABELS } from "@/db/types";
import type { TaskStatus, Priority, PlanningAspect } from "@/db/types";
import { PLANNING_ASPECT_LABELS } from "@/db/types";
import { FilterTabs } from "@/components/FilterTabs";
import { DeadlineChip } from "@/components/DeadlineChip";
import { PriorityBadge } from "@/components/PriorityBadge";
import { ProgressBar } from "@/components/ProgressBar";
import { FAB } from "@/components/FAB";
import { CollapsibleSection } from "@/components/CollapsibleSection";
import { SegmentedControl } from "@/components/SegmentedControl";
import { SectionHeader } from "@/components/SectionHeader";
import { Label } from "@/components/Label";
import { Display } from "@/components/Display";
import { TimelineItem } from "@/components/TimelineItem";
import {
  generateDefaultCategories,
  generateTemplateTasks,
  TEMPLATE_TASK_COUNT,
  TEMPLATE_CATEGORY_COUNT,
} from "@/lib/planning";
import { useWeddingRegistryStore } from "@/store/useWeddingRegistryStore";
import { buildWeddingPageUrl } from "@/lib/identity";
import { deriveUserId } from "@/lib/server";
import { analytics } from "@/lib/analytics";

type ViewMode = "timeline" | "kanban";
type FilterKey = "ALL" | "TODO" | "DONE" | "OVERDUE";

const ASPECTS: PlanningAspect[] = ["preparation", "agenda", "day-of"];

export default function PlanningScreen() {
  const { t } = useTranslation("planning");
  const router = useRouter();
  const params = useLocalSearchParams<{ aspect?: string }>();
  const initialAspect = ASPECTS.includes(params.aspect as PlanningAspect)
    ? (params.aspect as PlanningAspect)
    : "preparation";
  const [aspect, setAspect] = useState<PlanningAspect>(initialAspect);

  React.useEffect(() => {
    if (ASPECTS.includes(params.aspect as PlanningAspect)) {
      setAspect(params.aspect as PlanningAspect);
    }
  }, [params.aspect]);

  return (
    <View className="flex-1 bg-accent-paper">
      <SegmentedControl
        segments={ASPECTS.map((a) => ({ key: a, label: t(PLANNING_ASPECT_LABELS[a]) }))}
        activeKey={aspect}
        onSelect={(key) => setAspect(key as PlanningAspect)}
      />

      {aspect === "preparation" && <PreparationView />}
      {aspect === "agenda" && <AgendaView />}
      {aspect === "day-of" && <DayOfView />}
    </View>
  );
}

// ─── Préparatifs View ────────────────────────────────────────────────────

function PreparationView() {
  const { t } = useTranslation("planning");
  const router = useRouter();
  const tasks = usePlanningStore((s) => s.tasks);
  const categories = usePlanningStore((s) => s.categories);
  const setTasks = usePlanningStore((s) => s.setTasks);
  const setCategories = usePlanningStore((s) => s.setCategories);
  const updateTask = usePlanningStore((s) => s.updateTask);
  const weddingDate = useWeddingStore((s) => s.wedding?.weddingDate);
  const vendors = useVendorsStore((s) => s.vendors);

  const [viewMode, setViewMode] = useState<ViewMode>("timeline");
  const [filter, setFilter] = useState<FilterKey>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const now = new Date();

  const handleGenerateTemplate = useCallback(() => {
    const doGenerate = () => {
      let cats = categories;
      if (cats.length === 0) {
        cats = generateDefaultCategories();
        setCategories(cats);
      }
      const templateTasks = generateTemplateTasks(cats, weddingDate || undefined);
      setTasks([...tasks, ...templateTasks]);
      analytics.capture("planning_template_generated");
      Alert.alert(t("planningGenerated"), t("planningGeneratedMsg"));
    };

    if (tasks.length > 0) {
      Alert.alert(
        t("existingPlanning"),
        t("existingPlanningMsg"),
        [
          { text: t("common:cancel"), style: "cancel" },
          { text: t("common:add"), onPress: doGenerate },
        ]
      );
    } else {
      Alert.alert(
        t("confirmGenerate"),
        t("confirmGenerateMsg", { taskCount: TEMPLATE_TASK_COUNT, categoryCount: TEMPLATE_CATEGORY_COUNT }),
        [
          { text: t("common:cancel"), style: "cancel" },
          { text: t("common:confirm"), onPress: doGenerate },
        ]
      );
    }
  }, [categories, tasks, weddingDate]);

  const completionRate = useMemo(() => {
    if (tasks.length === 0) return 0;
    const done = tasks.filter((task) => task.status === "DONE").length;
    return Math.round((done / tasks.length) * 100);
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        if (filter === "OVERDUE") {
          return (
            task.dueDate &&
            isBefore(new Date(task.dueDate), now) &&
            task.status !== "DONE"
          );
        }
        if (filter !== "ALL" && task.status !== filter) return false;
        if (categoryFilter !== "ALL" && task.categoryId !== categoryFilter)
          return false;
        return true;
      })
      .sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });
  }, [tasks, filter, categoryFilter]);

  const groupedByMonth = useMemo(() => {
    const groups: Record<string, typeof filteredTasks> = {};
    filteredTasks.forEach((task) => {
      const key = task.dueDate
        ? safeFormat(new Date(task.dueDate), "MMMM yyyy", { locale: getDateLocale() })
        : t("common:noDate");
      if (!groups[key]) groups[key] = [];
      groups[key].push(task);
    });
    return groups;
  }, [filteredTasks]);

  const overdue = tasks.filter(
    (task) =>
      task.dueDate &&
      isBefore(new Date(task.dueDate), now) &&
      task.status !== "DONE"
  );

  const filterTabs = [
    { key: "ALL", label: t("allFilter") },
    { key: "TODO", label: t("todo") },
    { key: "DONE", label: t("done") },
    { key: "OVERDUE", label: t("overdue", { count: overdue.length }) },
  ];

  const toggleDone = (taskId: string, currentStatus: string) => {
    if (currentStatus === "DONE") {
      updateTask(taskId, { status: "TODO", completedAt: null });
    } else {
      updateTask(taskId, { status: "DONE", completedAt: new Date().toISOString() });
      analytics.capture("task_completed");
    }
  };

  return (
    <View className="flex-1">
      <SectionHeader
        title={t("progress")}
        right={
          <View className="flex-row items-center gap-2">
            <Pressable
              onPress={handleGenerateTemplate}
              className="flex-row items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary-50 dark:bg-primary-900 active:opacity-80"
            >
              <Sparkles size={14} color="#b96a4a" />
              <Text className="text-xs font-medium text-primary-500">{t("generate")}</Text>
            </Pressable>
            <View className="flex-row bg-accent-paper rounded-lg p-0.5">
              <Pressable
                onPress={() => setViewMode("timeline")}
                className={`px-3 py-1.5 rounded-md ${
                  viewMode === "timeline" ? "bg-accent-card" : ""
                }`}
              >
                <List size={16} color={viewMode === "timeline" ? "#b96a4a" : "#9CA3AF"} />
              </Pressable>
              <Pressable
                onPress={() => setViewMode("kanban")}
                className={`px-3 py-1.5 rounded-md ${
                  viewMode === "kanban" ? "bg-accent-card" : ""
                }`}
              >
                <LayoutGrid size={16} color={viewMode === "kanban" ? "#b96a4a" : "#9CA3AF"} />
              </Pressable>
            </View>
          </View>
        }
      >
        <ProgressBar
          value={completionRate}
          max={100}
          label={`${tasks.filter((task) => task.status === "DONE").length}/${tasks.length} ${t("tasks")}`}
        />
      </SectionHeader>

      {/* Filter tabs */}
      <View className="mt-3">
        <FilterTabs
          tabs={filterTabs}
          activeKey={filter}
          onSelect={(k) => setFilter(k as FilterKey)}
        />
      </View>

      {filteredTasks.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Calendar size={48} color="#D1D5DB" />
          <Text className="text-lg font-semibold text-ink mt-4">
            {t("noTasks")}
          </Text>
          <Text className="text-sm text-mute text-center mt-1">
            {t("addFirstTask")}
          </Text>
          <View className="flex-row gap-3 mt-5">
            <Pressable
              onPress={() =>
                router.push({ pathname: "/(tabs)/planning/[id]", params: { id: "new" } })
              }
              className="bg-primary-500 rounded-xl px-5 py-3 active:opacity-80"
            >
              <Text className="text-white font-semibold text-sm">{t("addTask")}</Text>
            </Pressable>
            <Pressable
              onPress={handleGenerateTemplate}
              className="bg-accent-card border border-primary-300 dark:border-primary-700 rounded-xl px-5 py-3 flex-row items-center gap-2 active:opacity-80"
            >
              <Sparkles size={16} color="#b96a4a" />
              <Text className="text-primary-500 font-semibold text-sm">{t("generatePlanning")}</Text>
            </Pressable>
          </View>
        </View>
      ) : viewMode === "timeline" ? (
        <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
          {Object.entries(groupedByMonth).map(([month, monthTasks]) => (
            <CollapsibleSection key={month} title={month} count={monthTasks.length} defaultExpanded>
              {monthTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  categoryName={categories.find((c) => c.id === task.categoryId)?.name}
                  categoryColor={categories.find((c) => c.id === task.categoryId)?.color}
                  vendorName={task.vendorId ? vendors.find((v) => v.id === task.vendorId)?.name : undefined}
                  onPress={() =>
                    router.push({ pathname: "/(tabs)/planning/[id]", params: { id: task.id } })
                  }
                  onToggleDone={() => toggleDone(task.id, task.status || "TODO")}
                />
              ))}
            </CollapsibleSection>
          ))}
          <View className="h-24" />
        </ScrollView>
      ) : (
        <ScrollView
          horizontal
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 16 }}
          showsHorizontalScrollIndicator={false}
        >
          {(["TODO", "DONE"] as TaskStatus[]).map((status) => {
            const columnTasks = filteredTasks.filter((task) => task.status === status);
            return (
              <View key={status} className="w-72 mr-4">
                <Label size={11} color="#9CA3AF" style={{ marginBottom: 8 }}>
                  {t(TASK_STATUS_LABELS[status])} ({columnTasks.length})
                </Label>
                <ScrollView showsVerticalScrollIndicator={false}>
                  {columnTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      categoryName={categories.find((c) => c.id === task.categoryId)?.name}
                      categoryColor={categories.find((c) => c.id === task.categoryId)?.color}
                      onPress={() =>
                        router.push({ pathname: "/(tabs)/planning/[id]", params: { id: task.id } })
                      }
                      onToggleDone={() => toggleDone(task.id, task.status || "TODO")}
                    />
                  ))}
                </ScrollView>
              </View>
            );
          })}
        </ScrollView>
      )}

      <FAB
        onPress={() =>
          router.push({ pathname: "/(tabs)/planning/[id]", params: { id: "new" } })
        }
      />
    </View>
  );
}

// ─── Agenda View ─────────────────────────────────────────────────────────

function AgendaView() {
  const { t } = useTranslation("planning");
  const router = useRouter();
  const events = usePlanningStore((s) => s.agendaEvents);
  const vendors = useVendorsStore((s) => s.vendors);

  const sortedEvents = useMemo(
    () =>
      [...events].sort((a, b) => {
        const d = a.date.localeCompare(b.date);
        if (d !== 0) return d;
        return (a.time || "").localeCompare(b.time || "");
      }),
    [events]
  );

  const groupedByMonth = useMemo(() => {
    const groups: Record<string, typeof sortedEvents> = {};
    sortedEvents.forEach((e) => {
      const key = safeFormat(new Date(e.date + "T00:00:00"), "MMMM yyyy", { locale: getDateLocale() });
      if (!groups[key]) groups[key] = [];
      groups[key].push(e);
    });
    return groups;
  }, [sortedEvents]);

  const now = new Date();
  const upcoming = sortedEvents.filter(
    (e) => new Date(e.date + "T23:59:59") >= now
  ).length;

  return (
    <View className="flex-1">
      <SectionHeader subtitle={`${events.length} ${t("appointments")} · ${upcoming} ${t("upcoming")}`} />

      {events.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Calendar size={48} color="#D1D5DB" />
          <Text className="text-lg font-semibold text-ink mt-4">
            {t("noAppointments")}
          </Text>
          <Text className="text-sm text-mute text-center mt-1">
            {t("planYourVisits")}
          </Text>
          <Pressable
            onPress={() =>
              router.push({ pathname: "/(tabs)/planning/agenda-event", params: { id: "new" } })
            }
            className="bg-primary-500 rounded-xl px-5 py-3 mt-5 active:opacity-80"
          >
            <Text className="text-white font-semibold text-sm">{t("addAppointment")}</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
          {Object.entries(groupedByMonth).map(([month, monthEvents]) => (
            <CollapsibleSection key={month} title={month} count={monthEvents.length} defaultExpanded>
              {monthEvents.map((event) => {
                const vendor = event.vendorId
                  ? vendors.find((v) => v.id === event.vendorId)
                  : null;
                const isPast = new Date(event.date + "T23:59:59") < now;

                return (
                  <Pressable
                    key={event.id}
                    onPress={() =>
                      router.push({
                        pathname: "/(tabs)/planning/agenda-event",
                        params: { id: event.id },
                      })
                    }
                    className={`bg-accent-card rounded-2xl p-3.5 mb-2 border active:opacity-80 ${
                      isPast
                        ? "border-hair opacity-60"
                        : "border-hair"
                    }`}
                  >
                    <View className="flex-row items-start">
                      <View className="w-14 items-center mr-3">
                        <Display size={20} weight="500" color="#b96a4a">
                          {safeFormat(new Date(event.date + "T00:00:00"), "dd")}
                        </Display>
                        <Text className="text-xs text-mute capitalize">
                          {safeFormat(new Date(event.date + "T00:00:00"), "EEE", { locale: getDateLocale() })}
                        </Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-base font-medium text-ink">
                          {event.title}
                        </Text>
                        <View className="flex-row items-center gap-3 mt-1 flex-wrap">
                          {event.time && (
                            <View className="flex-row items-center gap-1">
                              <Clock size={12} color="#9CA3AF" />
                              <Text className="text-xs text-mute">
                                {event.time}
                                {event.endTime ? ` - ${event.endTime}` : ""}
                              </Text>
                            </View>
                          )}
                          {event.location && (
                            <View className="flex-row items-center gap-1">
                              <MapPin size={12} color="#9CA3AF" />
                              <Text className="text-xs text-mute" numberOfLines={1}>
                                {event.location}
                              </Text>
                            </View>
                          )}
                          {vendor && (
                            <View className="px-2 py-0.5 rounded-full bg-primary-50 dark:bg-primary-900">
                              <Text className="text-xs text-primary-500 font-medium">
                                {vendor.name}
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </CollapsibleSection>
          ))}
          <View className="h-24" />
        </ScrollView>
      )}

      <FAB
        onPress={() =>
          router.push({ pathname: "/(tabs)/planning/agenda-event", params: { id: "new" } })
        }
      />
    </View>
  );
}

// ─── Jour J View ─────────────────────────────────────────────────────────

function DayOfView() {
  const { t } = useTranslation("planning");
  const router = useRouter();
  const items = usePlanningStore((s) => s.dayOfItems);
  const weddingDate = useWeddingStore((s) => s.wedding?.weddingDate);
  const registry = useWeddingRegistryStore((s) => s.registry);
  const activeEntry = registry?.weddings.find((w) => w.id === registry.activeWeddingId);

  const resolveDate = useCallback(
    (item: { date?: string | null }) => item.date || weddingDate || "",
    [weddingDate]
  );

  const sortedItems = useMemo(
    () => [...items].sort((a, b) => {
      const d = resolveDate(a).localeCompare(resolveDate(b));
      if (d !== 0) return d;
      return (a.time || "").localeCompare(b.time || "");
    }),
    [items, resolveDate]
  );

  const groupedByDate = useMemo(() => {
    const groups: Record<string, typeof sortedItems> = {};
    sortedItems.forEach((item) => {
      const dateStr = resolveDate(item);
      const key = dateStr
        ? safeFormat(new Date(dateStr + "T00:00:00"), "EEEE d MMMM yyyy", { locale: getDateLocale() })
        : t("common:noDate");
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });
    return groups;
  }, [sortedItems, resolveDate]);

  const isMultiDay = Object.keys(groupedByDate).length > 1;

  const hasPublicItems = useMemo(() => items.some((i) => i.isPublic), [items]);

  const handleShareTimeline = useCallback(async () => {
    if (!activeEntry?.seedPhrase) return;
    try {
      const userId = await deriveUserId(activeEntry.seedPhrase);
      const url = buildWeddingPageUrl(userId);
      await Share.share({ message: t("shareTimelineMessage", { url }) });
    } catch {}
  }, [activeEntry?.seedPhrase, t]);

  return (
    <View className="flex-1">
      <SectionHeader
        subtitle={t("moment", { count: items.length })}
        right={hasPublicItems ? (
          <Pressable
            onPress={handleShareTimeline}
            className="flex-row items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary-50 dark:bg-primary-900 active:opacity-80"
          >
            <Share2 size={14} color="#b96a4a" />
            <Text className="text-xs font-medium text-primary-500">{t("shareTimeline")}</Text>
          </Pressable>
        ) : undefined}
      />

      {items.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Clock size={48} color="#D1D5DB" />
          <Text className="text-lg font-semibold text-ink mt-4">
            {t("noMoments")}
          </Text>
          <Text className="text-sm text-mute text-center mt-1">
            {t("buildYourDay")}
          </Text>
          <Pressable
            onPress={() =>
              router.push({ pathname: "/(tabs)/planning/day-of-item", params: { id: "new" } })
            }
            className="bg-primary-500 rounded-xl px-5 py-3 mt-5 active:opacity-80"
          >
            <Text className="text-white font-semibold text-sm">{t("addMoment")}</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
          {isMultiDay ? (
            Object.entries(groupedByDate).map(([dateLabel, dateItems]) => (
              <CollapsibleSection key={dateLabel} title={dateLabel} count={dateItems.length} defaultExpanded>
                {dateItems.map((item, idx) => (
                  <DayOfTimelineCard
                    key={item.id}
                    item={item}
                    showConnector={idx < dateItems.length - 1}
                    onPress={() =>
                      router.push({ pathname: "/(tabs)/planning/day-of-item", params: { id: item.id } })
                    }
                    t={t}
                  />
                ))}
              </CollapsibleSection>
            ))
          ) : (
            sortedItems.map((item, idx) => (
              <DayOfTimelineCard
                key={item.id}
                item={item}
                showConnector={idx < sortedItems.length - 1}
                onPress={() =>
                  router.push({ pathname: "/(tabs)/planning/day-of-item", params: { id: item.id } })
                }
                t={t}
              />
            ))
          )}
          <View className="h-24" />
        </ScrollView>
      )}

      <FAB
        onPress={() =>
          router.push({ pathname: "/(tabs)/planning/day-of-item", params: { id: "new" } })
        }
      />
    </View>
  );
}

// ─── Shared Components ───────────────────────────────────────────────────

function DayOfTimelineCard({
  item,
  showConnector,
  onPress,
  t,
}: {
  item: any;
  showConnector: boolean;
  onPress: () => void;
  t: (key: string, opts?: any) => string;
}) {
  return (
    <TimelineItem
      left={
        <Display size={14} weight="500" color="#b96a4a" style={{ marginTop: 14 }}>
          {item.time}
        </Display>
      }
      showConnector={showConnector}
      onPress={onPress}
    >
      <View className="bg-accent-card rounded-2xl p-3.5 mb-3 border border-hair">
        <Text className="text-base font-medium text-ink">
          {item.title}
        </Text>
        {item.endTime && (
          <Text className="text-xs text-mute mt-0.5">
            {t("until", { time: item.endTime })}
          </Text>
        )}
        <View className="flex-row items-center gap-3 mt-1.5 flex-wrap">
          {item.location && (
            <View className="flex-row items-center gap-1">
              <MapPin size={12} color="#9CA3AF" />
              <Text className="text-xs text-mute">{item.location}</Text>
            </View>
          )}
          {item.responsible && (
            <View className="flex-row items-center gap-1">
              <User size={12} color="#9CA3AF" />
              <Text className="text-xs text-mute">{item.responsible}</Text>
            </View>
          )}
        </View>
      </View>
    </TimelineItem>
  );
}

function TaskCard({
  task,
  categoryName,
  categoryColor,
  vendorName,
  onPress,
  onToggleDone,
}: {
  task: any;
  categoryName?: string;
  categoryColor?: string | null;
  vendorName?: string;
  onPress: () => void;
  onToggleDone: () => void;
}) {
  const isDone = task.status === "DONE";
  const isOverdue =
    task.dueDate &&
    isBefore(new Date(task.dueDate), new Date()) &&
    !isDone;

  return (
    <Pressable
      onPress={onPress}
      className={`bg-accent-card rounded-2xl p-3.5 mb-2 border active:opacity-80 ${
        isOverdue
          ? "border-red-200 dark:border-red-800"
          : "border-hair"
      }`}
      style={isOverdue ? { borderLeftWidth: 3, borderLeftColor: "#EF4444" } : {}}
    >
      <View className="flex-row items-start">
        <Pressable onPress={onToggleDone} className="mt-0.5 mr-3">
          {isDone ? (
            <CheckCircle2 size={22} color="#10B981" />
          ) : (
            <Circle size={22} color="#D1D5DB" />
          )}
        </Pressable>
        <View className="flex-1">
          <Text
            className={`text-base ${
              isDone
                ? "text-mute line-through"
                : "text-ink font-medium"
            }`}
          >
            {task.title}
          </Text>
          <View className="flex-row items-center gap-2 mt-1.5 flex-wrap">
            {categoryName && (
              <View
                className="px-2 py-0.5 rounded-full"
                style={{ backgroundColor: (categoryColor || "#9CA3AF") + "15" }}
              >
                <Text
                  className="text-xs font-medium"
                  style={{ color: categoryColor || "#9CA3AF" }}
                >
                  {categoryName}
                </Text>
              </View>
            )}
            {task.priority && task.priority !== "MEDIUM" && (
              <PriorityBadge priority={task.priority as Priority} />
            )}
            {task.dueDate && <DeadlineChip date={task.dueDate} />}
            {vendorName && (
              <View className="px-2 py-0.5 rounded-full bg-primary-50 dark:bg-primary-900">
                <Text className="text-xs text-primary-500 font-medium">{vendorName}</Text>
              </View>
            )}
            {task.assignee && (
              <View className="flex-row items-center gap-1">
                <User size={11} color="#9CA3AF" />
                <Text className="text-xs text-mute">{task.assignee}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </Pressable>
  );
}
