import React, { useState, useMemo } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { format, isBefore, differenceInDays } from "date-fns";
import { fr } from "date-fns/locale";
import { usePlanningStore } from "@/store/usePlanningStore";
import { TASK_STATUS_LABELS, PRIORITY_COLORS, PRIORITY_LABELS } from "@/db/types";
import type { TaskStatus, Priority } from "@/db/types";
import { FilterTabs } from "@/components/FilterTabs";
import { DeadlineChip } from "@/components/DeadlineChip";
import { PriorityBadge } from "@/components/PriorityBadge";
import { ProgressBar } from "@/components/ProgressBar";
import { FAB } from "@/components/FAB";
import { EmptyState } from "@/components/EmptyState";

type ViewMode = "timeline" | "kanban";
type FilterKey = "ALL" | "TODO" | "IN_PROGRESS" | "DONE" | "OVERDUE";

export default function PlanningScreen() {
  const router = useRouter();
  const tasks = usePlanningStore((s) => s.tasks);
  const categories = usePlanningStore((s) => s.categories);
  const completionRate = usePlanningStore((s) => s.getCompletionRate());
  const updateTask = usePlanningStore((s) => s.updateTask);
  const [viewMode, setViewMode] = useState<ViewMode>("timeline");
  const [filter, setFilter] = useState<FilterKey>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");

  const now = new Date();

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

  // Group by month for timeline view
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
      updateTask(taskId, {
        status: "DONE",
        completedAt: new Date().toISOString(),
      });
    }
  };

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-950">
      {/* Progress header */}
      <View className="px-4 pt-4 pb-2 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-base font-semibold text-gray-900 dark:text-white">
            Progression
          </Text>
          <View className="flex-row gap-2">
            <Pressable
              onPress={() => setViewMode("timeline")}
              className={`px-3 py-1 rounded-full ${
                viewMode === "timeline"
                  ? "bg-primary-500"
                  : "bg-gray-100 dark:bg-gray-800"
              }`}
            >
              <Ionicons
                name="list"
                size={16}
                color={viewMode === "timeline" ? "white" : "#9CA3AF"}
              />
            </Pressable>
            <Pressable
              onPress={() => setViewMode("kanban")}
              className={`px-3 py-1 rounded-full ${
                viewMode === "kanban"
                  ? "bg-primary-500"
                  : "bg-gray-100 dark:bg-gray-800"
              }`}
            >
              <Ionicons
                name="grid"
                size={16}
                color={viewMode === "kanban" ? "white" : "#9CA3AF"}
              />
            </Pressable>
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
        <EmptyState
          icon="calendar-outline"
          title="Aucune tâche"
          description="Ajoutez votre première tâche ou générez le planning type"
          actionLabel="Ajouter une tâche"
          onAction={() =>
            router.push({
              pathname: "/(tabs)/planning/[id]",
              params: { id: "new" },
            })
          }
        />
      ) : viewMode === "timeline" ? (
        <ScrollView
          className="flex-1 px-4"
          showsVerticalScrollIndicator={false}
        >
          {Object.entries(groupedByMonth).map(([month, monthTasks]) => (
            <View key={month} className="mb-4">
              <Text className="text-sm font-semibold text-gray-500 uppercase mb-2">
                {month}
              </Text>
              {monthTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  categoryName={
                    categories.find((c) => c.id === task.categoryId)?.name
                  }
                  categoryColor={
                    categories.find((c) => c.id === task.categoryId)?.color
                  }
                  onPress={() =>
                    router.push({
                      pathname: "/(tabs)/planning/[id]",
                      params: { id: task.id },
                    })
                  }
                  onToggleDone={() => toggleDone(task.id, task.status || "TODO")}
                />
              ))}
            </View>
          ))}
          <View className="h-24" />
        </ScrollView>
      ) : (
        // Kanban view
        <ScrollView
          horizontal
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 16 }}
          showsHorizontalScrollIndicator={false}
        >
          {(["TODO", "IN_PROGRESS", "DONE", "CANCELLED"] as TaskStatus[]).map(
            (status) => {
              const columnTasks = filteredTasks.filter(
                (t) => t.status === status
              );
              return (
                <View key={status} className="w-72 mr-4">
                  <Text className="text-sm font-semibold text-gray-500 uppercase mb-2">
                    {TASK_STATUS_LABELS[status]} ({columnTasks.length})
                  </Text>
                  <ScrollView showsVerticalScrollIndicator={false}>
                    {columnTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        categoryName={
                          categories.find((c) => c.id === task.categoryId)?.name
                        }
                        categoryColor={
                          categories.find((c) => c.id === task.categoryId)
                            ?.color
                        }
                        onPress={() =>
                          router.push({
                            pathname: "/(tabs)/planning/[id]",
                            params: { id: task.id },
                          })
                        }
                        onToggleDone={() =>
                          toggleDone(task.id, task.status || "TODO")
                        }
                      />
                    ))}
                  </ScrollView>
                </View>
              );
            }
          )}
        </ScrollView>
      )}

      <FAB
        onPress={() =>
          router.push({
            pathname: "/(tabs)/planning/[id]",
            params: { id: "new" },
          })
        }
      />
    </View>
  );
}

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
      className={`bg-white dark:bg-gray-900 rounded-xl p-3 mb-2 shadow-sm active:opacity-80 ${
        isOverdue ? "border-l-4 border-red-500" : ""
      }`}
    >
      <View className="flex-row items-start">
        <Pressable onPress={onToggleDone} className="mt-0.5 mr-3">
          <Ionicons
            name={isDone ? "checkbox" : "square-outline"}
            size={22}
            color={isDone ? "#10B981" : "#D1D5DB"}
          />
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
          <View className="flex-row items-center gap-2 mt-1 flex-wrap">
            {categoryName && (
              <View
                className="px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: (categoryColor || "#9CA3AF") + "20",
                }}
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
          </View>
        </View>
      </View>
    </Pressable>
  );
}
