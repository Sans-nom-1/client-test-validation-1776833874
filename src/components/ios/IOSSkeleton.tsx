'use client'

import { cn } from '@/lib/utils'

interface IOSSkeletonProps {
  className?: string
  variant?: 'rectangular' | 'circular' | 'text'
}

export function IOSSkeleton({ className, variant = 'rectangular' }: IOSSkeletonProps) {
  return (
    <div
      className={cn(
        'bg-surface-elevated animate-pulse',
        variant === 'circular' && 'rounded-full',
        variant === 'rectangular' && 'rounded-md',
        variant === 'text' && 'rounded-sm h-4',
        className
      )}
    />
  )
}

// Pre-built skeleton patterns
export function IOSListRowSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 min-h-touch">
      <IOSSkeleton variant="circular" className="w-6 h-6 shrink-0" />
      <div className="flex-1 space-y-1">
        <IOSSkeleton variant="text" className="w-3/4" />
        <IOSSkeleton variant="text" className="w-1/2" />
      </div>
      <IOSSkeleton variant="text" className="w-12" />
    </div>
  )
}

export function IOSCardSkeleton() {
  return (
    <div className="bg-surface-elevated rounded-md p-4 space-y-3">
      <IOSSkeleton variant="text" className="w-1/3 h-5" />
      <IOSSkeleton variant="text" className="w-full" />
      <IOSSkeleton variant="text" className="w-2/3" />
    </div>
  )
}

export function IOSTimeSlotsSkeleton() {
  return (
    <div className="grid grid-cols-4 gap-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <IOSSkeleton key={i} className="h-10" />
      ))}
    </div>
  )
}

export function IOSPageSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <IOSSkeleton className="h-8 w-32" />
      <IOSCardSkeleton />
      <IOSCardSkeleton />
      <IOSCardSkeleton />
    </div>
  )
}
