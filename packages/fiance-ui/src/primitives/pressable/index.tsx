import React from 'react'
import { Pressable as RNPressable } from 'react-native-css/components'
import type { PressableProps } from 'react-native'
import { cn } from '../../utils/cn'

type IPressableProps = PressableProps & { className?: string }

const Pressable = React.forwardRef<
  React.ElementRef<typeof RNPressable>,
  IPressableProps
>(({ className, ...props }, ref) => (
  <RNPressable
    ref={ref}
    className={cn(
      'data-[focus-visible=true]:web:outline-none data-[disabled=true]:opacity-40',
      className,
    )}
    {...props}
  />
))

Pressable.displayName = 'Pressable'
export { Pressable }
