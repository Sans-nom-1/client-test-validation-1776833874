'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Clock, ChevronRight, Calendar } from 'lucide-react'
import FloatingNav from '@/components/navigation/FloatingNav'
import HeroSection from '@/components/home/HeroSection'
import Footer from '@/components/Footer'

interface Service {
  id: string
  name: string
  description: string | null
  durationMin: number
  price: number
  category: string
  isActive: boolean
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(Number(price))
}

function formatDuration(min: number) {
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m > 0 ? `${h}h${m.toString().padStart(2, '0')}` : `${h}h`
}

export default function Home() {
  const [services, setServices] = useState<Service[]>([])

  useEffect(() => {
    fetch('/api/services')
      .then((r) => r.json())
      .then((data) => setServices((data.services || data).filter((s: Service) => s.isActive)))
      .catch(() => {})
  }, [])

  const preview = services.slice(0, 6)

  const byCategory = preview.reduce<Record<string, Service[]>>((acc, s) => {
    acc[s.category] = [...(acc[s.category] || []), s]
    return acc
  }, {})

  return (
    <div className="min-h-screen flex flex-col bg-background-primary text-label-primary">
      <FloatingNav />

      {/* Hero avec video */}
      <HeroSection />

      {/* Services */}
      {preview.length > 0 && (
        <section className="px-4 py-20 mx-auto w-full max-w-7xl" id="services">
          <div className="text-center mb-12">
            <h2 className="ios-title-1 text-label-primary mb-2">Nos Prestations</h2>
            <p className="ios-body text-label-secondary">
              {services.length} prestation{services.length > 1 ? 's' : ''} disponible{services.length > 1 ? 's' : ''}
            </p>
          </div>

          {Object.entries(byCategory).map(([cat, svcs]) => (
            <div key={cat} className="mb-10">
              {Object.keys(byCategory).length > 1 && (
                <p className="text-xs font-bold tracking-widest uppercase mb-5 text-accent">{cat}</p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {svcs.map((s) => (
                  <div
                    key={s.id}
                    className="group bg-ios-elevated rounded-2xl p-5 border border-ios-separator/20 hover:border-accent/30 transition-all duration-300"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-[17px] text-label-primary">{s.name}</h3>
                      <span className="font-bold text-lg ml-3 shrink-0 text-accent">
                        {formatPrice(s.price)}
                      </span>
                    </div>
                    {s.description && (
                      <p className="text-[14px] text-label-secondary leading-relaxed mb-3 line-clamp-2">
                        {s.description}
                      </p>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1.5 text-label-tertiary text-[13px]">
                        <Clock className="w-3.5 h-3.5" />
                        {formatDuration(s.durationMin)}
                      </span>
                      <Link
                        href="/booking"
                        className="flex items-center gap-1 text-[13px] font-semibold text-accent opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Réserver <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {services.length > 6 && (
            <div className="text-center mt-6">
              <Link
                href="/services"
                className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-2.5 rounded-full border border-ios-separator/30 text-accent hover:bg-ios-elevated transition-colors"
              >
                Voir toutes les prestations
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </section>
      )}

      {/* Booking CTA */}
      <section id="booking" className="py-20 px-4 text-center bg-ios-elevated">
        <div className="max-w-lg mx-auto">
          <h2 className="ios-title-1 text-label-primary mb-3">Prêt à réserver ?</h2>
          <p className="ios-body text-label-secondary mb-8">
            Choisissez votre prestation et réservez en quelques clics
          </p>
          <Link
            href="/booking"
            className="inline-flex items-center justify-center gap-2 px-10 py-4 bg-accent text-white rounded-2xl font-bold text-[17px] hover:opacity-90 active:scale-[0.98] transition-all"
          >
            <Calendar className="w-5 h-5" />
            Prendre rendez-vous
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
