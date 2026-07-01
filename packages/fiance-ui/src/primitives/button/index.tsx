'use client'
import React from 'react'
import { Button as ExpoButton } from '@expo/ui'
import type { ButtonProps } from '@expo/ui'
import { useHostWrap } from '../_host/ForgeHost'

function Button(props: ButtonProps) {
  return useHostWrap(<ExpoButton {...props} />)
}

Button.displayName = 'Button'

export { Button }
export type { ButtonProps }
