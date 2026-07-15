import Constants from "expo-constants";
import { subDays, subMinutes, setHours, setMinutes, setSeconds, subHours, isBefore } from "date-fns";
import type { Task, AgendaEvent, DayOfItem } from "@/db/schema";
import i18n from "@/i18n";
import { isPremium } from "@/lib/premium";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useWeddingStore } from "@/store/useWeddingStore";
import type * as NotificationsType from "expo-notifications";

// expo-notifications remote push support was removed from Expo Go in SDK 53 — importing
// it in Expo Go on Android throws at module-load time, crashing the entire layout.
// Guard with a try/catch dynamic require so the rest of the app stays functional.
const isExpoGo = Constants.appOwnership === "expo";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const N: typeof NotificationsType | null = isExpoGo ? null : (() => { try { return require("expo-notifications"); } catch { return null; } })();

// ─── Permissions ────────────────────────────────────────────────────────────

export async function requestPermissions(): Promise<boolean> {
  if (!N) return false;
  const { status: existing } = await N.getPermissionsAsync();
  if (existing === "granted") return true;
  const { status } = await N.requestPermissionsAsync();
  return status === "granted";
}

// ─── Schedule helpers ───────────────────────────────────────────────────────

function taskIdentifier(id: string) {
  return `task-${id}`;
}

function agendaIdentifier(id: string) {
  return `agenda-${id}`;
}

function dayOfIdentifier(id: string) {
  return `dayof-${id}`;
}

function getTaskTriggerDate(task: Task): Date | null {
  if (!task.dueDate) return null;
  const daysBefore = task.reminderDaysBefore ?? 1;
  const due = new Date(task.dueDate);
  if (isNaN(due.getTime())) return null;
  const trigger = setSeconds(setMinutes(setHours(subDays(due, daysBefore), 9), 0), 0);
  if (isBefore(trigger, new Date())) return null;
  return trigger;
}

function getAgendaTriggerDate(event: AgendaEvent): Date | null {
  if (event.time) {
    const parts = event.time.split(":");
    const h = Number(parts[0]);
    const m = Number(parts[1]);
    if (isNaN(h) || isNaN(m)) return null;
    const eventDate = setSeconds(setMinutes(setHours(new Date(event.date), h), m), 0);
    if (isNaN(eventDate.getTime())) return null;
    const trigger = subHours(eventDate, 1);
    if (isBefore(trigger, new Date())) return null;
    return trigger;
  }
  const date = new Date(event.date);
  if (isNaN(date.getTime())) return null;
  const trigger = setSeconds(setMinutes(setHours(date, 9), 0), 0);
  if (isBefore(trigger, new Date())) return null;
  return trigger;
}

function getDayOfItemTriggerDate(item: DayOfItem, weddingDate: string | null | undefined, leadMinutes: number): Date | null {
  if (item.completedAt) return null;
  const baseDate = item.date ?? weddingDate;
  if (!baseDate || !item.time) return null;
  const parts = item.time.split(":");
  const h = Number(parts[0]);
  const m = Number(parts[1]);
  if (isNaN(h) || isNaN(m)) return null;
  const itemDate = setSeconds(setMinutes(setHours(new Date(baseDate), h), m), 0);
  if (isNaN(itemDate.getTime())) return null;
  const trigger = subMinutes(itemDate, leadMinutes);
  if (isBefore(trigger, new Date())) return null;
  return trigger;
}

// ─── Public API ─────────────────────────────────────────────────────────────

export async function scheduleTaskNotification(task: Task): Promise<void> {
  if (!N || !isPremium()) return;
  const id = taskIdentifier(task.id);

  if (task.status === "DONE") {
    await N.cancelScheduledNotificationAsync(id).catch((e) => console.warn("[notifications] cancel failed:", e));
    return;
  }

  const trigger = getTaskTriggerDate(task);
  if (!trigger) {
    await N.cancelScheduledNotificationAsync(id).catch((e) => console.warn("[notifications] cancel failed:", e));
    return;
  }

  await N.cancelScheduledNotificationAsync(id).catch((e) => console.warn("[notifications] cancel failed:", e));
  await N.scheduleNotificationAsync({
    identifier: id,
    content: {
      title: "Fiancé",
      body: i18n.t("planning:notifications.taskReminder", { title: task.title }),
      data: { type: "task", id: task.id },
    },
    trigger: { type: N.SchedulableTriggerInputTypes.DATE, date: trigger },
  });
}

export async function scheduleAgendaNotification(event: AgendaEvent): Promise<void> {
  if (!N || !isPremium()) return;
  const id = agendaIdentifier(event.id);
  const trigger = getAgendaTriggerDate(event);
  if (!trigger) {
    await N.cancelScheduledNotificationAsync(id).catch((e) => console.warn("[notifications] cancel failed:", e));
    return;
  }

  const body = event.time
    ? i18n.t("planning:notifications.agendaReminderWithTime", { title: event.title, time: event.time })
    : i18n.t("planning:notifications.agendaReminder", { title: event.title });

  await N.cancelScheduledNotificationAsync(id).catch((e) => console.warn("[notifications] cancel failed:", e));
  await N.scheduleNotificationAsync({
    identifier: id,
    content: {
      title: "Fiancé",
      body,
      data: { type: "agenda", id: event.id },
    },
    trigger: { type: N.SchedulableTriggerInputTypes.DATE, date: trigger },
  });
}

export async function scheduleDayOfItemNotification(item: DayOfItem): Promise<void> {
  if (!N || !isPremium()) return;
  const id = dayOfIdentifier(item.id);
  const weddingDate = useWeddingStore.getState().wedding?.weddingDate;
  const leadMinutes = useSettingsStore.getState().dayOfReminderLeadMinutes;
  const trigger = getDayOfItemTriggerDate(item, weddingDate, leadMinutes);
  if (!trigger) {
    await N.cancelScheduledNotificationAsync(id).catch((e) => console.warn("[notifications] cancel failed:", e));
    return;
  }

  await N.cancelScheduledNotificationAsync(id).catch((e) => console.warn("[notifications] cancel failed:", e));
  await N.scheduleNotificationAsync({
    identifier: id,
    content: {
      title: "Fiancé",
      body: i18n.t("planning:notifications.dayOfReminder", { title: item.title }),
      data: { type: "dayof", id: item.id },
    },
    trigger: { type: N.SchedulableTriggerInputTypes.DATE, date: trigger },
  });
}

export async function cancelNotification(identifier: string): Promise<void> {
  if (!N) return;
  await N.cancelScheduledNotificationAsync(identifier).catch((e) => console.warn("[notifications] cancel failed:", e));
}

export async function cancelAllNotifications(): Promise<void> {
  if (!N) return;
  await N.cancelAllScheduledNotificationsAsync();
}

export async function rescheduleAllNotifications(
  tasks: Task[],
  agendaEvents: AgendaEvent[],
  dayOfItems: DayOfItem[],
): Promise<void> {
  if (!N) return;
  await N.cancelAllScheduledNotificationsAsync();
  if (!isPremium()) return;

  const weddingDate = useWeddingStore.getState().wedding?.weddingDate;
  const leadMinutes = useSettingsStore.getState().dayOfReminderLeadMinutes;

  const taskItems = tasks
    .filter((t) => t.status !== "DONE" && t.dueDate)
    .map((t) => ({ trigger: getTaskTriggerDate(t), schedule: () => scheduleTaskNotification(t) }))
    .filter((x) => x.trigger !== null);

  const agendaItems = agendaEvents
    .map((e) => ({ trigger: getAgendaTriggerDate(e), schedule: () => scheduleAgendaNotification(e) }))
    .filter((x) => x.trigger !== null);

  const dayOfItemsList = dayOfItems
    .map((i) => ({ trigger: getDayOfItemTriggerDate(i, weddingDate, leadMinutes), schedule: () => scheduleDayOfItemNotification(i) }))
    .filter((x) => x.trigger !== null);

  const all = [...taskItems, ...agendaItems, ...dayOfItemsList]
    .sort((a, b) => a.trigger!.getTime() - b.trigger!.getTime())
    .slice(0, 60);

  for (const item of all) {
    try {
      await item.schedule();
    } catch (err) {
      console.warn("[notifications] Failed to schedule:", err);
    }
  }
}

// ─── Mutation hooks (fire-and-forget) ───────────────────────────────────────

export function onTaskMutation(task: Task, action: "add" | "update" | "remove"): void {
  const promise = action === "remove"
    ? cancelNotification(taskIdentifier(task.id))
    : scheduleTaskNotification(task);
  promise.catch((err) => console.warn("[notifications] onTaskMutation failed:", err));
}

export function onAgendaMutation(event: AgendaEvent, action: "add" | "update" | "remove"): void {
  const promise = action === "remove"
    ? cancelNotification(agendaIdentifier(event.id))
    : scheduleAgendaNotification(event);
  promise.catch((err) => console.warn("[notifications] onAgendaMutation failed:", err));
}

export function onDayOfItemMutation(item: DayOfItem, action: "add" | "update" | "remove"): void {
  const promise = action === "remove"
    ? cancelNotification(dayOfIdentifier(item.id))
    : scheduleDayOfItemNotification(item);
  promise.catch((err) => console.warn("[notifications] onDayOfItemMutation failed:", err));
}
