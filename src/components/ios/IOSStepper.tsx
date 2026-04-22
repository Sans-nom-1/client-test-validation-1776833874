'use client'

import { cn } from '@/lib/utils'

interface IOSStepperProps {
  steps: string[]
  currentStep: number
  className?: string
}

export function IOSStepper({ steps, currentStep, className }: IOSStepperProps) {
  return (
    <div className={cn('flex items-center justify-center gap-0', className)}>
      {steps.map((label, index) => {
        const isActive = index === currentStep
        const isCompleted = index < currentStep

        return (
          <div key={index} className="flex items-center">
            {/* Step number + label */}
            <div className="flex flex-col items-center">
              {/* Number - iOS Blue for active */}
              <span
                className={cn(
                  'text-[20px] font-semibold transition-colors',
                  isActive ? 'text-primary' : isCompleted ? 'text-label-primary' : 'text-label-tertiary'
                )}
              >
                {index + 1}
              </span>

              {/* Label */}
              <span
                className={cn(
                  'ios-caption-1 mt-1 transition-colors',
                  isActive ? 'text-primary' : isCompleted ? 'text-label-secondary' : 'text-label-tertiary'
                )}
              >
                {label}
              </span>
            </div>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'w-16 h-[1px] mx-4 mb-5 transition-colors',
                  isCompleted ? 'bg-gray-1' : 'bg-gray-3'
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
