import { format } from "date-fns";

import type { AgendaEvent } from "@/db/schema";

/**
 * An agenda event is "upcoming" (shown in the home "à venir" list and the
 * widget) when it hasn't happened yet. A future date is always upcoming; a past
 * date never is. For an event dated today we also look at its time so that an
 * appointment that already finished earlier today drops off the list — an
 * all-day event (no time) stays visible for the whole day.
 */
export function isAgendaEventUpcoming(event: AgendaEvent, now: Date): boolean {
  const today = format(now, "yyyy-MM-dd");
  if (event.date > today) return true;
  if (event.date < today) return false;
  // Same day: keep all-day events, otherwise compare its end (or start) time.
  const relevantTime = event.endTime || event.time;
  if (!relevantTime) return true;
  return relevantTime >= format(now, "HH:mm");
}
