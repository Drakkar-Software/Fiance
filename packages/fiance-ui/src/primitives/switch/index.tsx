'use client'
import React from 'react'
import { Platform } from 'react-native'
import { Switch as ExpoSwitch } from '@expo/ui'
import type { SwitchProps } from '@expo/ui'
import { labelsHidden } from '@expo/ui/swift-ui/modifiers'
import { useHostWrap } from '../_host/ForgeHost'

function Switch({ modifiers, ...props }: SwitchProps) {
  // Host defaults to non-content-hugging sizing, which stretches this Toggle to
  // fill the remaining width of its flex-row (overflow). matchContents hugs both
  // axes to the control's intrinsic size, as in a trailing row toggle. alignSelf
  // centers it vertically in the row — a matchContents Host doesn't reliably
  // inherit the parent's items-center on its own.
  //
  // @expo/ui's Switch renders a SwiftUI `Toggle`. Without `.labelsHidden()` the
  // Toggle reserves its (empty) label's typographic line box, so the visible
  // switch top-aligns inside a box taller than itself — it reads as vertically
  // "high" in a centered row, and neither matchContents nor alignSelf can undo
  // that internal offset. labelsHidden() drops the label so the measured box
  // hugs the switch itself and centers cleanly. iOS-only: it's a SwiftUI
  // modifier config; Android (Compose) / web don't have the bug and must not
  // be handed a modifier their native layer doesn't recognize.
  const merged = Platform.OS === 'ios' ? [...(modifiers ?? []), labelsHidden()] : modifiers
  return useHostWrap(<ExpoSwitch {...props} modifiers={merged} />, {
    matchContents: true,
    style: { alignSelf: 'center' },
  })
}

Switch.displayName = 'Switch'

export { Switch }
export type { SwitchProps }
