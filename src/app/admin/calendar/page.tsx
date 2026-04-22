'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { format, addDays, startOfWeek } from 'date-fns'
import { fr } from 'date-fns/locale'
import { ArrowLeft, ChevronLeft, ChevronRight, Check, Trash2 } from 'lucide-react'

interface TimeSlot {
  startTime: string
  endTime: string
}

interface DayAvailability {
  date: Date
  morning: TimeSlot
  afternoon: TimeSlot
  hasData: boolean
}

const DAYS_OF_WEEK = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']

export default function CalendarPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [staffId] = useState<string>('cmk87x0ko00011jopaw49m83b')
  const [weekStart, setWeekStart] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [availability, setAvailability] = useState<DayAvailability[]>([])

  useEffect(() => {
    fetchAvailability()
  }, [weekStart])

  const fetchAvailability = async () => {
    try {
      setLoading(true)
      const startDate = format(weekStart, 'yyyy-MM-dd')
      const endDate = format(addDays(weekStart, 6), 'yyyy-MM-dd')

      const response = await fetch(
        `/api/admin/availability?staffId=${staffId}&startDate=${startDate}&endDate=${endDate}`
      )

      if (!response.ok) throw new Error('Failed to fetch availability')

      const data = await response.json()

      const weekData: DayAvailability[] = []
      for (let i = 0; i < 7; i++) {
        const date = addDays(weekStart, i)
        const dayAvailabilities = data.filter((a: { date: string }) => {
          const availDate = new Date(a.date)
          return format(availDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
        })

        const morning = dayAvailabilities.find((a: { startTime: string }) => {
          const hour = parseInt(a.startTime.split(':')[0])
          return hour < 13
        })

        const afternoon = dayAvailabilities.find((a: { startTime: string }) => {
          const hour = parseInt(a.startTime.split(':')[0])
          return hour >= 13
        })

        weekData.push({
          date,
          morning: morning ? { startTime: morning.startTime, endTime: morning.endTime } : { startTime: '', endTime: '' },
          afternoon: afternoon ? { startTime: afternoon.startTime, endTime: afternoon.endTime } : { startTime: '', endTime: '' },
          hasData: dayAvailabilities.length > 0
        })
      }

      setAvailability(weekData)
    } catch (error) {
      console.error('Error fetching availability:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveDay = async (dayIndex: number) => {
    try {
      setSaving(true)
      const day = availability[dayIndex]

      const timeSlots: TimeSlot[] = []

      if (day.morning.startTime && day.morning.endTime) {
        timeSlots.push(day.morning)
      }

      if (day.afternoon.startTime && day.afternoon.endTime) {
        timeSlots.push(day.afternoon)
      }

      if (timeSlots.length === 0) {
        alert('Remplissez au moins un créneau')
        setSaving(false)
        return
      }

      const response = await fetch('/api/admin/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staffId,
          date: format(day.date, 'yyyy-MM-dd'),
          timeSlots
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Erreur')
      }

      await fetchAvailability()
    } catch (error) {
      console.error('Error saving:', error)
      alert(error instanceof Error ? error.message : 'Erreur')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteDay = async (dayIndex: number) => {
    if (!confirm('Supprimer les disponibilités de ce jour ?')) return

    try {
      setSaving(true)
      const day = availability[dayIndex]

      const response = await fetch(
        `/api/admin/availability?staffId=${staffId}&date=${format(day.date, 'yyyy-MM-dd')}`,
        { method: 'DELETE' }
      )

      if (!response.ok) throw new Error('Failed to delete')

      await fetchAvailability()
    } catch (error) {
      console.error('Error deleting:', error)
      alert('Erreur lors de la suppression')
    } finally {
      setSaving(false)
    }
  }

  const updateTimeSlot = (dayIndex: number, period: 'morning' | 'afternoon', field: 'startTime' | 'endTime', value: string) => {
    const newAvailability = [...availability]
    newAvailability[dayIndex][period][field] = value
    setAvailability(newAvailability)
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="px-4 py-3 flex items-center gap-3">
          <Link href="/admin" className="w-11 h-11 flex items-center justify-center rounded-full bg-white/10 text-white active:scale-95 transition-transform">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="text-[17px] font-semibold text-white">Disponibilités</span>
        </div>
      </header>

      <div className="px-4 py-6">
        {/* Week Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setWeekStart(addDays(weekStart, -7))}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white active:scale-95 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="text-center">
            <p className="text-[15px] font-medium text-white">
              Semaine du {format(weekStart, 'd MMM', { locale: fr })}
            </p>
            <button
              onClick={() => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}
              className="text-[13px] text-[#4CB0F1]"
            >
              Aujourd'hui
            </button>
          </div>

          <button
            onClick={() => setWeekStart(addDays(weekStart, 7))}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white active:scale-95 transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {availability.map((day, index) => (
              <div
                key={index}
                className={`bg-white/5 border rounded-2xl overflow-hidden ${
                  day.hasData ? 'border-green-500/30' : 'border-white/10'
                }`}
              >
                {/* Day Header */}
                <div className="p-4 flex items-center justify-between border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-[15px] font-medium text-white">{DAYS_OF_WEEK[index]}</p>
                      <p className="text-[13px] text-white/50">
                        {format(day.date, 'd MMM', { locale: fr })}
                      </p>
                    </div>
                    {day.hasData && (
                      <span className="flex items-center gap-1 px-2 py-1 bg-green-500/20 rounded-lg text-[12px] text-green-400">
                        <Check className="w-3 h-3" />
                        Configuré
                      </span>
                    )}
                  </div>
                  {day.hasData && (
                    <button
                      onClick={() => handleDeleteDay(index)}
                      disabled={saving}
                      className="p-2 rounded-xl text-red-400 active:bg-red-400/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Time Slots */}
                <div className="p-4 grid grid-cols-2 gap-3">
                  {/* Morning */}
                  <div>
                    <p className="text-[12px] text-white/50 mb-2">Matin</p>
                    <div className="space-y-2">
                      <input
                        type="time"
                        value={day.morning.startTime}
                        onChange={(e) => updateTimeSlot(index, 'morning', 'startTime', e.target.value)}
                        className="w-full px-3 py-3 bg-white/5 rounded-xl text-[14px] text-white border border-white/10 focus:border-white/30 focus:outline-none transition-colors"
                        placeholder="Début"
                      />
                      <input
                        type="time"
                        value={day.morning.endTime}
                        onChange={(e) => updateTimeSlot(index, 'morning', 'endTime', e.target.value)}
                        className="w-full px-3 py-3 bg-white/5 rounded-xl text-[14px] text-white border border-white/10 focus:border-white/30 focus:outline-none transition-colors"
                        placeholder="Fin"
                      />
                    </div>
                  </div>

                  {/* Afternoon */}
                  <div>
                    <p className="text-[12px] text-white/50 mb-2">Après-midi</p>
                    <div className="space-y-2">
                      <input
                        type="time"
                        value={day.afternoon.startTime}
                        onChange={(e) => updateTimeSlot(index, 'afternoon', 'startTime', e.target.value)}
                        className="w-full px-3 py-3 bg-white/5 rounded-xl text-[14px] text-white border border-white/10 focus:border-white/30 focus:outline-none transition-colors"
                        placeholder="Début"
                      />
                      <input
                        type="time"
                        value={day.afternoon.endTime}
                        onChange={(e) => updateTimeSlot(index, 'afternoon', 'endTime', e.target.value)}
                        className="w-full px-3 py-3 bg-white/5 rounded-xl text-[14px] text-white border border-white/10 focus:border-white/30 focus:outline-none transition-colors"
                        placeholder="Fin"
                      />
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="px-4 pb-4">
                  <button
                    onClick={() => handleSaveDay(index)}
                    disabled={saving}
                    className="w-full py-3 bg-[#4CB0F1] rounded-2xl text-[14px] font-semibold text-black shadow-lg shadow-[#4CB0F1]/20 disabled:opacity-50 active:scale-[0.98] transition-all"
                  >
                    {saving ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
