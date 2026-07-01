'use client'
import React from 'react'
import { Checkbox as ExpoCheckbox } from '@expo/ui'
import type { CheckboxProps } from '@expo/ui'
import { useHostWrap } from '../_host/ForgeHost'

function Checkbox(props: CheckboxProps) {
  // Same fix as Switch: both render @expo/ui's Toggle and share the same
  // stretch-to-fill-row overflow bug without an explicit matchContents hint,
  // plus the same vertical-centering nudge (see switch/index.tsx).
  return useHostWrap(<ExpoCheckbox {...props} />, {
    matchContents: true,
    style: { alignSelf: 'center' },
  })
}

Checkbox.displayName = 'Checkbox'

export { Checkbox }
export type { CheckboxProps }
