import React from 'react'
import { View } from 'react-native-css/components'
import type { ViewProps } from 'react-native'
import { cn } from '../../utils/cn'

const sizeClasses: Record<string, string> = {
  sm: 'p-3 rounded',
  md: 'p-4 rounded-lg',
  lg: 'p-6 rounded-xl',
}

const variantClasses: Record<string, string> = {
  elevated: 'bg-background-0',
  outline: 'border border-outline-200',
  ghost: 'rounded-none',
  filled: 'bg-background-50',
}

type CardProps = ViewProps & {
  className?: string
  size?: keyof typeof sizeClasses
  variant?: keyof typeof variantClasses
}

const Card = React.forwardRef<React.ElementRef<typeof View>, CardProps>(
  ({ className, size = 'md', variant = 'elevated', ...props }, ref) => (
    <View
      ref={ref}
      className={cn(sizeClasses[size], variantClasses[variant], className)}
      {...props}
    />
  ),
)

Card.displayName = 'Card'
export { Card }
