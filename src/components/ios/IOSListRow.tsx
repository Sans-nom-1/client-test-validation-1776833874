'use client'

import { cn } from '@/lib/utils'
import { ChevronRight } from 'lucide-react'

interface IOSListRowProps {
  icon?: React.ReactNode
  title: string
  subtitle?: string
  value?: string | React.ReactNode
  showChevron?: boolean
  onClick?: () => void
  className?: string
}

export function IOSListRow({
  icon,
  title,
  subtitle,
  value,
  showChevron = false,
  onClick,
  className,
}: IOSListRowProps) {
  const Component = onClick ? 'button' : 'div'

  return (
    <Component
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 px-4 py-3 min-h-touch w-full text-left',
        onClick && 'active:bg-surface-hover transition-colors duration-fast',
        className
      )}
    >
      {icon && (
        <div className="w-6 h-6 flex items-center justify-center text-text-secondary shrink-0">
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-body-md text-text-primary truncate">{title}</p>
        {subtitle && (
          <p className="text-body-sm text-text-tertiary truncate">{subtitle}</p>
        )}
      </div>
      {value && (
        <div className="text-body-md text-text-secondary shrink-0">
          {value}
        </div>
      )}
      {showChevron && (
        <ChevronRight className="w-5 h-5 text-text-tertiary shrink-0" />
      )}
    </Component>
  )
}

export function IOSListGroup({
  title,
  children,
  className,
}: {
  title?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('space-y-1', className)}>
      {title && (
        <h3 className="px-4 text-label-sm uppercase text-text-tertiary tracking-wider">
          {title}
        </h3>
      )}
      <div className="bg-surface-elevated rounded-lg overflow-hidden divide-y divide-divider">
        {children}
      </div>
    </div>
  )
}
