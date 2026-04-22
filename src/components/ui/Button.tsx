import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg' | 'full'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-button font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-900 disabled:pointer-events-none disabled:opacity-40',
          {
            // Primaire : fond bleu, texte noir (CTA principal)
            'bg-primary text-surface-900 hover:bg-primary-600 active:scale-[0.98]':
              variant === 'primary',
            // Secondaire : fond surface, texte blanc
            'bg-surface-600 text-white hover:bg-surface-500 active:scale-[0.98]':
              variant === 'secondary',
            // Outline : bordure fine, transparent
            'border border-white/15 bg-transparent text-white hover:bg-white/5 active:scale-[0.98]':
              variant === 'outline',
            // Ghost : aucun fond, juste texte
            'text-white/70 hover:text-white hover:bg-white/5':
              variant === 'ghost',
            'h-9 px-4 text-sm': size === 'sm',
            'h-11 px-5 text-base': size === 'md',
            'h-12 px-6 text-lg': size === 'lg',
            'h-14 w-full text-base': size === 'full',
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'

export { Button }
