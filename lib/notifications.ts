import { Platform } from "react-native";
import { subDays, setHours, setMinutes, setSeconds, subHours, isBefore } from "date-fns";
import type { Task, AgendaEvent } from "@/db/schema";
import i18n from "@/i18n";

// Lazy-import to avoid web crashes
let Notifications: typeof import("expo-notifications") | null = null;

async function getModule() {
  if (Platform.OS === "web") return null;
  if (!Notifications) {
    Notifications = await import("expo-notifications");
  }
  return Notifications;
}

// ─── Permissions ────────────────────────────────────────────────────────────

export async function requestPermissions(): Promise<boolean> {
  const mod = await getModule();
  if (!mod) return false;
  const { status: existing } = await mod.getPermissionsAsync();
  if (existing === "granted") return true;
  const { status } = await mod.requestPermissionsAsync();
  return status === "granted";
}

// ─── Schedule helpers ───────────────────────────────────────────────────────

function taskIdentifier(id: string) {
  return `task-${id}`;
}

function agendaIdentifier(id: string) {
  return `agenda-${id}`;
}

/** Compute trigger date for a task notification */
function getTaskTriggerDate(task: Task): Date | null {
  if (!task.dueDate) return null;
  const daysBefore = task.reminderDaysBefore ?? 1;
  const due = new Date(task.dueDate);
  const trigger = setSeconds(setMinutes(setHours(subDays(due, daysBefore), 9), 0), 0);
  if (isBefore(trigger, new Date())) return null;
  return trigger;
}

/** Compute trigger date for an agenda event notification */
function getAgendaTriggerDate(event: AgendaEvent): Date | null {
  if (event.time) {
    const [h, m] = event.time.split(":").map(Number);
    const eventDate = setSeconds(setMinutes(setHours(new Date(event.date), h), m), 0);
    const trigger = subHours(eventDate, 1);
    if (isBefore(trigger, new Date())) return null;
    return trigger;
  }
  // No time → 09:00 on the event day
  const trigger = setSeconds(setMinutes(setHours(new Date(event.date), 9), 0), 0);
  if (isBefore(trigger, new Date())) return null;
  return trigger;
}

// ─── Public API ─────────────────────────────────────────────────────────────

export async function scheduleTaskNotification(task: Task): Promise<void> {
  const mod = await getModule();
  if (!mod) return;

  const id = taskIdentifier(task.id);

  if (task.status === "DONE" || task.status === "CANCELLED") {
    await mod.cancelScheduledNotificationAsync(id).catch(() => {});
    return;
  }

  const trigger = getTaskTriggerDate(task);
  if (!trigger) return;

  await mod.cancelScheduledNotificationAsync(id).catch(() => {});
  await mod.scheduleNotificationAsync({
    identifier: id,
    content: {
      title: "WeddingOS",
      body: i18n.t("planning:notifications.taskReminder", { title: task.title }),
      data: { type: "task", id: task.id },
    },
    trigger: { type: mod.SchedulableTriggerInputTypes.DATE, date: trigger },
  });
}

export async function scheduleAgendaNotification(event: AgendaEvent): Promise<void> {
  const mod = await getModule();
  if (!mod) return;

  const id = agendaIdentifier(event.id);
  const trigger = getAgendaTriggerDate(event);
  if (!trigger) return;

  const body = event.time
    ? i18n.t("planning:notifications.agendaReminderWithTime", { title: event.title, time: event.time })
    : i18n.t("planning:notifications.agendaReminder", { title: event.title });

  await mod.cancelScheduledNotificationAsync(id).catch(() => {});
  await mod.scheduleNotificationAsync({
    identifier: id,
    content: {
      title: "WeddingOS",
      body,
      data: { type: "agenda", id: event.id },
    },
    trigger: { type: mod.SchedulableTriggerInputTypes.DATE, date: trigger },
  });
}

export async function cancelNotification(identifier: string): Promise<void> {
  const mod = await getModule();
  if (!mod) return;
  await mod.cancelScheduledNotificationAsync(identifier).catch(() => {});
}

export async function cancelAllNotifications(): Promise<void> {
  const mod = await getModule();
  if (!mod) return;
  await mod.cancelAllScheduledNotificationsAsync();
}

export async function rescheduleAllNotifications(
  tasks: Task[],
  agendaEvents: AgendaEvent[],
): Promise<void> {
  const mod = await getModule();
  if (!mod) return;

  await mod.cancelAllScheduledNotificationsAsync();

  // Collect schedulable items with their trigger dates, sort nearest-first, cap at 60
  const taskItems = tasks
    .filter((t) => t.status !== "DONE" && t.status !== "CANCELLED" && t.dueDate)
    .map((t) => ({ trigger: getTaskTriggerDate(t), schedule: () => scheduleTaskNotification(t) }))
    .filter((x) => x.trigger !== null);

  const agendaItems = agendaEvents
    .map((e) => ({ trigger: getAgendaTriggerDate(e), schedule: () => scheduleAgendaNotification(e) }))
    .filter((x) => x.trigger !== null);

  const all = [...taskItems, ...agendaItems]
    .sort((a, b) => a.trigger!.getTime() - b.trigger!.getTime())
    .slice(0, 60);

  for (const item of all) {
    await item.schedule();
  }
}

// ─── Mutation hooks (fire-and-forget) ───────────────────────────────────────

function isEnabled(): boolean {
  // Avoid circular import — read from secure-store cache via settings store
  // This is called synchronously; the store is already hydrated by this point
  try {
    const { useSettingsStore } = require("@/store/useSettingsStore");
    return useSettingsStore.getState().notificationsEnabled;
  } catch {
    return false;
  }
}

export function onTaskMutation(task: Task, action: "add" | "update" | "remove"): void {
  if (Platform.OS === "web" || !isEnabled()) return;
  if (action === "remove") {
    cancelNotification(taskIdentifier(task.id));
  } else {
    scheduleTaskNotification(task);
  }
}

export function onAgendaMutation(event: AgendaEvent, action: "add" | "update" | "remove"): void {
  if (Platform.OS === "web" || !isEnabled()) return;
  if (action === "remove") {
    cancelNotification(agendaIdentifier(event.id));
  } else {
    scheduleAgendaNotification(event);
  }
}
