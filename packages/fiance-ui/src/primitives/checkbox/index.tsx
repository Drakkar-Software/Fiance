'use client'
import React from 'react'
import { Checkbox as ExpoCheckbox } from '@expo/ui'
import type { CheckboxProps } from '@expo/ui'
import { useHostWrap } from '../_host/ForgeHost'

function Checkbox(props: CheckboxProps) {
  return useHostWrap(<ExpoCheckbox {...props} />)
}

Checkbox.displayName = 'Checkbox'

export { Checkbox }
export type { CheckboxProps }
