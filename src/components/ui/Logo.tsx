import Image from 'next/image'
import Link from 'next/link'
import { SITE_CONFIG } from '@/lib/config'

interface LogoProps {
  variant?: 'primary' | 'with-signature'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  href?: string
  className?: string
}

const sizeClasses = {
  sm: 'h-8',
  md: 'h-12',
  lg: 'h-16',
  xl: 'h-24',
}

export function Logo({ variant = 'primary', size = 'md', href = '/', className = '' }: LogoProps) {
  const imageSrc = variant === 'primary' ? '/images/logo-primary.jpg' : '/images/logo-with-signature.jpg'
  const sizeClass = sizeClasses[size]

  const logoImage = (
    <div className={`relative ${sizeClass} w-auto ${className}`}>
      <Image
        src={imageSrc}
        alt={`${SITE_CONFIG.name} - Barbier professionnel`}
        width={400}
        height={100}
        className="h-full w-auto object-contain"
        priority
        quality={90}
        sizes="(max-width: 640px) 150px, (max-width: 768px) 200px, 250px"
      />
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="block transition-opacity hover:opacity-80">
        {logoImage}
      </Link>
    )
  }

  return logoImage
}
