import * as Notifications from "expo-notifications";
import { subDays, setHours, setMinutes, setSeconds, subHours, isBefore } from "date-fns";
import type { Task, AgendaEvent } from "@/db/schema";
import i18n from "@/i18n";

// ─── Permissions ────────────────────────────────────────────────────────────

export async function requestPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;
  const { status } = await Notifications.requestPermissionsAsync();
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
  if (isNaN(due.getTime())) return null;
  const trigger = setSeconds(setMinutes(setHours(subDays(due, daysBefore), 9), 0), 0);
  if (isBefore(trigger, new Date())) return null;
  return trigger;
}

/** Compute trigger date for an agenda event notification */
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
  // No time → 09:00 on the event day
  const date = new Date(event.date);
  if (isNaN(date.getTime())) return null;
  const trigger = setSeconds(setMinutes(setHours(date, 9), 0), 0);
  if (isBefore(trigger, new Date())) return null;
  return trigger;
}

// ─── Public API ─────────────────────────────────────────────────────────────

export async function scheduleTaskNotification(task: Task): Promise<void> {
  const id = taskIdentifier(task.id);

  if (task.status === "DONE" || task.status === "CANCELLED") {
    await Notifications.cancelScheduledNotificationAsync(id).catch(() => {});
    return;
  }

  const trigger = getTaskTriggerDate(task);
  if (!trigger) {
    await Notifications.cancelScheduledNotificationAsync(id).catch(() => {});
    return;
  }

  await Notifications.cancelScheduledNotificationAsync(id).catch(() => {});
  await Notifications.scheduleNotificationAsync({
    identifier: id,
    content: {
      title: "WeddingOS",
      body: i18n.t("planning:notifications.taskReminder", { title: task.title }),
      data: { type: "task", id: task.id },
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: trigger },
  });
}

export async function scheduleAgendaNotification(event: AgendaEvent): Promise<void> {
  const id = agendaIdentifier(event.id);
  const trigger = getAgendaTriggerDate(event);
  if (!trigger) {
    await Notifications.cancelScheduledNotificationAsync(id).catch(() => {});
    return;
  }

  const body = event.time
    ? i18n.t("planning:notifications.agendaReminderWithTime", { title: event.title, time: event.time })
    : i18n.t("planning:notifications.agendaReminder", { title: event.title });

  await Notifications.cancelScheduledNotificationAsync(id).catch(() => {});
  await Notifications.scheduleNotificationAsync({
    identifier: id,
    content: {
      title: "WeddingOS",
      body,
      data: { type: "agenda", id: event.id },
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: trigger },
  });
}

export async function cancelNotification(identifier: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(identifier).catch(() => {});
}

export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function rescheduleAllNotifications(
  tasks: Task[],
  agendaEvents: AgendaEvent[],
): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();

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
