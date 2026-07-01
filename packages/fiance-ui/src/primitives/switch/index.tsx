'use client'
import React from 'react'
import { Switch as ExpoSwitch } from '@expo/ui'
import type { SwitchProps } from '@expo/ui'
import { useHostWrap } from '../_host/ForgeHost'

function Switch(props: SwitchProps) {
  // Host defaults to non-content-hugging sizing, which stretches this Toggle to
  // fill the remaining width of its flex-row (overflow). matchContents hugs both
  // axes to the control's intrinsic size, as in a trailing row toggle. alignSelf
  // centers it vertically in the row — a matchContents Host doesn't reliably
  // inherit the parent's items-center on its own.
  return useHostWrap(<ExpoSwitch {...props} />, {
    matchContents: true,
    style: { alignSelf: 'center' },
  })
}

Switch.displayName = 'Switch'

export { Switch }
export type { SwitchProps }
