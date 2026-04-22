'use client'

import { cn } from '@/lib/utils'

interface IOSTimeSlotProps {
  time: string
  selected?: boolean
  disabled?: boolean
  onSelect?: () => void
}

export function IOSTimeSlot({
  time,
  selected = false,
  disabled = false,
  onSelect,
}: IOSTimeSlotProps) {
  return (
    <button
      onClick={disabled ? undefined : onSelect}
      disabled={disabled}
      className={cn(
        'h-11 px-ios-3 rounded-ios-md text-ios-label-lg font-medium',
        'transition-all duration-ios-fast ease-ios',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ios-accent',
        selected
          ? 'bg-ios-accent text-white shadow-ios-glow'
          : disabled
            ? 'bg-ios-elevated text-ios-disabled cursor-not-allowed'
            : 'bg-ios-elevated-2 text-ios-primary active:bg-ios-elevated-3'
      )}
    >
      {time}
    </button>
  )
}

interface IOSTimeSlotsGridProps {
  slots: { time: string; available: boolean }[]
  selectedTime: string | null
  onSelectTime: (time: string) => void
  className?: string
}

export function IOSTimeSlotsGrid({
  slots,
  selectedTime,
  onSelectTime,
  className,
}: IOSTimeSlotsGridProps) {
  if (slots.length === 0) {
    return (
      <div className="py-ios-8 text-center">
        <p className="text-ios-secondary">Aucun créneau disponible</p>
      </div>
    )
  }

  return (
    <div className={cn('grid grid-cols-4 gap-ios-2', className)}>
      {slots.map((slot) => (
        <IOSTimeSlot
          key={slot.time}
          time={slot.time}
          selected={selectedTime === slot.time}
          disabled={!slot.available}
          onSelect={() => onSelectTime(slot.time)}
        />
      ))}
    </div>
  )
}
