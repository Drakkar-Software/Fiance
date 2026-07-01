'use client'
import React from 'react'
import { TextInput as RNTextInput, useColorScheme } from 'react-native'
import type { TextInputProps as RNTextInputProps, TextStyle } from 'react-native'
import { useForgeTheme } from '../../theme/context'

/**
 * Text input primitive, backed by react-native's `TextInput`.
 *
 * TRADEOFF / why not @expo/ui: this used to wrap @expo/ui's SwiftUI `TextField`
 * inside a themed `Host`. On iOS that field could not reliably become first
 * responder when hosted on a plain (non-sheet) screen — it showed its value but
 * taps never focused it, so nothing could be typed. The JS controlled binding
 * was verified sound (`useNativeState` returns a stable observable, external
 * `value` synced via effect), so the cause was native: a hosted SwiftUI control
 * inside an RN `ScrollView` loses the touch/responder arbitration to RN. That
 * isn't fixable from JS. A plain RN `TextInput` is guaranteed editable in every
 * context and platform (it's already what @expo/ui itself falls back to on web),
 * at the cost of SwiftUI-native text rendering — an acceptable trade for a field
 * that must accept input.
 *
 * The public prop/API and visual style are kept identical to the previous
 * primitive (`value: string` + `onChangeText`, plus the RN TextInput surface;
 * `textStyle` is preserved for back-compat and merged into `style`). `textAlign`
 * is only ever applied as the `textAlign` PROP here — never as a className — to
 * steer clear of the react-native-css 3.0.7 `textAlign`-class crash.
 */
interface TextInputProps
  extends Omit<RNTextInputProps, 'value' | 'defaultValue' | 'onChangeText'> {
  value: string
  onChangeText: (text: string) => void
  /**
   * Back-compat with the previous @expo/ui API, where text styling was a prop
   * separate from the container `style`. Merged into `style` (RN's TextInput
   * uses a single `style`).
   */
  textStyle?: TextStyle
}

function TextInput({
  value,
  onChangeText,
  selectionColor,
  cursorColor,
  style,
  textStyle,
  ...rest
}: TextInputProps) {
  const { colors } = useForgeTheme()
  const scheme = useColorScheme()

  return (
    <RNTextInput
      {...rest}
      value={value}
      onChangeText={onChangeText}
      selectionColor={selectionColor ?? colors.primary}
      cursorColor={cursorColor ?? colors.primary}
      style={[
        // Base: borderless/tight so it matches the previous field inside the
        // form rows that already provide their own spacing and separators. Text
        // color adapts to the scheme (Garden Press ink / paper) the way the
        // SwiftUI label color used to; callers can override via style/textStyle.
        { fontSize: 16, color: scheme === 'dark' ? '#f2ece0' : '#2a2418', padding: 0 },
        style,
        textStyle,
      ]}
    />
  )
}

TextInput.displayName = 'TextInput'

export { TextInput, TextInput as Input }
export type { TextInputProps, TextInputProps as InputProps }
