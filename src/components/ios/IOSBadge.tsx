'use client'

import { cn } from '@/lib/utils'

interface IOSBadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'error' | 'accent'
  size?: 'sm' | 'md'
  className?: string
}

export function IOSBadge({
  children,
  variant = 'default',
  size = 'sm',
  className,
}: IOSBadgeProps) {
  const variants = {
    default: 'bg-ios-elevated-3 text-ios-secondary',
    success: 'bg-ios-success-muted text-ios-success',
    warning: 'bg-ios-warning-muted text-ios-warning',
    error: 'bg-ios-error-muted text-ios-error',
    accent: 'bg-ios-accent-muted text-ios-accent',
  }

  const sizes = {
    sm: 'px-2 py-0.5 text-ios-label-sm',
    md: 'px-ios-2 py-1 text-ios-label-md',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-ios-full font-medium',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  )
}
