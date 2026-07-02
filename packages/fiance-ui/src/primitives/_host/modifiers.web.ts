// Web stubs for the SwiftUI modifiers used across fiance-ui. See modifiers.ts
// for why this split exists: '@expo/ui/swift-ui/modifiers' calls
// requireNativeModule('ExpoUI') at import time and there is no web binding, so
// the web bundle must never evaluate it. The @expo/ui universal web fallbacks
// (Button/Switch/Checkbox) don't read the `modifiers` prop, so these no-ops
// never affect web rendering.
const noop = (..._args: unknown[]) => ({}) as never

export const frame = noop
export const foregroundStyle = noop
export const minimumScaleFactor = noop
export const labelsHidden = noop
