import React, { useState, useMemo, useCallback } from "react";
import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { useRouter } from "expo-router";
import {
  List, LayoutGrid, Calendar, CheckCircle2, Circle, Sparkles,
  Clock, MapPin, User,
} from "lucide-react-native";
import { format, isBefore } from "date-fns";
import { fr } from "date-fns/locale";
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
import {
  generateDefaultCategories,
  generateTemplateTasks,
} from "@/lib/planning";

type ViewMode = "timeline" | "kanban";
type FilterKey = "ALL" | "TODO" | "IN_PROGRESS" | "DONE" | "OVERDUE";

const ASPECTS: PlanningAspect[] = ["preparatifs", "agenda", "jourj"];

export default function PlanningScreen() {
  const router = useRouter();
  const [aspect, setAspect] = useState<PlanningAspect>("preparatifs");

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-950">
      {/* Segmented control */}
      <View className="px-4 pt-3 pb-2 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <View className="flex-row bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
          {ASPECTS.map((a) => (
            <Pressable
              key={a}
              onPress={() => setAspect(a)}
              className={`flex-1 py-2 rounded-lg items-center ${
                aspect === a ? "bg-white dark:bg-gray-700 shadow-sm" : ""
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  aspect === a
                    ? "text-primary-500"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {PLANNING_ASPECT_LABELS[a]}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {aspect === "preparatifs" && <PreparatifView />}
      {aspect === "agenda" && <AgendaView />}
      {aspect === "jourj" && <JourJView />}
    </View>
  );
}

// ─── Préparatifs View ────────────────────────────────────────────────────

function PreparatifView() {
  const router = useRouter();
  const tasks = usePlanningStore((s) => s.tasks);
  const categories = usePlanningStore((s) => s.categories);
  const setTasks = usePlanningStore((s) => s.setTasks);
  const setCategories = usePlanningStore((s) => s.setCategories);
  const updateTask = usePlanningStore((s) => s.updateTask);
  const weddingDate = useWeddingStore((s) => s.wedding?.weddingDate);

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
      Alert.alert("Planning généré", "Le planning type de préparation a été ajouté.");
    };

    if (tasks.length > 0) {
      Alert.alert(
        "Planning existant",
        "Des tâches existent déjà. Voulez-vous ajouter le planning type ? Cela pourrait créer des doublons.",
        [
          { text: "Annuler", style: "cancel" },
          { text: "Ajouter", onPress: doGenerate },
        ]
      );
    } else {
      doGenerate();
    }
  }, [categories, tasks, weddingDate]);

  const completionRate = useMemo(() => {
    const active = tasks.filter((t) => t.status !== "CANCELLED");
    if (active.length === 0) return 0;
    const done = active.filter((t) => t.status === "DONE").length;
    return Math.round((done / active.length) * 100);
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks
      .filter((t) => {
        if (filter === "OVERDUE") {
          return (
            t.dueDate &&
            isBefore(new Date(t.dueDate), now) &&
            t.status !== "DONE" &&
            t.status !== "CANCELLED"
          );
        }
        if (filter !== "ALL" && t.status !== filter) return false;
        if (categoryFilter !== "ALL" && t.categoryId !== categoryFilter)
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
    filteredTasks.forEach((t) => {
      const key = t.dueDate
        ? format(new Date(t.dueDate), "MMMM yyyy", { locale: fr })
        : "Sans date";
      if (!groups[key]) groups[key] = [];
      groups[key].push(t);
    });
    return groups;
  }, [filteredTasks]);

  const overdue = tasks.filter(
    (t) =>
      t.dueDate &&
      isBefore(new Date(t.dueDate), now) &&
      t.status !== "DONE" &&
      t.status !== "CANCELLED"
  );

  const filterTabs = [
    { key: "ALL", label: "Toutes" },
    { key: "TODO", label: "À faire" },
    { key: "IN_PROGRESS", label: "En cours" },
    { key: "DONE", label: "Terminées" },
    { key: "OVERDUE", label: `En retard (${overdue.length})` },
  ];

  const toggleDone = (taskId: string, currentStatus: string) => {
    if (currentStatus === "DONE") {
      updateTask(taskId, { status: "TODO", completedAt: null });
    } else {
      updateTask(taskId, { status: "DONE", completedAt: new Date().toISOString() });
    }
  };

  return (
    <View className="flex-1">
      {/* Progress header */}
      <View className="px-4 pt-3 pb-3 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-base font-semibold text-gray-900 dark:text-white">
            Progression
          </Text>
          <View className="flex-row items-center gap-2">
            <Pressable
              onPress={handleGenerateTemplate}
              className="flex-row items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary-50 dark:bg-primary-900 active:opacity-80"
            >
              <Sparkles size={14} color="#EC4899" />
              <Text className="text-xs font-medium text-primary-500">Générer</Text>
            </Pressable>
            <View className="flex-row bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
              <Pressable
                onPress={() => setViewMode("timeline")}
                className={`px-3 py-1.5 rounded-md ${
                  viewMode === "timeline" ? "bg-white dark:bg-gray-700 shadow-sm" : ""
                }`}
              >
                <List size={16} color={viewMode === "timeline" ? "#EC4899" : "#9CA3AF"} />
              </Pressable>
              <Pressable
                onPress={() => setViewMode("kanban")}
                className={`px-3 py-1.5 rounded-md ${
                  viewMode === "kanban" ? "bg-white dark:bg-gray-700 shadow-sm" : ""
                }`}
              >
                <LayoutGrid size={16} color={viewMode === "kanban" ? "#EC4899" : "#9CA3AF"} />
              </Pressable>
            </View>
          </View>
        </View>
        <ProgressBar
          value={completionRate}
          max={100}
          label={`${tasks.filter((t) => t.status === "DONE").length}/${
            tasks.filter((t) => t.status !== "CANCELLED").length
          } tâches`}
        />
      </View>

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
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mt-4">
            Aucune tâche
          </Text>
          <Text className="text-sm text-gray-400 text-center mt-1">
            Ajoutez votre première tâche ou générez le planning type
          </Text>
          <View className="flex-row gap-3 mt-5">
            <Pressable
              onPress={() =>
                router.push({ pathname: "/(tabs)/planning/[id]", params: { id: "new" } })
              }
              className="bg-primary-500 rounded-xl px-5 py-3 active:opacity-80"
            >
              <Text className="text-white font-semibold text-sm">Ajouter une tâche</Text>
            </Pressable>
            <Pressable
              onPress={handleGenerateTemplate}
              className="bg-white dark:bg-gray-900 border border-primary-300 dark:border-primary-700 rounded-xl px-5 py-3 flex-row items-center gap-2 active:opacity-80"
            >
              <Sparkles size={16} color="#EC4899" />
              <Text className="text-primary-500 font-semibold text-sm">Générer le planning</Text>
            </Pressable>
          </View>
        </View>
      ) : viewMode === "timeline" ? (
        <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
          {Object.entries(groupedByMonth).map(([month, monthTasks]) => (
            <View key={month} className="mb-4">
              <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                {month}
              </Text>
              {monthTasks.map((task) => (
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
            </View>
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
          {(["TODO", "IN_PROGRESS", "DONE", "CANCELLED"] as TaskStatus[]).map((status) => {
            const columnTasks = filteredTasks.filter((t) => t.status === status);
            return (
              <View key={status} className="w-72 mr-4">
                <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  {TASK_STATUS_LABELS[status]} ({columnTasks.length})
                </Text>
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
      const key = format(new Date(e.date + "T00:00:00"), "MMMM yyyy", { locale: fr });
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
      <View className="px-4 pt-3 pb-3 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <Text className="text-sm text-gray-400">
          {events.length} rendez-vous · {upcoming} à venir
        </Text>
      </View>

      {events.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Calendar size={48} color="#D1D5DB" />
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mt-4">
            Aucun rendez-vous
          </Text>
          <Text className="text-sm text-gray-400 text-center mt-1">
            Planifiez vos visites, essayages et rencontres
          </Text>
          <Pressable
            onPress={() =>
              router.push({ pathname: "/(tabs)/planning/agenda-event", params: { id: "new" } })
            }
            className="bg-primary-500 rounded-xl px-5 py-3 mt-5 active:opacity-80"
          >
            <Text className="text-white font-semibold text-sm">Ajouter un rendez-vous</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
          {Object.entries(groupedByMonth).map(([month, monthEvents]) => (
            <View key={month} className="mb-4">
              <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-3">
                {month}
              </Text>
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
                    className={`bg-white dark:bg-gray-900 rounded-2xl p-3.5 mb-2 border active:opacity-80 ${
                      isPast
                        ? "border-gray-100 dark:border-gray-800 opacity-60"
                        : "border-gray-100 dark:border-gray-800"
                    }`}
                  >
                    <View className="flex-row items-start">
                      <View className="w-14 items-center mr-3">
                        <Text className="text-lg font-bold text-primary-500">
                          {format(new Date(event.date + "T00:00:00"), "dd")}
                        </Text>
                        <Text className="text-xs text-gray-400 capitalize">
                          {format(new Date(event.date + "T00:00:00"), "EEE", { locale: fr })}
                        </Text>
                      </View>
                      <View className="flex-1">
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
            </View>
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

function JourJView() {
  const router = useRouter();
  const items = usePlanningStore((s) => s.jourJItems);

  const sortedItems = useMemo(
    () => [...items].sort((a, b) => (a.time || "").localeCompare(b.time || "")),
    [items]
  );

  return (
    <View className="flex-1">
      <View className="px-4 pt-3 pb-3 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <Text className="text-sm text-gray-400">
          {items.length} moment{items.length !== 1 ? "s" : ""} planifié{items.length !== 1 ? "s" : ""}
        </Text>
      </View>

      {items.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Clock size={48} color="#D1D5DB" />
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mt-4">
            Aucun moment planifié
          </Text>
          <Text className="text-sm text-gray-400 text-center mt-1">
            Construisez le déroulé de votre journée de mariage
          </Text>
          <Pressable
            onPress={() =>
              router.push({ pathname: "/(tabs)/planning/jourj-item", params: { id: "new" } })
            }
            className="bg-primary-500 rounded-xl px-5 py-3 mt-5 active:opacity-80"
          >
            <Text className="text-white font-semibold text-sm">Ajouter un moment</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
          {sortedItems.map((item, idx) => (
            <Pressable
              key={item.id}
              onPress={() =>
                router.push({
                  pathname: "/(tabs)/planning/jourj-item",
                  params: { id: item.id },
                })
              }
              className="flex-row active:opacity-80"
            >
              {/* Timeline line */}
              <View className="w-14 items-center mr-3">
                <Text className="text-sm font-bold text-primary-500 mt-3.5">
                  {item.time}
                </Text>
                {idx < sortedItems.length - 1 && (
                  <View className="w-0.5 flex-1 bg-gray-200 dark:bg-gray-700 mt-2 mb-0" />
                )}
              </View>

              {/* Card */}
              <View className="flex-1 bg-white dark:bg-gray-900 rounded-2xl p-3.5 mb-3 border border-gray-100 dark:border-gray-800">
                <Text className="text-base font-medium text-gray-900 dark:text-white">
                  {item.title}
                </Text>
                {item.endTime && (
                  <Text className="text-xs text-gray-400 mt-0.5">
                    jusqu'à {item.endTime}
                  </Text>
                )}
                <View className="flex-row items-center gap-3 mt-1.5 flex-wrap">
                  {item.location && (
                    <View className="flex-row items-center gap-1">
                      <MapPin size={12} color="#9CA3AF" />
                      <Text className="text-xs text-gray-400">{item.location}</Text>
                    </View>
                  )}
                  {item.responsible && (
                    <View className="flex-row items-center gap-1">
                      <User size={12} color="#9CA3AF" />
                      <Text className="text-xs text-gray-400">{item.responsible}</Text>
                    </View>
                  )}
                </View>
              </View>
            </Pressable>
          ))}
          <View className="h-24" />
        </ScrollView>
      )}

      <FAB
        onPress={() =>
          router.push({ pathname: "/(tabs)/planning/jourj-item", params: { id: "new" } })
        }
      />
    </View>
  );
}

// ─── Shared Components ───────────────────────────────────────────────────

function TaskCard({
  task,
  categoryName,
  categoryColor,
  onPress,
  onToggleDone,
}: {
  task: any;
  categoryName?: string;
  categoryColor?: string | null;
  onPress: () => void;
  onToggleDone: () => void;
}) {
  const isDone = task.status === "DONE";
  const isOverdue =
    task.dueDate &&
    isBefore(new Date(task.dueDate), new Date()) &&
    !isDone &&
    task.status !== "CANCELLED";

  return (
    <Pressable
      onPress={onPress}
      className={`bg-white dark:bg-gray-900 rounded-2xl p-3.5 mb-2 border active:opacity-80 ${
        isOverdue
          ? "border-red-200 dark:border-red-800"
          : "border-gray-100 dark:border-gray-800"
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
                ? "text-gray-400 line-through"
                : "text-gray-900 dark:text-white font-medium"
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
            {task.assignee && (
              <View className="flex-row items-center gap-1">
                <User size={11} color="#9CA3AF" />
                <Text className="text-xs text-gray-400">{task.assignee}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </Pressable>
  );
}
