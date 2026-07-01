import React from 'react'
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

type CardProps = React.ComponentPropsWithoutRef<'div'> & {
  className?: string
  size?: keyof typeof sizeClasses
  variant?: keyof typeof variantClasses
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, size = 'md', variant = 'elevated', ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col relative z-0', sizeClasses[size], variantClasses[variant], className)}
      {...props}
    />
  ),
)

Card.displayName = 'Card'
export { Card }
