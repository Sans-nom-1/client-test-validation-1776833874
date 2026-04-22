'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { format, subMonths, addMonths } from 'date-fns'
import { fr } from 'date-fns/locale'

interface Appointment {
  id: string
  startAt: string
  status: string
  customer: {
    firstName: string
    lastName: string
  }
  service: {
    name: string
  }
}

interface HistoryData {
  total: number
  appointments: Record<string, Appointment[]>
}

export default function HistoryPage() {
  const [data, setData] = useState<HistoryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date())

  const selectedMonth = format(selectedDate, 'yyyy-MM')

  useEffect(() => {
    fetchHistory()
  }, [selectedMonth])

  async function fetchHistory() {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/history?salonId=salon-demo&month=${selectedMonth}`)
      if (!res.ok) throw new Error('Erreur lors du chargement')
      const result = await res.json()
      setData(result)
    } catch {
      setError('Impossible de charger l\'historique')
    } finally {
      setLoading(false)
    }
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'DONE':
        return { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Terminé' }
      case 'CANCELLED':
        return { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Annulé' }
      case 'NO_SHOW':
        return { bg: 'bg-orange-500/20', text: 'text-orange-400', label: 'Absent' }
      default:
        return { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: status }
    }
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="px-4 py-3 flex items-center gap-3">
          <Link href="/admin" className="w-11 h-11 flex items-center justify-center rounded-full bg-white/10 text-white active:scale-95 transition-transform">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="text-[17px] font-semibold text-white">Historique</span>
        </div>
      </header>

      <div className="px-4 py-6">
        {/* Title */}
        <div className="mb-6">
          <h1 className="text-[24px] font-semibold text-white mb-1">Historique des réservations</h1>
          <p className="text-[14px] text-white/60">Vue calendrier des rendez-vous passés</p>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-6 bg-white/5 border border-white/10 rounded-2xl p-3">
          <button
            onClick={() => setSelectedDate(subMonths(selectedDate, 1))}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white active:scale-95 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="text-center">
            <p className="text-[17px] font-semibold text-white capitalize">
              {format(selectedDate, 'MMMM yyyy', { locale: fr })}
            </p>
            <button
              onClick={() => setSelectedDate(new Date())}
              className="text-[13px] text-[#4CB0F1]"
            >
              Mois actuel
            </button>
          </div>

          <button
            onClick={() => setSelectedDate(addMonths(selectedDate, 1))}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white active:scale-95 transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl">
            <p className="text-[14px] text-red-400">{error}</p>
          </div>
        )}

        {/* Data */}
        {data && !loading && !error && (
          <div className="space-y-4">
            {/* Stats Card */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#4CB0F1]/20 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-[#4CB0F1]" />
              </div>
              <div>
                <p className="text-[24px] font-bold text-white">{data.total}</p>
                <p className="text-[13px] text-white/50">rendez-vous ce mois</p>
              </div>
            </div>

            {/* Appointments by Day */}
            {Object.entries(data.appointments).length === 0 ? (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-white/40" />
                </div>
                <p className="text-[15px] font-medium text-white mb-1">Aucun rendez-vous</p>
                <p className="text-[13px] text-white/50">Pas de rendez-vous ce mois-ci</p>
              </div>
            ) : (
              Object.entries(data.appointments).map(([date, appointments]) => (
                <div key={date} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                  {/* Day Header */}
                  <div className="p-4 border-b border-white/10">
                    <p className="text-[15px] font-semibold text-white capitalize">
                      {format(new Date(date), 'EEEE d MMMM', { locale: fr })}
                    </p>
                    <p className="text-[12px] text-white/40">
                      {appointments.length} rendez-vous
                    </p>
                  </div>

                  {/* Appointments */}
                  <div className="divide-y divide-white/5">
                    {appointments.map((apt) => {
                      const statusConfig = getStatusConfig(apt.status)
                      return (
                        <div key={apt.id} className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-black/30 flex items-center justify-center">
                              <span className="text-[15px] font-bold text-[#4CB0F1]">
                                {format(new Date(apt.startAt), 'HH:mm')}
                              </span>
                            </div>
                            <div>
                              <p className="text-[15px] font-medium text-white">
                                {apt.customer.firstName} {apt.customer.lastName}
                              </p>
                              <p className="text-[13px] text-white/50">{apt.service.name}</p>
                            </div>
                          </div>
                          <div className={`px-2 py-1 rounded-lg ${statusConfig.bg}`}>
                            <span className={`text-[11px] font-medium ${statusConfig.text}`}>
                              {statusConfig.label}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
