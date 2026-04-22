'use client'

import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

interface IOSButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'plain' | 'destructive' | 'white'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  haptic?: boolean
  children: React.ReactNode
}

export const IOSButton = forwardRef<HTMLButtonElement, IOSButtonProps>(
  ({ variant = 'primary', size = 'md', fullWidth = false, haptic = true, className, children, disabled, onClick, ...props }, ref) => {

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      // Haptic feedback léger sur mobile
      if (haptic && 'vibrate' in navigator) {
        navigator.vibrate(10)
      }
      onClick?.(e)
    }

    const variants = {
      // iOS Blue filled button
      primary: 'bg-primary text-white active:bg-primary-pressed',
      // iOS Secondary (gray background)
      secondary: 'bg-gray-5 text-primary active:bg-gray-4',
      // iOS Plain text button
      plain: 'text-primary active:opacity-40',
      // iOS Destructive
      destructive: 'bg-red/10 text-red active:bg-red/20',
      // White button (like confirm)
      white: 'bg-white text-black active:bg-white/90',
    }

    const sizes = {
      sm: 'h-9 px-3 ios-footnote',
      md: 'h-11 px-4 ios-headline',
      lg: 'h-[50px] px-6 ios-headline',
    }

    return (
      <button
        ref={ref}
        disabled={disabled}
        onClick={handleClick}
        className={cn(
          'inline-flex items-center justify-center',
          'rounded-[14px] transition-all duration-150',
          'min-h-[44px]', // Touch target minimum
          'disabled:opacity-40 disabled:pointer-events-none',
          'active:scale-[0.97]', // iOS bounce effect
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)

IOSButton.displayName = 'IOSButton'
