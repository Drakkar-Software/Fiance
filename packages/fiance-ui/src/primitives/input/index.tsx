'use client'
import React, { useEffect } from 'react'
import { TextInput as ExpoTextInput, useNativeState } from '@expo/ui'
import type { TextInputProps as ExpoTextInputProps } from '@expo/ui'
import { useForgeTheme } from '../../theme/context'
import { useHostWrap } from '../_host/ForgeHost'

interface TextInputProps
  extends Omit<ExpoTextInputProps, 'value' | 'defaultValue' | 'onChangeText'> {
  value: string
  onChangeText: (text: string) => void
}

/**
 * RN-style string binding over @expo/ui's `TextInput`, whose native `value` is an
 * `ObservableState` rather than a plain string. Typed input round-trips through
 * `onChangeText` as usual; externally-set `value` changes are synced into the
 * shared native state on iOS/Android. On web this sync depends on the underlying
 * component's own re-render, so external updates may lag one render behind typing.
 */
function TextInput({ value, onChangeText, selectionColor, cursorColor, ...rest }: TextInputProps) {
  const { colors } = useForgeTheme()
  const state = useNativeState(value)

  useEffect(() => {
    state.value = value
  }, [value, state])

  const element = (
    <ExpoTextInput
      {...rest}
      value={state}
      onChangeText={onChangeText}
      selectionColor={selectionColor ?? colors.primary}
      cursorColor={cursorColor ?? colors.primary}
    />
  )
  // Host defaults to non-content-hugging sizing on all axes, which collapses this
  // field's RN-side view to zero effective size. matchContents.vertical hugs height
  // to content while still filling the row's width — the doc-recommended pattern.
  return useHostWrap(element, { matchContents: { vertical: true } })
}

TextInput.displayName = 'TextInput'

export { TextInput, TextInput as Input }
export type { TextInputProps, TextInputProps as InputProps }
