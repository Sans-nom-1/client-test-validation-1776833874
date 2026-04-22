'use client'

import { cn } from '@/lib/utils'
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react'

interface IOSAlertProps {
  variant?: 'info' | 'success' | 'warning' | 'error'
  title?: string
  children: React.ReactNode
  onDismiss?: () => void
  className?: string
}

export function IOSAlert({
  variant = 'info',
  title,
  children,
  onDismiss,
  className,
}: IOSAlertProps) {
  const variants = {
    info: {
      bg: 'bg-surface-elevated',
      border: 'border-l-accent',
      icon: <Info className="w-5 h-5 text-accent" />,
    },
    success: {
      bg: 'bg-success-muted',
      border: 'border-l-success',
      icon: <CheckCircle className="w-5 h-5 text-success" />,
    },
    warning: {
      bg: 'bg-warning-muted',
      border: 'border-l-warning',
      icon: <AlertTriangle className="w-5 h-5 text-warning" />,
    },
    error: {
      bg: 'bg-error-muted',
      border: 'border-l-error',
      icon: <AlertCircle className="w-5 h-5 text-error" />,
    },
  }

  const config = variants[variant]

  return (
    <div
      className={cn(
        'rounded-md p-4 border-l-4',
        config.bg,
        config.border,
        className
      )}
    >
      <div className="flex gap-3">
        <div className="shrink-0 mt-0.5">{config.icon}</div>
        <div className="flex-1 min-w-0">
          {title && (
            <p className="text-title-sm text-text-primary mb-1">
              {title}
            </p>
          )}
          <div className="text-body-md text-text-secondary">{children}</div>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="shrink-0 p-1 -m-1 text-text-tertiary hover:text-text-secondary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}
