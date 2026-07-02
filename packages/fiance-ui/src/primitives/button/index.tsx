'use client'
import React from 'react'
import { Platform } from 'react-native'
import { Button as ExpoButton } from '@expo/ui'
import type { ButtonProps } from '@expo/ui'
import { frame } from '../_host/modifiers'
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
}

function Button({ fill = false, modifiers, style, ...props }: FianceButtonProps) {
  const mergedModifiers = fill
    ? [frame({ maxWidth: Infinity }), ...(modifiers ?? [])]
    : modifiers
  const platformStyle = Platform.OS === 'android' ? androidStripVerticalPadding(style) : style
  return useHostWrap(
    <ExpoButton {...props} style={platformStyle} modifiers={mergedModifiers} />,
    fill
      ? { matchContents: { vertical: true } }
      : { matchContents: true }
  )
}

Button.displayName = 'Button'

export { Button }
export type { ButtonProps, FianceButtonProps }
