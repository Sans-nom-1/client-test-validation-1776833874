'use client'

import { Clock, ChevronRight } from 'lucide-react'

interface ServiceCardProps {
  id: string
  name: string
  description: string
  durationMin: number
  price: number
  isSelected?: boolean
  onSelect: (id: string) => void
}

export default function ServiceCard({
  id,
  name,
  description,
  durationMin,
  price,
  isSelected = false,
  onSelect,
}: ServiceCardProps) {
  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h${mins}` : `${hours}h`
  }

  return (
    <button
      onClick={() => onSelect(id)}
      className={`group w-full text-left transition-all duration-300 ${
        isSelected
          ? 'scale-[1.02]'
          : 'hover:scale-[1.01]'
      }`}
    >
      <div
        className={`relative overflow-hidden rounded-2xl p-5 transition-all duration-300 ${
          isSelected
            ? 'bg-accent shadow-lg shadow-accent/20'
            : 'bg-[#1c1c1e] hover:bg-[#252528]'
        }`}
      >
        {/* Selection indicator */}
        <div
          className={`absolute top-0 left-0 w-1 h-full transition-all duration-300 ${
            isSelected ? 'bg-black/20' : 'bg-transparent'
          }`}
        />

        <div className="flex items-start justify-between gap-4">
          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3
              className={`text-[17px] font-semibold truncate transition-colors ${
                isSelected ? 'text-black' : 'text-white'
              }`}
            >
              {name}
            </h3>
            <p
              className={`text-[14px] mt-1 line-clamp-2 transition-colors ${
                isSelected ? 'text-black/70' : 'text-white/50'
              }`}
            >
              {description}
            </p>

            {/* Duration */}
            <div
              className={`flex items-center gap-1.5 mt-3 transition-colors ${
                isSelected ? 'text-black/60' : 'text-white/40'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span className="text-[13px]">{formatDuration(durationMin)}</span>
            </div>
          </div>

          {/* Price & Action */}
          <div className="flex flex-col items-end justify-between h-full">
            <span
              className={`text-[18px] font-bold transition-colors ${
                isSelected ? 'text-black' : 'text-accent'
              }`}
            >
              {price}€
            </span>

            <div
              className={`mt-4 w-8 h-8 flex items-center justify-center rounded-full transition-all ${
                isSelected
                  ? 'bg-black/20 text-black'
                  : 'bg-white/5 text-white/40 group-hover:bg-accent group-hover:text-black'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </button>
  )
}
