import type { Task, AgendaEvent, DayOfItem } from "@/db/schema";

// Web no-ops — expo-notifications is native-only

export async function requestPermissions(): Promise<boolean> {
  return false;
}

export async function scheduleTaskNotification(_task: Task): Promise<void> {}
export async function scheduleAgendaNotification(_event: AgendaEvent): Promise<void> {}
export async function scheduleDayOfItemNotification(_item: DayOfItem): Promise<void> {}
export async function cancelNotification(_identifier: string): Promise<void> {}
export async function cancelAllNotifications(): Promise<void> {}
export async function rescheduleAllNotifications(
  _tasks: Task[],
  _agendaEvents: AgendaEvent[],
  _dayOfItems: DayOfItem[],
): Promise<void> {}

export function onTaskMutation(_task: Task, _action: "add" | "update" | "remove"): void {}
export function onAgendaMutation(_event: AgendaEvent, _action: "add" | "update" | "remove"): void {}
export function onDayOfItemMutation(_item: DayOfItem, _action: "add" | "update" | "remove"): void {}
