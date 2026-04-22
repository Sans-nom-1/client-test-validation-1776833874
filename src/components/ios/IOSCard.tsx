'use client'

import { cn } from '@/lib/utils'

interface IOSCardProps {
  variant?: 'elevated' | 'grouped' | 'blur' | 'transparent'
  children: React.ReactNode
  className?: string
  noPadding?: boolean
}

export function IOSCard({
  variant = 'elevated',
  children,
  className,
  noPadding = false
}: IOSCardProps) {
  const variants = {
    // iOS Elevated card (secondary background)
    elevated: 'bg-background-secondary border border-gray-4/50',
    // iOS Grouped card (tertiary background)
    grouped: 'bg-background-tertiary border border-gray-4/30',
    // iOS Blur card (backdrop blur)
    blur: 'bg-background-secondary/80 backdrop-blur-xl border border-gray-4/50 shadow-[0_8px_30px_rgba(0,0,0,0.12)]',
    // Transparent
    transparent: 'bg-transparent',
  }

  return (
    <div
      className={cn(
        'rounded-[16px]',
        variants[variant],
        !noPadding && 'p-4',
        className
      )}
    >
      {children}
    </div>
  )
}
