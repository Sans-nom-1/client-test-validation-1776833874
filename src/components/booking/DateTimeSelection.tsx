'use client'

import { useEffect, useState, useRef } from 'react'
import { addDays, format, startOfToday } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Zap, Calendar, Clock } from 'lucide-react'

interface TimeSlot {
  start: string
  end: string
  available: boolean
}

interface DateTimeSelectionProps {
  salonId: string
  serviceId: string
  staffId?: string
  onSelect: (date: string, time: string) => void
  onBack: () => void
}

export default function DateTimeSelection({
  salonId,
  serviceId,
  staffId,
  onSelect,
  onBack,
}: DateTimeSelectionProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(startOfToday())
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [showAllSlots, setShowAllSlots] = useState(false)
  const [searchingNext, setSearchingNext] = useState(false)
  const [visibleMonth, setVisibleMonth] = useState<Date>(startOfToday())
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // 21 jours disponibles pour plus de choix
  const availableDates = Array.from({ length: 21 }, (_, i) => addDays(startOfToday(), i))

  useEffect(() => {
    if (selectedDate) {
      fetchSlots(selectedDate)
    }
  }, [selectedDate, serviceId, staffId])

  const fetchSlots = async (date: Date) => {
    setLoading(true)
    setSelectedTime(null)
    setShowAllSlots(false)
    try {
      const dateStr = format(date, 'yyyy-MM-dd')
      const url = `/api/slots?salonId=${salonId}&serviceId=${serviceId}&date=${dateStr}${
        staffId ? `&staffId=${staffId}` : ''
      }`

      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch slots')

      const data = await response.json()
      setSlots(data)
    } catch (error) {
      console.error('Error fetching slots:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = () => {
    if (selectedTime) {
      const dateStr = format(selectedDate, 'yyyy-MM-dd')
      onSelect(dateStr, selectedTime)
    }
  }

  const findNextAvailableSlot = async () => {
    setSearchingNext(true)

    for (const date of availableDates) {
      try {
        const dateStr = format(date, 'yyyy-MM-dd')
        const url = `/api/slots?salonId=${salonId}&serviceId=${serviceId}&date=${dateStr}${
          staffId ? `&staffId=${staffId}` : ''
        }`

        const response = await fetch(url)
        if (!response.ok) continue

        const data: TimeSlot[] = await response.json()

        const isToday = dateStr === format(new Date(), 'yyyy-MM-dd')
        const availableSlots = data.filter((slot) => {
          if (!slot.available) return false
          if (isToday) {
            // slot.start is in Paris time (HH:mm) — compare against current Paris time
            const nowInParis = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Paris' }))
            const [hours, minutes] = slot.start.split(':').map(Number)
            const slotTime = new Date(nowInParis)
            slotTime.setHours(hours, minutes, 0, 0)
            return slotTime > nowInParis
          }
          return true
        })

        if (availableSlots.length > 0) {
          setSelectedDate(date)
          setSlots(data)
          setSelectedTime(availableSlots[0].start)
          setSearchingNext(false)
          return
        }
      } catch {
        continue
      }
    }

    setSearchingNext(false)
  }

  const filteredSlots = slots.filter((slot) => {
    if (!slot.available) return false
    const isToday = format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
    if (isToday) {
      // slot.start is in Paris time (HH:mm) — compare against current Paris time
      const nowInParis = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Paris' }))
      const [hours, minutes] = slot.start.split(':').map(Number)
      const slotTime = new Date(nowInParis)
      slotTime.setHours(hours, minutes, 0, 0)
      return slotTime > nowInParis
    }
    return true
  })

  // Grouper les créneaux par période
  const groupSlotsByPeriod = (slots: TimeSlot[]) => {
    const morning: TimeSlot[] = []
    const afternoon: TimeSlot[] = []
    const evening: TimeSlot[] = []

    slots.forEach(slot => {
      const hour = parseInt(slot.start.split(':')[0])
      if (hour < 12) morning.push(slot)
      else if (hour < 17) afternoon.push(slot)
      else evening.push(slot)
    })

    return { morning, afternoon, evening }
  }

  const groupedSlots = groupSlotsByPeriod(filteredSlots)

  // Scroll to selected date when it changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      const selectedIndex = availableDates.findIndex(
        (d) => format(d, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
      )
      if (selectedIndex >= 0) {
        const button = scrollContainerRef.current.children[selectedIndex] as HTMLElement
        if (button) {
          const containerWidth = scrollContainerRef.current.offsetWidth
          const buttonLeft = button.offsetLeft
          const buttonWidth = button.offsetWidth
          const scrollPosition = buttonLeft - containerWidth / 2 + buttonWidth / 2
          scrollContainerRef.current.scrollTo({ left: scrollPosition, behavior: 'smooth' })
        }
      }
    }
  }, [])

  // Handle scroll to update visible month
  const handleScroll = () => {
    if (!scrollContainerRef.current) return

    const container = scrollContainerRef.current
    const scrollLeft = container.scrollLeft
    const containerLeft = container.getBoundingClientRect().left

    // Find the first visible date (leftmost in viewport)
    let firstVisibleDate = availableDates[0]

    for (let i = 0; i < container.children.length; i++) {
      const child = container.children[i] as HTMLElement
      const childRect = child.getBoundingClientRect()

      // If this element is at least partially visible from the left
      if (childRect.right > containerLeft + 20) {
        firstVisibleDate = availableDates[i]
        break
      }
    }

    // Update month if different
    if (format(firstVisibleDate, 'yyyy-MM') !== format(visibleMonth, 'yyyy-MM')) {
      setVisibleMonth(firstVisibleDate)
    }
  }

  return (
    <div className="animate-fade-in">
      {/* Header avec icône */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
          <Calendar className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-[20px] font-semibold text-white">Date et heure</h2>
          <p className="text-[14px] text-white/50">Choisissez votre créneau</p>
        </div>
      </div>

      {/* Quick action - Prochain créneau */}
      <button
        onClick={findNextAvailableSlot}
        disabled={searchingNext}
        className="w-full mb-6 py-4 px-4 bg-gradient-to-r from-white/5 to-white/10 border border-white/10 rounded-2xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all disabled:opacity-50"
      >
        <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
          <Zap className="w-4 h-4 text-accent" />
        </div>
        <span className="text-[15px] font-medium text-white">
          {searchingNext ? 'Recherche en cours...' : 'Trouver le prochain créneau'}
        </span>
      </button>

      {/* Sélecteur de dates - Scroll horizontal */}
      <div className="mb-6">
        {/* Mois actuel - se met à jour au scroll */}
        <p className="text-[13px] text-white/50 mb-3 px-1 capitalize transition-all">
          {format(visibleMonth, 'MMMM yyyy', { locale: fr })}
        </p>

        {/* Liste déroulante horizontale */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {availableDates.map((date) => {
            const isSelected = format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
            const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
            const dayName = format(date, 'EEE', { locale: fr })
            const dayNum = format(date, 'd')
            const monthName = format(date, 'MMM', { locale: fr })

            return (
              <button
                key={date.toString()}
                onClick={() => setSelectedDate(date)}
                className={`flex-shrink-0 flex flex-col items-center justify-center w-16 py-3 rounded-2xl transition-all active:scale-95 snap-center ${
                  isSelected
                    ? 'bg-[#4CB0F1] text-black shadow-lg shadow-[#4CB0F1]/20'
                    : isToday
                    ? 'bg-white/10 text-white ring-2 ring-white/20'
                    : 'bg-white/5 text-white hover:bg-white/10'
                }`}
              >
                <span className={`text-[11px] uppercase font-medium ${
                  isSelected ? 'text-black/60' : 'text-white/40'
                }`}>
                  {dayName}
                </span>
                <span className={`text-[20px] font-bold ${
                  isSelected ? 'text-black' : ''
                }`}>
                  {dayNum}
                </span>
                <span className={`text-[10px] uppercase ${
                  isSelected ? 'text-black/50' : 'text-white/30'
                }`}>
                  {monthName}
                </span>
                {isToday && !isSelected && (
                  <div className="w-1.5 h-1.5 rounded-full bg-[#4CB0F1] mt-1" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Date sélectionnée */}
      <div className="flex items-center gap-2 mb-4 px-1">
        <Clock className="w-4 h-4 text-white/40" />
        <p className="text-[14px] text-white/60 capitalize">
          {format(selectedDate, 'EEEE d MMMM', { locale: fr })}
        </p>
      </div>

      {/* Créneaux horaires */}
      {loading ? (
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-12 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filteredSlots.length === 0 ? (
        <div className="py-12 text-center bg-white/5 rounded-2xl">
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-6 h-6 text-white/40" />
          </div>
          <p className="text-[15px] text-white/60 mb-2">Aucun créneau disponible</p>
          <p className="text-[13px] text-white/40">Essayez une autre date</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Matin */}
          {groupedSlots.morning.length > 0 && (
            <div>
              <p className="text-[12px] font-medium text-white/40 uppercase tracking-wide mb-2 px-1">
                Matin
              </p>
              <div className="grid grid-cols-4 gap-2">
                {groupedSlots.morning.map((slot) => (
                  <button
                    key={slot.start}
                    onClick={() => setSelectedTime(slot.start)}
                    className={`py-3 px-2 rounded-xl text-center transition-all active:scale-95 ${
                      selectedTime === slot.start
                        ? 'bg-[#4CB0F1] text-black shadow-lg shadow-[#4CB0F1]/20'
                        : 'bg-white/5 text-white hover:bg-white/10'
                    }`}
                  >
                    <span className="text-[14px] font-medium">{slot.start}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Après-midi */}
          {groupedSlots.afternoon.length > 0 && (
            <div>
              <p className="text-[12px] font-medium text-white/40 uppercase tracking-wide mb-2 px-1">
                Après-midi
              </p>
              <div className="grid grid-cols-4 gap-2">
                {(showAllSlots ? groupedSlots.afternoon : groupedSlots.afternoon.slice(0, 8)).map((slot) => (
                  <button
                    key={slot.start}
                    onClick={() => setSelectedTime(slot.start)}
                    className={`py-3 px-2 rounded-xl text-center transition-all active:scale-95 ${
                      selectedTime === slot.start
                        ? 'bg-[#4CB0F1] text-black shadow-lg shadow-[#4CB0F1]/20'
                        : 'bg-white/5 text-white hover:bg-white/10'
                    }`}
                  >
                    <span className="text-[14px] font-medium">{slot.start}</span>
                  </button>
                ))}
              </div>
              {!showAllSlots && groupedSlots.afternoon.length > 8 && (
                <button
                  onClick={() => setShowAllSlots(true)}
                  className="w-full mt-2 py-2 text-[13px] text-white/50 text-center hover:text-white/70 transition-colors"
                >
                  +{groupedSlots.afternoon.length - 8} créneaux
                </button>
              )}
            </div>
          )}

          {/* Soir */}
          {groupedSlots.evening.length > 0 && (
            <div>
              <p className="text-[12px] font-medium text-white/40 uppercase tracking-wide mb-2 px-1">
                Soir
              </p>
              <div className="grid grid-cols-4 gap-2">
                {groupedSlots.evening.map((slot) => (
                  <button
                    key={slot.start}
                    onClick={() => setSelectedTime(slot.start)}
                    className={`py-3 px-2 rounded-xl text-center transition-all active:scale-95 ${
                      selectedTime === slot.start
                        ? 'bg-[#4CB0F1] text-black shadow-lg shadow-[#4CB0F1]/20'
                        : 'bg-white/5 text-white hover:bg-white/10'
                    }`}
                  >
                    <span className="text-[14px] font-medium">{slot.start}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="mt-8 space-y-3">
        <button
          onClick={handleConfirm}
          disabled={!selectedTime}
          className={`w-full py-5 rounded-2xl text-[17px] font-semibold transition-all active:scale-[0.98] ${
            selectedTime
              ? 'bg-[#4CB0F1] text-black shadow-lg shadow-[#4CB0F1]/20'
              : 'bg-white/10 text-white/40 cursor-not-allowed'
          }`}
        >
          Continuer
        </button>

        <button
          onClick={onBack}
          className="w-full py-4 text-[16px] text-white/50 text-center hover:text-white/70 transition-colors"
        >
          Retour
        </button>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}
