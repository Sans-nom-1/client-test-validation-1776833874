'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Scissors, Sparkles, Package, Zap, Check, Clock } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/config'

interface Service {
  id: string
  name: string
  description: string
  durationMin: number
  price: number
  category: string
}

interface NextSlot {
  serviceId: string
  date: string
  time: string
  label: string
}

// Promotions configuration
const PROMOS: Record<string, { originalPrice: number; discount: number }> = {
  'coupe + barbe': { originalPrice: 25, discount: 20 },
  'coupe transformation + barbe': { originalPrice: 30, discount: 25 },
}

interface ServiceSelectionProps {
  salonId: string
  onSelect: (serviceId: string) => void
}

// Category icons mapping
const categoryIcons: Record<string, React.ReactNode> = {
  'Pilosité faciale': <Sparkles className="w-4 h-4" />,
  'Cheveux': <Scissors className="w-4 h-4" />,
  'Packs': <Package className="w-4 h-4" />,
}

export default function ServiceSelection({ salonId, onSelect }: ServiceSelectionProps) {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [activeFilter, setActiveFilter] = useState<string>('Tout')
  const [nextSlots, setNextSlots] = useState<Record<string, NextSlot>>({})
  const [loadingSlots, setLoadingSlots] = useState(false)

  useEffect(() => {
    setMounted(true)
    fetchServices()
    return () => setMounted(false)
  }, [salonId])

  // Fetch next available slots for all services
  useEffect(() => {
    if (services.length > 0) {
      fetchNextSlots()
    }
  }, [services])

  const fetchServices = async () => {
    try {
      const response = await fetch(`/api/services?salonId=${salonId}`)
      if (!response.ok) throw new Error('Failed to fetch services')
      const data = await response.json()
      setServices(data)
    } catch (error) {
      console.error('Error fetching services:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchNextSlots = async () => {
    setLoadingSlots(true)
    const slots: Record<string, NextSlot> = {}

    // Get next 7 days
    const dates: string[] = []
    for (let i = 0; i < 7; i++) {
      const date = new Date()
      date.setDate(date.getDate() + i)
      dates.push(date.toISOString().split('T')[0])
    }

    // Fetch slots for each service (limit concurrent requests)
    for (const service of services) {
      for (const date of dates) {
        try {
          const response = await fetch(`/api/slots?salonId=${salonId}&serviceId=${service.id}&date=${date}`)
          if (!response.ok) continue
          const slotsData = await response.json()
          const availableSlot = slotsData.find((s: { available: boolean }) => s.available)

          if (availableSlot) {
            const dateObj = new Date(date)
            const isToday = dateObj.toDateString() === new Date().toDateString()
            const isTomorrow = dateObj.toDateString() === new Date(Date.now() + 86400000).toDateString()

            let label = ''
            if (isToday) {
              label = `Aujourd'hui ${availableSlot.start}`
            } else if (isTomorrow) {
              label = `Demain ${availableSlot.start}`
            } else {
              const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
              label = `${dayNames[dateObj.getDay()]} ${availableSlot.start}`
            }

            slots[service.id] = {
              serviceId: service.id,
              date,
              time: availableSlot.start,
              label
            }
            break // Found a slot, move to next service
          }
        } catch (error) {
          console.error('Error fetching slots for service:', service.id, error)
        }
      }
    }

    setNextSlots(slots)
    setLoadingSlots(false)
  }

  // Check promo for a service
  const getPromo = (serviceName: string) => {
    const nameLower = serviceName.toLowerCase()
    for (const [key, promo] of Object.entries(PROMOS)) {
      if (nameLower.includes(key) || nameLower === key) {
        return promo
      }
    }
    return null
  }

  const formatDuration = (minutes: number): string => {
    return `${minutes} min`
  }

  const handleConfirm = () => {
    if (selectedId) {
      onSelect(selectedId)
    }
  }

  // Get selected service info for recap
  const selectedService = services.find(s => s.id === selectedId)

  // Bouton fixe en bas - rendu via Portal
  const FixedButton = () => {
    if (!mounted) return null

    return createPortal(
      <div
        className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-xl border-t border-white/10 z-[9999]"
        style={{ paddingBottom: 'calc(16px + env(safe-area-inset-bottom, 0px))' }}
      >
        <div className="max-w-[900px] mx-auto px-4 pt-4">
          <button
            onClick={handleConfirm}
            disabled={!selectedId}
            aria-disabled={!selectedId}
            className={`w-full py-5 rounded-2xl text-[17px] font-semibold transition-all ${
              selectedId
                ? 'bg-[#4CB0F1] text-black active:bg-[#3a9cd8] cursor-pointer shadow-lg shadow-[#4CB0F1]/20'
                : 'bg-white/10 text-white/40 cursor-not-allowed opacity-60'
            }`}
          >
            {selectedId ? 'Continuer' : 'Choisir une prestation'}
          </button>
        </div>
      </div>,
      document.body
    )
  }

  if (loading) {
    return (
      <div>
        <h2 className="text-[20px] font-semibold text-white mb-1">Choisir une prestation</h2>
        <p className="text-[14px] text-white/60 mb-4">Sélectionnez le service souhaité</p>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-[52px] bg-white/5 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  // Group services by new categories
  const groupedServices = services.reduce((acc, service) => {
    let category = service.category
    const nameLower = service.name.toLowerCase()

    // Pilosité faciale = barbe seule
    if ((nameLower.includes('barbe') || nameLower.includes('entretien')) && !nameLower.includes('coupe')) {
      category = 'Pilosité faciale'
    }
    // Cheveux = coupe seule (avec ou sans transformation)
    else if (nameLower.includes('transformation') && !nameLower.includes('barbe')) {
      category = 'Cheveux'
    }
    else if ((nameLower.includes('coupe') || nameLower.includes('classique')) && !nameLower.includes('barbe')) {
      category = 'Cheveux'
    }
    // Packs = coupe + barbe
    else if (nameLower.includes('coupe') && nameLower.includes('barbe')) {
      category = 'Packs'
    }
    else if (nameLower.includes('transformation') && nameLower.includes('barbe')) {
      category = 'Packs'
    }

    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(service)
    return acc
  }, {} as Record<string, Service[]>)

  const categoryOrder = ['Pilosité faciale', 'Cheveux', 'Packs']
  const sortedCategories = Object.keys(groupedServices).sort((a, b) => {
    const indexA = categoryOrder.indexOf(a)
    const indexB = categoryOrder.indexOf(b)
    if (indexA === -1 && indexB === -1) return 0
    if (indexA === -1) return 1
    if (indexB === -1) return -1
    return indexA - indexB
  })

  // Filter tabs
  const filterTabs = ['Tout', 'Barbe', 'Cheveux', 'Packs']

  // Filter services based on active filter
  const getFilteredCategories = () => {
    if (activeFilter === 'Tout') return sortedCategories
    if (activeFilter === 'Barbe') return sortedCategories.filter(c => c === 'Pilosité faciale')
    if (activeFilter === 'Cheveux') return sortedCategories.filter(c => c === 'Cheveux')
    if (activeFilter === 'Packs') return sortedCategories.filter(c => c === 'Packs')
    return sortedCategories
  }

  const filteredCategories = getFilteredCategories()

  // Count available slots today for urgency indicator
  const todaySlotsCount = Object.values(nextSlots).filter(slot => {
    const slotDate = new Date(slot.date)
    return slotDate.toDateString() === new Date().toDateString()
  }).length

  return (
    <>
      <div className="pb-24">
        {/* Header */}
        <h2 className="text-[20px] font-semibold text-white mb-1">Choisir une prestation</h2>
        <p className="text-[14px] text-white/60 mb-3">Sélectionnez le service souhaité</p>

        {/* Quick Filters - Horizontal Tabs */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
          {filterTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-4 py-2 rounded-full text-[13px] font-medium whitespace-nowrap transition-all ${
                activeFilter === tab
                  ? 'bg-[#4CB0F1] text-black'
                  : 'bg-white/10 text-white/70 hover:bg-white/15'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Urgency Indicator */}
        {todaySlotsCount > 0 && todaySlotsCount <= 3 && (
          <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-[#FF9500]/10 border border-[#FF9500]/20 rounded-xl">
            <Zap className="w-4 h-4 text-[#FF9500]" />
            <span className="text-[13px] text-[#FF9500]">
              Plus que {todaySlotsCount} créneau{todaySlotsCount > 1 ? 'x' : ''} disponible{todaySlotsCount > 1 ? 's' : ''} aujourd&apos;hui
            </span>
          </div>
        )}

        {/* Services by category */}
        <div className="space-y-6">
          {filteredCategories.map((category) => {
            const categoryServices = groupedServices[category].filter(s => s.durationMin > 0)
            if (categoryServices.length === 0) return null

            return (
              <div key={category}>
                {/* Category header with modern icon badge */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#4CB0F1]/10 border border-[#4CB0F1]/20">
                    <span className="text-[#4CB0F1]">
                      {categoryIcons[category] || <Scissors className="w-4 h-4" />}
                    </span>
                  </div>
                  <h3 className="text-[17px] font-semibold text-white tracking-tight">{category}</h3>
                </div>

                <div className="space-y-2">
                  {categoryServices.map((service) => {
                    const isSelected = selectedId === service.id
                    const promo = getPromo(service.name)
                    const nextSlot = nextSlots[service.id]

                    return (
                      <button
                        key={service.id}
                        onClick={() => setSelectedId(service.id)}
                        className={`service-card w-full p-4 rounded-2xl text-left cursor-pointer relative border ${
                          isSelected
                            ? 'bg-[#4CB0F1] shadow-lg shadow-[#4CB0F1]/20 border-[#4CB0F1]'
                            : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <span className={`text-[15px] font-semibold block ${isSelected ? 'text-black' : 'text-white'}`}>
                              {service.name}
                            </span>
                            <span className={`text-[13px] mt-1 block ${isSelected ? 'text-black/60' : 'text-white/50'}`}>
                              {service.description}
                            </span>
                          </div>
                          <div className="flex flex-col items-end ml-3">
                            {/* Price with promo */}
                            {promo ? (
                              <div className="flex items-center gap-2">
                                <span className={`text-[13px] line-through ${isSelected ? 'text-black/40' : 'text-white/40'}`}>
                                  {promo.originalPrice} €
                                </span>
                                <span className={`text-[15px] font-semibold ${isSelected ? 'text-black' : 'text-[#32D74B]'}`}>
                                  {promo.discount} €
                                </span>
                              </div>
                            ) : (
                              <span className={`text-[15px] font-semibold ${isSelected ? 'text-black' : 'text-[#4CB0F1]'}`}>
                                {service.price} €
                              </span>
                            )}
                            <span className={`text-[12px] mt-1 ${isSelected ? 'text-black/60' : 'text-white/40'}`}>
                              {formatDuration(service.durationMin)}
                            </span>
                            {/* Promo badge */}
                            {promo && (
                              <span className={`mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                isSelected ? 'bg-black/20 text-black' : 'bg-[#32D74B]/20 text-[#32D74B]'
                              }`}>
                                -{Math.round(((promo.originalPrice - promo.discount) / promo.originalPrice) * 100)}%
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* Message prestation urgente - Improved with left border and icon */}
        <div className="mt-6 p-4 bg-white/5 border border-white/10 rounded-2xl border-l-[3px] border-l-[#4CB0F1]">
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-[#4CB0F1] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[15px] text-white/70">
                Besoin d&apos;une prestation urgente ?
              </p>
              <p className="text-[13px] text-[#4CB0F1] mt-1">
                Contactez-moi sur Instagram{' '}
                <a
                  href={SITE_CONFIG.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold underline hover:text-[#6BC1F5]"
                >
                  {SITE_CONFIG.instagramHandle}
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bouton fixe via Portal */}
      <FixedButton />

      {/* Micro-interactions CSS */}
      <style jsx>{`
        .service-card {
          transition: all 0.15s ease;
        }
        .service-card:active {
          transform: scale(0.98);
        }
        @keyframes scale-in {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out forwards;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        @media (prefers-reduced-motion: reduce) {
          .service-card {
            transition: none;
          }
          .service-card:active {
            transform: none;
          }
          .animate-scale-in {
            animation: none;
          }
        }
      `}</style>
    </>
  )
}
