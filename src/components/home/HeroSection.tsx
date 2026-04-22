'use client'

import { useRef, useEffect, useState } from 'react'
import Link from 'next/link'
import { Calendar, ChevronDown, Star, CalendarCheck, Clock, Instagram } from 'lucide-react'
import { getOpenStatus, type OpenStatus } from '@/lib/business-hours'
import { HERO_STATS, HERO_CONTENT, SITE_CONFIG, SITE_CREATION_YEAR } from '@/lib/config'

interface Stat {
  icon: React.ReactNode
  value: string
  label: string
}

export default function HeroSection() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isVideoLoaded, setIsVideoLoaded] = useState(false)
  const [status, setStatus] = useState<OpenStatus>({ isOpen: true, message: 'Ouvert maintenant' })
  const [heroStats, setHeroStats] = useState<{ averageRating: number; totalAppointments: number } | null>(null)

  // Fetch stats from API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/reviews')
        if (response.ok) {
          const data = await response.json()
          setHeroStats({
            averageRating: data.stats.averageRating,
            totalAppointments: data.stats.totalAppointments,
          })
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
      }
    }
    fetchStats()
  }, [])

  // Format appointments count - arrondi à la dizaine supérieure (e.g., 57 -> "60+", 123 -> "130+")
  const formatAppointmentsCount = (count: number): string => {
    if (count === 0) return '0+'
    const rounded = Math.ceil(count / 10) * 10
    return `${rounded}+`
  }

  // Build stats dynamically
  const stats: Stat[] = [
    {
      icon: <Star className="w-4 h-4" />,
      value: heroStats ? heroStats.averageRating.toFixed(1) : HERO_STATS.rating.value,
      label: HERO_STATS.rating.label
    },
    {
      icon: <CalendarCheck className="w-4 h-4" />,
      value: heroStats ? formatAppointmentsCount(heroStats.totalAppointments) : '10+',
      label: `RDV depuis ${SITE_CREATION_YEAR}`
    },
    { icon: <Clock className="w-4 h-4" />, value: HERO_STATS.responseTime.value, label: HERO_STATS.responseTime.label },
  ]

  // Gestion robuste de la vidéo
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const playVideo = () => {
      video.play().catch(() => {
        // Autoplay bloqué, on réessaie après interaction
      })
    }

    const handleCanPlay = () => {
      setIsVideoLoaded(true)
      playVideo()
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && video.paused) {
        playVideo()
      }
    }

    // Événements pour détecter quand la vidéo est prête
    video.addEventListener('canplay', handleCanPlay)
    video.addEventListener('loadeddata', handleCanPlay)

    // Relancer la vidéo quand on revient sur l'onglet
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Si la vidéo est déjà chargée (cache)
    if (video.readyState >= 3) {
      handleCanPlay()
    }

    // Forcer le chargement
    video.load()

    return () => {
      video.removeEventListener('canplay', handleCanPlay)
      video.removeEventListener('loadeddata', handleCanPlay)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  useEffect(() => {
    // Check status on mount and every minute
    const checkStatus = () => setStatus(getOpenStatus())
    checkStatus()
    const interval = setInterval(checkStatus, 60000)
    return () => clearInterval(interval)
  }, [])

  const scrollToBooking = () => {
    const bookingSection = document.getElementById('booking')
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background - Dark gradient */}
      <div className="absolute inset-0 z-0">
        {/* Fallback gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />

        {/* Video Background */}
        <div
          className={`absolute inset-0 transition-opacity duration-1000 ${
            isVideoLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          >
            <source src="/videos/hero.mp4" type="video/mp4" />
          </video>
        </div>

        {/* Dark Overlay - assombrit la vidéo pour lisibilité du texte */}
        <div className="absolute inset-0 bg-black/60" />
        {/* Gradient Overlay - fondu vers le bas */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 py-20 pt-32">
        <div className="flex flex-col items-center text-center">
          {/* Badge - Dynamic Open/Closed Status */}
          <div className={`inline-flex items-center gap-2 px-4 py-2 backdrop-blur-sm rounded-full mb-6 animate-ios-fade-in ${
            status.isOpen ? 'bg-white/10' : 'bg-red-500/10 border border-red-500/20'
          }`}>
            <span className={`w-2 h-2 rounded-full ${status.isOpen ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <span className={`text-[13px] font-medium ${status.isOpen ? 'text-white/80' : 'text-red-400'}`}>
              {status.message}
            </span>
          </div>

          {/* Main Title */}
          <h1 className="ios-large-title text-white mb-4 max-w-4xl animate-ios-fade-in" style={{ animationDelay: '100ms' }}>
            {HERO_CONTENT.title}
          </h1>

          {/* Subtitle */}
          <p className="ios-body text-white/80 mb-8 max-w-xl animate-ios-fade-in" style={{ animationDelay: '200ms' }}>
            {SITE_CONFIG.slogan}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 mb-12 animate-ios-fade-in" style={{ animationDelay: '300ms' }}>
            {/* Primary CTA - Réserver */}
            <button
              onClick={scrollToBooking}
              className="flex items-center justify-center gap-2 px-10 py-4 bg-[#1c1c1e] text-white rounded-2xl font-bold text-[17px] hover:bg-[#2c2c2e] active:scale-[0.98] transition-all min-w-[220px]"
              aria-label="Réserver un rendez-vous"
            >
              <Calendar className="w-5 h-5" />
              <span>Réserver</span>
            </button>
            {/* Secondary CTA - Contactez-moi (Instagram) */}
            <Link
              href={SITE_CONFIG.instagram ?? '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-10 py-4 bg-[#1c1c1e] text-white rounded-2xl font-bold text-[17px] hover:bg-[#2c2c2e] active:scale-[0.98] transition-all min-w-[220px]"
              aria-label="Nous contacter sur Instagram"
            >
              <Instagram className="w-5 h-5" />
              <span>Contactez-moi</span>
            </Link>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 sm:gap-8 animate-ios-fade-in" role="list" aria-label="Statistiques du salon" style={{ animationDelay: '400ms' }}>
            {stats.map((stat, index) => (
              <div key={index} className="flex flex-col items-center" role="listitem">
                <div className="flex items-center gap-1.5 text-accent mb-1">
                  <span aria-hidden="true">{stat.icon}</span>
                  <span className="text-[20px] font-bold text-white">{stat.value}</span>
                </div>
                <span className="text-[13px] text-white/70">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <button
        onClick={scrollToBooking}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-white/50 hover:text-white transition-colors animate-bounce"
        aria-label="Défiler vers le bas"
      >
        <span className="text-[12px] font-medium">Réserver</span>
        <ChevronDown className="w-5 h-5" />
      </button>
    </section>
  )
}
