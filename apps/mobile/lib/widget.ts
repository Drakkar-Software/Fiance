// Default (web + Android) no-op. The iOS implementation lives in `widget.ios.ts`.
// Keeping the real (@expo/ui/swift-ui-importing) widget module behind this
// platform split is what stops it from entering the web/Android bundle, where
// `@expo/ui/swift-ui` crashes at load. Only ever import from "@/lib/widget".
export function updateWidget(): void {}
