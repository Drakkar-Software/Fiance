'use client'
import React from 'react'
import { Button as ExpoButton } from '@expo/ui'
import type { ButtonProps } from '@expo/ui'
import { useHostWrap } from '../_host/ForgeHost'

interface FianceButtonProps extends ButtonProps {
  /** Stretch to fill the container's width (stacked/column or flex-1 half-width
   * button rows). Default hugs the label, matching @expo/ui's own canonical
   * pattern — a size-less Host does NOT reliably fill its RN parent in practice. */
  fill?: boolean
}

function Button({ fill = false, ...props }: FianceButtonProps) {
  return useHostWrap(
    <ExpoButton {...props} />,
    fill
      ? { matchContents: { vertical: true }, style: { width: '100%' } }
      : { matchContents: true }
  )
}

Button.displayName = 'Button'

export { Button }
export type { ButtonProps, FianceButtonProps }
