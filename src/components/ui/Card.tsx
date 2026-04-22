import { cn } from '@/lib/utils'
import { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean
  selected?: boolean
}

export function Card({ className, hover = false, selected = false, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-card border border-white/10 bg-surface-700 p-5 transition-all duration-200',
        hover && 'cursor-pointer hover:bg-surface-600 hover:border-white/15 active:scale-[0.99]',
        selected && 'border-primary bg-primary/10',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mb-3', className)} {...props} />
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('text-base font-semibold text-white', className)} {...props} />
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm text-white/60', className)} {...props} />
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('', className)} {...props} />
}
