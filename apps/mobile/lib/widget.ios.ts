import { PlanningWidget } from "@/widgets/PlanningWidget";
import { buildWidgetData } from "@/lib/widget-data";

// Fire-and-forget: push the latest dashboard summary into the iOS widget.
// Importing PlanningWidget here (iOS bundle only) both registers the widget
// layout and gives us the updateSnapshot handle. Never throws — a widget
// refresh must never break the app.
export function updateWidget(): void {
  try {
    PlanningWidget.updateSnapshot(buildWidgetData());
  } catch {
    // ignore
  }
}
