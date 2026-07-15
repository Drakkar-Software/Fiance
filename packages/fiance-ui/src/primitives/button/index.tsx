'use client'
import React from 'react'
import { Platform } from 'react-native'
import { Button as ExpoButton, Text as ExpoText } from '@expo/ui'
import type { ButtonProps } from '@expo/ui'
import { frame, foregroundStyle } from '../_host/modifiers'
import { useHostWrap } from '../_host/ForgeHost'

// Android (Jetpack Compose) Material buttons already carry an intrinsic
// min-height; the `paddingVertical` we tune for iOS's chrome-less `.plain`
// buttons stacks on top of it and makes them noticeably too tall (most visible
// on the full-width destructive button). Drop the vertical padding on Android
// and let Material own the height — iOS keeps its tuned padding untouched.
function androidStripVerticalPadding(
  style: FianceButtonProps['style'],
): FianceButtonProps['style'] {
  if (!style) return style
  const { padding, paddingVertical, paddingTop, paddingBottom, ...rest } =
    style as Record<string, unknown>
  // An all-sides `padding` also sets horizontal inset — preserve just that half.
  if (padding != null && (rest as Record<string, unknown>).paddingHorizontal == null) {
    ;(rest as Record<string, unknown>).paddingHorizontal = padding
  }
  return rest as FianceButtonProps['style']
}

interface FianceButtonProps extends ButtonProps {
  /** Stretch to fill the container's width (stacked/column or flex-1 half-width
   * button rows). Default hugs the label, matching @expo/ui's own canonical
   * pattern.
   *
   * NOTE: `UniversalStyle.width` (RN-style `style={{width:'100%'}}`) does NOT
   * work here — `transformStyle.ios.ts` casts `style.width` straight to
   * `number`, so a percentage string is silently a no-op. And even a correctly
   * sized Host wouldn't be enough on its own: the SwiftUI Button inside it
   * still needs its own modifier telling it to stretch to fill that box —
   * `@expo/ui`'s own ScrollView/BottomSheet internals use
   * `frame({ maxWidth: Infinity })` for exactly this ("fill available width"),
   * so that's the modifier applied here instead of a style prop. The Host
   * itself only needs `matchContents.vertical` — leaving horizontal unset lets
   * it take the parent's width via normal RN flex (`align-items: stretch`
   * column, or a `flex-1` wrapper), which the frame modifier then fills. */
  fill?: boolean
  /** Label text color for buttons drawn on a solid (clay/red) `backgroundColor`.
   * On iOS it's applied via the SwiftUI `foregroundStyle` modifier. On Android and
   * web that modifier is a no-op (Android: Compose keeps Material's dark default
   * content color; web: the shim stub ignores it) — invisible/low-contrast on our
   * fills either way — so on those two platforms the label is instead rendered as a
   * colored `@expo/ui` `Text` child (the universal Button uses `children` as its
   * content; the web fallback's default label color is a fixed blue, not our
   * accent's contrast color). Pass `colors.onPrimary`. */
  labelColor?: string
}

function Button({
  fill = false,
  labelColor,
  label,
  children,
  modifiers,
  style,
  ...props
}: FianceButtonProps) {
  const fillMod = fill ? [frame({ maxWidth: Infinity })] : []
  const userMods = modifiers ?? []
  const platformStyle = Platform.OS === 'android' ? androidStripVerticalPadding(style) : style

  // Android + web: `foregroundStyle` (SwiftUI) has no Compose/web equivalent and the
  // universal Button never forwards a content color, so a colored `Text` child is the
  // only way to set the label color. `Text` from `@expo/ui` is native Compose Text on
  // Android and a styled RN Text on web — both respect `textStyle.color`.
  const coloredLabelChild =
    Platform.OS !== 'ios' && labelColor != null && label != null && children == null

  // iOS forces the color via `foregroundStyle`.
  const colorMod = !coloredLabelChild && labelColor != null ? [foregroundStyle(labelColor)] : []

  const node = coloredLabelChild ? (
    <ExpoButton {...props} style={platformStyle} modifiers={[...fillMod, ...userMods]}>
      <ExpoText textStyle={{ color: labelColor }}>{label}</ExpoText>
    </ExpoButton>
  ) : (
    <ExpoButton
      {...props}
      label={label}
      style={platformStyle}
      modifiers={[...fillMod, ...colorMod, ...userMods]}
    >
      {children}
    </ExpoButton>
  )

  // One `useHostWrap` call (a hook) regardless of branch — the node is computed above.
  return useHostWrap(node, fill ? { matchContents: { vertical: true } } : { matchContents: true })
}

Button.displayName = 'Button'

export { Button }
export type { ButtonProps, FianceButtonProps }
