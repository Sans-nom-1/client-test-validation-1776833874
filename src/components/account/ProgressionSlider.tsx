'use client'

import { useRef, useEffect } from 'react'
import { Lock, Check, Gift } from 'lucide-react'

interface Level {
  level: number
  requiredRdv: number
  isUnlocked: boolean
  isInProgress: boolean
  progress: number
  reward: string
}

interface ProgressionSliderProps {
  levels: Level[]
  currentLevel: number
  visitCount: number
  rdvToNextReward: number
}

export function ProgressionSlider({
  levels,
  currentLevel,
  visitCount,
  rdvToNextReward,
}: ProgressionSliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to current level on mount
  useEffect(() => {
    if (scrollRef.current && currentLevel > 0) {
      const levelWidth = 140 // Width of each level card + gap
      const scrollPosition = Math.max(0, (currentLevel - 1) * levelWidth - 20)
      scrollRef.current.scrollTo({ left: scrollPosition, behavior: 'smooth' })
    }
  }, [currentLevel])

  return (
    <div className="w-full">
      {/* Progress indicator */}
      <div className="px-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[13px] text-white/50">Progression</span>
          <span className="text-[13px] text-[#4CB0F1] font-medium">
            {visitCount} passage{visitCount > 1 ? 's' : ''}
          </span>
        </div>

        {/* Mini progress bar for current level */}
        <div className="relative h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#4CB0F1] to-[#4CB0F1]/70 rounded-full transition-all duration-700"
            style={{ width: `${levels[currentLevel]?.progress || 0}%` }}
          />
        </div>

        {rdvToNextReward > 0 && (
          <p className="mt-2 text-[12px] text-white/40 text-center">
            Encore {rdvToNextReward} passage{rdvToNextReward > 1 ? 's' : ''} pour le prochain palier
          </p>
        )}
      </div>

      {/* Horizontal scrollable slider */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-4 px-4 scrollbar-hide snap-x snap-mandatory"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {levels.map((level, index) => (
          <div
            key={level.level}
            className={`
              relative flex-shrink-0 w-[120px] snap-center
              ${level.isInProgress ? 'scale-105' : ''}
              transition-transform duration-300
            `}
          >
            {/* Connector line */}
            {index < levels.length - 1 && (
              <div className="absolute top-[44px] left-[60px] w-[calc(100%+12px)] h-[2px] z-0">
                <div
                  className={`h-full transition-all duration-500 ${
                    level.isUnlocked
                      ? 'bg-[#4CB0F1]'
                      : 'bg-white/10'
                  }`}
                />
              </div>
            )}

            {/* Level card */}
            <div
              className={`
                relative z-10 rounded-2xl p-4 text-center
                transition-all duration-300
                ${level.isUnlocked
                  ? 'bg-[#4CB0F1]/10 border border-[#4CB0F1]/30'
                  : level.isInProgress
                    ? 'bg-[#1c1c1e] border-2 border-[#4CB0F1] shadow-lg shadow-[#4CB0F1]/20'
                    : 'bg-[#1c1c1e] border border-white/5'
                }
              `}
            >
              {/* Level badge */}
              <div
                className={`
                  mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-3
                  transition-all duration-300
                  ${level.isUnlocked
                    ? 'bg-[#4CB0F1] shadow-lg shadow-[#4CB0F1]/30'
                    : level.isInProgress
                      ? 'bg-gradient-to-br from-[#4CB0F1]/20 to-[#4CB0F1]/5 border-2 border-[#4CB0F1]'
                      : 'bg-white/5 border border-white/10'
                  }
                `}
              >
                {level.isUnlocked ? (
                  <Check className="w-6 h-6 text-black" />
                ) : level.isInProgress ? (
                  <Gift className="w-6 h-6 text-[#4CB0F1]" />
                ) : (
                  <Lock className="w-5 h-5 text-white/30" />
                )}
              </div>

              {/* Level number */}
              <p className={`text-[15px] font-semibold mb-1 ${
                level.isUnlocked || level.isInProgress ? 'text-white' : 'text-white/40'
              }`}>
                Niveau {level.level}
              </p>

              {/* Required RDV */}
              <p className={`text-[12px] ${
                level.isUnlocked ? 'text-[#4CB0F1]' : 'text-white/30'
              }`}>
                {level.requiredRdv} passages
              </p>

              {/* Progress bar for in-progress level */}
              {level.isInProgress && (
                <div className="mt-3 h-1 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#4CB0F1] rounded-full transition-all duration-500"
                    style={{ width: `${level.progress}%` }}
                  />
                </div>
              )}

              {/* Status label */}
              {level.isUnlocked && (
                <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 bg-[#4CB0F1]/20 rounded-full">
                  <span className="text-[10px] font-medium text-[#4CB0F1]">Acquis</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Scroll hint */}
      <div className="flex justify-center gap-1 mt-2">
        {levels.slice(0, 5).map((_, i) => (
          <div
            key={i}
            className={`w-1.5 h-1.5 rounded-full transition-all ${
              i === currentLevel ? 'bg-[#4CB0F1] w-4' : 'bg-white/20'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
