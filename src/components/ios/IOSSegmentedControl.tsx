'use client'

import { cn } from '@/lib/utils'
import { useRef, useState, useEffect } from 'react'

interface IOSSegmentedControlProps {
  segments: string[]
  selectedIndex: number
  onChange: (index: number) => void
  className?: string
}

export function IOSSegmentedControl({
  segments,
  selectedIndex,
  onChange,
  className,
}: IOSSegmentedControlProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 })

  useEffect(() => {
    if (containerRef.current) {
      const buttons = containerRef.current.querySelectorAll('button')
      const activeButton = buttons[selectedIndex]
      if (activeButton) {
        setIndicatorStyle({
          left: activeButton.offsetLeft,
          width: activeButton.offsetWidth,
        })
      }
    }
  }, [selectedIndex, segments])

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative flex p-1 bg-surface-elevated rounded-md',
        className
      )}
    >
      {/* Sliding indicator */}
      <div
        className="absolute top-1 bottom-1 bg-surface-hover rounded-sm shadow-sm transition-all duration-normal ease-out-expo"
        style={{
          left: indicatorStyle.left,
          width: indicatorStyle.width,
        }}
      />

      {/* Segments */}
      {segments.map((segment, index) => (
        <button
          key={segment}
          onClick={() => onChange(index)}
          className={cn(
            'relative flex-1 py-2 px-3 text-label-md font-medium',
            'transition-colors duration-fast z-10',
            selectedIndex === index
              ? 'text-text-primary'
              : 'text-text-secondary'
          )}
        >
          {segment}
        </button>
      ))}
    </div>
  )
}
