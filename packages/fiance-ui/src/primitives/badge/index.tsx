import React, { createContext, useContext } from 'react'
import { Text, View } from 'react-native-css/components'
import { cn } from '../../utils/cn'

type BadgeAction = 'error' | 'warning' | 'success' | 'info' | 'muted'
type BadgeVariant = 'solid' | 'outline'
type BadgeSize = 'sm' | 'md' | 'lg'

const BadgeContext = createContext<{
  action: BadgeAction
  variant: BadgeVariant
  size: BadgeSize
}>({ action: 'muted', variant: 'solid', size: 'md' })

const actionClasses: Record<BadgeAction, string> = {
  error: 'bg-background-error border-error-300',
  warning: 'bg-background-warning border-warning-300',
  success: 'bg-background-success border-success-300',
  info: 'bg-background-info border-info-300',
  muted: 'bg-background-muted border-background-300',
}

const textActionClasses: Record<BadgeAction, string> = {
  error: 'text-error-600',
  warning: 'text-warning-600',
  success: 'text-success-600',
  info: 'text-info-600',
  muted: 'text-background-800',
}

const textSizeClasses: Record<BadgeSize, string> = {
  sm: 'text-2xs',
  md: 'text-xs',
  lg: 'text-sm',
}

const iconSizeClasses: Record<BadgeSize, string> = {
  sm: 'h-3 w-3',
  md: 'h-3.5 w-3.5',
  lg: 'h-4 w-4',
}

const iconNumericSizeMap: Record<BadgeSize, number> = {
  sm: 12,
  md: 14,
  lg: 16,
}

type BadgeProps = React.ComponentPropsWithoutRef<typeof View> & {
  className?: string
  action?: BadgeAction
  variant?: BadgeVariant
  size?: BadgeSize
}

const Badge = ({
  children,
  action = 'muted',
  variant = 'solid',
  size = 'md',
  className,
  ...props
}: BadgeProps) => (
  <BadgeContext.Provider value={{ action, variant, size }}>
    <View
      className={cn(
        'flex-row items-center rounded-sm data-[disabled=true]:opacity-50 px-2 py-1',
        actionClasses[action],
        variant === 'outline' && 'border',
        className,
      )}
      {...props}
    >
      {children}
    </View>
  </BadgeContext.Provider>
)

type BadgeTextProps = React.ComponentPropsWithoutRef<typeof Text> & {
  className?: string
  size?: BadgeSize
}

const BadgeText = React.forwardRef<React.ElementRef<typeof Text>, BadgeTextProps>(
  ({ children, className, size: sizeProp, ...props }, ref) => {
    const { size: parentSize, action } = useContext(BadgeContext)
    const size = sizeProp || parentSize
    return (
      <Text
        ref={ref}
        className={cn(
          'text-typography-700 font-body font-normal tracking-normal uppercase',
          textActionClasses[action],
          textSizeClasses[size],
          className,
        )}
        {...props}
      >
        {children}
      </Text>
    )
  },
)

type BadgeIconProps = {
  className?: string
  as?: React.ElementType
  size?: number | BadgeSize
  [key: string]: any
}

const BadgeIcon = React.forwardRef<unknown, BadgeIconProps>(
  ({ className, as: IconComponent, size: sizeProp, ...props }, ref) => {
    const { size: parentSize, action } = useContext(BadgeContext)

    if (!IconComponent) return null

    const resolvedSize =
      typeof sizeProp === 'number'
        ? sizeProp
        : typeof sizeProp === 'string'
          ? iconNumericSizeMap[sizeProp as BadgeSize]
          : iconNumericSizeMap[parentSize]

    const sizeClass =
      typeof sizeProp === 'string'
        ? iconSizeClasses[sizeProp as BadgeSize]
        : !sizeProp
          ? iconSizeClasses[parentSize]
          : undefined

    const AnyIcon = IconComponent as React.ComponentType<any>
    return (
      <AnyIcon
        ref={ref}
        className={cn(
          'fill-none',
          textActionClasses[action],
          sizeClass,
          className,
        )}
        size={resolvedSize}
        {...props}
      />
    )
  },
)

Badge.displayName = 'Badge'
BadgeText.displayName = 'BadgeText'
BadgeIcon.displayName = 'BadgeIcon'

export { Badge, BadgeIcon, BadgeText }
