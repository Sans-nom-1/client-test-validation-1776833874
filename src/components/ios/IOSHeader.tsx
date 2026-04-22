'use client'

import { cn } from '@/lib/utils'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'

interface IOSHeaderProps {
  title?: string
  backHref?: string
  backLabel?: string
  onBack?: () => void
  rightAction?: React.ReactNode
  transparent?: boolean
  className?: string
}

export function IOSHeader({
  title,
  backHref,
  backLabel = 'Retour',
  onBack,
  rightAction,
  transparent = false,
  className,
}: IOSHeaderProps) {
  const BackButton = () => {
    const content = (
      <span className="flex items-center gap-ios-1 text-ios-accent">
        <ChevronLeft className="w-5 h-5" />
        <span className="text-ios-body-lg">{backLabel}</span>
      </span>
    )

    if (backHref) {
      return (
        <Link href={backHref} className="active:opacity-70 transition-opacity">
          {content}
        </Link>
      )
    }

    if (onBack) {
      return (
        <button onClick={onBack} className="active:opacity-70 transition-opacity">
          {content}
        </button>
      )
    }

    return <div className="w-20" /> // Spacer
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-sticky',
        'pt-safe-top',
        transparent
          ? 'bg-transparent'
          : 'bg-ios-base/80 backdrop-blur-ios border-b border-ios-separator',
        className
      )}
    >
      <div className="flex items-center justify-between h-14 px-ios-4">
        <div className="flex-1 flex justify-start">
          <BackButton />
        </div>

        {title && (
          <h1 className="text-ios-title-md text-ios-primary font-semibold">
            {title}
          </h1>
        )}

        <div className="flex-1 flex justify-end">
          {rightAction}
        </div>
      </div>
    </header>
  )
}
