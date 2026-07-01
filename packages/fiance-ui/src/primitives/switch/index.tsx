'use client'
import React from 'react'
import { Switch as ExpoSwitch } from '@expo/ui'
import type { SwitchProps } from '@expo/ui'
import { useHostWrap } from '../_host/ForgeHost'

function Switch(props: SwitchProps) {
  return useHostWrap(<ExpoSwitch {...props} />)
}

Switch.displayName = 'Switch'

export { Switch }
export type { SwitchProps }
