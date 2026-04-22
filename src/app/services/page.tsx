'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Clock, Calendar } from 'lucide-react'
import FloatingNav from '@/components/navigation/FloatingNav'
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

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/services')
      .then((r) => r.json())
      .then((data) => {
        const all = (data.services || data) as Service[]
        setServices(all.filter((s) => s.isActive))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const byCategory = services.reduce<Record<string, Service[]>>((acc, s) => {
    acc[s.category] = [...(acc[s.category] || []), s]
    return acc
  }, {})

  return (
    <div className="min-h-screen flex flex-col bg-background-primary text-label-primary">
      <FloatingNav />

      <main className="flex-1 px-4 py-20 pt-24 mx-auto w-full max-w-7xl">
        <div className="text-center mb-14">
          <h1 className="ios-title-1 text-label-primary mb-2">Nos Prestations</h1>
          <p className="ios-body text-label-secondary">
            Choisissez votre prestation et réservez en ligne
          </p>
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
          </div>
        )}

        {Object.entries(byCategory).map(([cat, svcs]) => (
          <div key={cat} className="mb-12">
            {Object.keys(byCategory).length > 1 && (
              <h2 className="text-xs font-bold tracking-widest uppercase mb-6 text-accent">{cat}</h2>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {svcs.map((s) => (
                <div
                  key={s.id}
                  className="bg-ios-elevated rounded-2xl p-6 border border-ios-separator/20 hover:border-accent/30 transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="ios-headline text-label-primary">{s.name}</h3>
                    <span className="font-bold text-lg ml-3 shrink-0 text-accent">
                      {formatPrice(s.price)}
                    </span>
                  </div>
                  {s.description && (
                    <p className="ios-subheadline text-label-secondary leading-relaxed mb-4">
                      {s.description}
                    </p>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1.5 text-label-tertiary ios-footnote">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDuration(s.durationMin)}
                    </span>
                    <Link
                      href="/booking"
                      className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl bg-accent text-white hover:opacity-90 active:scale-[0.97] transition-all"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      Réserver
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </main>

      <Footer />
    </div>
  )
}
