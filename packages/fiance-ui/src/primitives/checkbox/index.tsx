'use client'
import React from 'react'
import { Platform } from 'react-native'
import { Checkbox as ExpoCheckbox } from '@expo/ui'
import type { CheckboxProps } from '@expo/ui'
import { labelsHidden } from '../_host/modifiers'
import { useHostWrap } from '../_host/ForgeHost'

function Checkbox({ modifiers, ...props }: CheckboxProps) {
  // Same fix as Switch: both render @expo/ui's Toggle and share the same
  // stretch-to-fill-row overflow bug without an explicit matchContents hint,
  // plus the same vertical-centering nudge and the iOS labelsHidden() that stops
  // the empty-label line box from pushing the control high (see switch/index.tsx).
  const merged = Platform.OS === 'ios' ? [...(modifiers ?? []), labelsHidden()] : modifiers
  return useHostWrap(<ExpoCheckbox {...props} modifiers={merged} />, {
    matchContents: true,
    style: { alignSelf: 'center' },
  })
}

Checkbox.displayName = 'Checkbox'

export { Checkbox }
export type { CheckboxProps }
