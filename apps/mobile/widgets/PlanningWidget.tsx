import { VStack, HStack, Text, Image, Spacer } from "@expo/ui/swift-ui";
import {
  font,
  foregroundStyle,
  padding,
  frame,
  lineLimit,
  containerBackground,
  widgetURL,
} from "@expo/ui/swift-ui/modifiers";
import { createWidget, type WidgetEnvironment } from "expo-widgets";
import type { WidgetData } from "@/lib/widget-data";

// iOS home-screen widget mirroring the home dashboard summary (countdown +
// warnings/agenda/tasks). This file is ONLY ever reached through the iOS-only
// `lib/widget.ios.ts` bridge — never import it from cross-platform code, because
// `@expo/ui/swift-ui` eagerly requires the native ExpoUI module and crashes web.
//
// IMPORTANT: the `'widget'` directive (babel-preset-expo widgets-plugin) replaces
// the function below with a STRING of its own source, evaluated natively inside
// the widget extension. So the function must be fully self-contained — every
// color/number is inlined as a literal, and it references only the injected
// `@expo/ui/swift-ui` components/modifiers. No outer identifiers, no imported
// constants, no shared helpers (they would be undefined at native eval time).

function PlanningWidgetView(props: WidgetData, environment: WidgetEnvironment) {
  "widget";
  const capacity =
    environment.widgetFamily === "systemSmall"
      ? 2
      : environment.widgetFamily === "systemLarge"
        ? 8
        : 4;
  const isSmall = environment.widgetFamily === "systemSmall";
  const lines = (props.lines ?? []).slice(0, capacity);

  return (
    <VStack
      alignment="leading"
      spacing={isSmall ? 5 : 7}
      modifiers={[
        padding({ all: 16 }),
        containerBackground("#fdfaf1", "widget"),
        widgetURL("fiance://"),
      ]}
    >
      <Text modifiers={[font({ size: isSmall ? 24 : 28, weight: "bold" }), foregroundStyle("#b96a4a")]}>
        {props.title || "Fiancé"}
      </Text>
      {props.subtitle ? (
        <Text modifiers={[font({ size: 12 }), foregroundStyle("#8a8373"), lineLimit(1)]}>
          {props.subtitle}
        </Text>
      ) : null}

      {lines.length === 0 ? (
        <Text modifiers={[font({ size: 13 }), foregroundStyle("#8a8373")]}>{props.empty}</Text>
      ) : (
        lines.map((line, i) => (
          <HStack key={i} spacing={7} modifiers={[frame({ maxWidth: Infinity, alignment: "leading" })]}>
            <Image systemName={line.icon as never} size={12} color="#b96a4a" />
            <Text modifiers={[font({ size: 13 }), foregroundStyle("#2a2418"), lineLimit(1)]}>
              {line.text}
            </Text>
          </HStack>
        ))
      )}
      <Spacer />
    </VStack>
  );
}

export const PlanningWidget = createWidget<WidgetData>("PlanningWidget", PlanningWidgetView);
