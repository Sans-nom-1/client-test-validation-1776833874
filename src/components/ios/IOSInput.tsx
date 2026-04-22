'use client'

import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

interface IOSInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

export const IOSInput = forwardRef<HTMLInputElement, IOSInputProps>(
  ({ label, error, helperText, className, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block ios-footnote text-label-secondary">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full py-[11px] px-4 bg-background-tertiary rounded-[10px]',
            'ios-body text-label-primary placeholder:text-label-tertiary',
            'border transition-all',
            'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20',
            error ? 'border-red' : 'border-gray-4',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            className
          )}
          {...props}
        />
        {error && (
          <p className="ios-caption-1 text-red">{error}</p>
        )}
        {helperText && !error && (
          <p className="ios-caption-2 text-label-tertiary">{helperText}</p>
        )}
      </div>
    )
  }
)

IOSInput.displayName = 'IOSInput'
