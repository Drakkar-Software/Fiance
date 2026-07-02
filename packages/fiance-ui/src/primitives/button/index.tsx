'use client'
import React from 'react'
import { Button as ExpoButton } from '@expo/ui'
import type { ButtonProps } from '@expo/ui'
import { frame } from '../_host/modifiers'
import { useHostWrap } from '../_host/ForgeHost'

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

function Button({ fill = false, modifiers, ...props }: FianceButtonProps) {
  const mergedModifiers = fill
    ? [frame({ maxWidth: Infinity }), ...(modifiers ?? [])]
    : modifiers
  return useHostWrap(
    <ExpoButton {...props} modifiers={mergedModifiers} />,
    fill
      ? { matchContents: { vertical: true } }
      : { matchContents: true }
  )
}

Button.displayName = 'Button'

export { Button }
export type { ButtonProps, FianceButtonProps }
