import React from "react";
import { Badge, BadgeText, BadgeIcon } from "../../primitives/badge";
import { Clock, AlertCircle } from "lucide-react-native";
import { differenceInDays, differenceInMonths, isPast, isToday } from "date-fns";

interface DeadlineLabels {
  today?: string;
  overdue?: string;
  /** Short suffix for days, e.g. "d" → "5d". Default: "d". */
  days?: string;
  /** Label for months, e.g. "mo" → "2 mo". Default: "mo". */
  months?: string;
}

interface DeadlineChipProps {
  date: string;
  labels?: DeadlineLabels;
}

export function DeadlineChip({ date, labels = {} }: DeadlineChipProps) {
  const { today: todayLabel = "Today", overdue: overdueLabel = "Overdue", days: daysLabel = "d", months: monthsLabel = "mo" } = labels;

  const target = new Date(date);
  const now = new Date();
  const days = differenceInDays(target, now);
  const months = differenceInMonths(target, now);

  let label: string;
  let action: "error" | "warning" | "info" | "muted";
  let useAlert = false;

  if (isToday(target)) {
    label = todayLabel;
    action = "error";
    useAlert = true;
  } else if (isPast(target)) {
    label = overdueLabel;
    action = "error";
    useAlert = true;
  } else if (days <= 7) {
    label = `${days}${daysLabel}`;
    action = "warning";
  } else if (days <= 30) {
    label = `${days}${daysLabel}`;
    action = "info";
  } else {
    label = `${months} ${monthsLabel}`;
    action = "muted";
  }

  return (
    <Badge action={action} size="sm" className="gap-1 rounded-full px-2 py-0.5">
      <BadgeIcon as={useAlert ? AlertCircle : Clock} size={11} />
      <BadgeText size="sm" className="normal-case font-medium">
        {label}
      </BadgeText>
    </Badge>
  );
}
