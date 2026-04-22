'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, XCircle, Clock, TrendingDown, Users } from 'lucide-react'

interface CustomerWithCancellations {
  customer: {
    id: string
    firstName: string
    lastName: string
    phone: string
  }
  cancellationCount: number
  totalAppointments: number
  cancellationRate: number
}

interface CancellationStats {
  totalCancellations: number
  avgDelayHours: number
  cancellationRate: number
  allCustomersWithCancellations: CustomerWithCancellations[]
}

export default function CancellationsPage() {
  const [stats, setStats] = useState<CancellationStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchStats()
  }, [])

  async function fetchStats() {
    try {
      const res = await fetch('/api/admin/cancellations?salonId=salon-demo')
      if (!res.ok) throw new Error('Erreur lors du chargement')
      const data = await res.json()
      setStats(data)
    } catch {
      setError('Impossible de charger les statistiques')
    } finally {
      setLoading(false)
    }
  }

  const getRateBadgeStyle = (rate: number) => {
    if (rate > 50) return 'bg-red-500/20 text-red-400'
    if (rate > 30) return 'bg-orange-500/20 text-orange-400'
    return 'bg-yellow-500/20 text-yellow-400'
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="px-4 py-3 flex items-center gap-3">
          <Link href="/admin" className="w-11 h-11 flex items-center justify-center rounded-full bg-white/10 text-white active:scale-95 transition-transform">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="text-[17px] font-semibold text-white">Gestion des absences</span>
        </div>
      </header>

      <div className="px-4 py-6">
        {/* Title */}
        <div className="mb-6">
          <h1 className="text-[24px] font-semibold text-white mb-1">Suivi des annulations</h1>
          <p className="text-[14px] text-white/60">Classement du pire au meilleur client</p>
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
        {stats && !loading && !error && (
          <div className="space-y-4">
            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
              {/* Total Annulations */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center mb-3">
                  <XCircle className="w-5 h-5 text-red-400" />
                </div>
                <p className="text-[20px] font-bold text-white">{stats.totalCancellations}</p>
                <p className="text-[11px] text-white/40">annulations</p>
              </div>

              {/* Délai Moyen */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center mb-3">
                  <Clock className="w-5 h-5 text-orange-400" />
                </div>
                <p className="text-[20px] font-bold text-white">{stats.avgDelayHours}h</p>
                <p className="text-[11px] text-white/40">délai moyen</p>
              </div>

              {/* Taux Global */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <div className="w-10 h-10 rounded-xl bg-[#4CB0F1]/20 flex items-center justify-center mb-3">
                  <TrendingDown className="w-5 h-5 text-[#4CB0F1]" />
                </div>
                <p className="text-[20px] font-bold text-white">{stats.cancellationRate}%</p>
                <p className="text-[11px] text-white/40">taux global</p>
              </div>
            </div>

            {/* All Customers with Cancellations - Sorted worst to best */}
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-white/10 flex items-center gap-2">
                <Users className="w-4 h-4 text-[#4CB0F1]" />
                <p className="text-[15px] font-semibold text-white">Clients avec annulations</p>
                <span className="text-[12px] text-white/40 ml-auto">{stats.allCustomersWithCancellations.length} clients</span>
              </div>

              {stats.allCustomersWithCancellations.length > 0 ? (
                <div className="divide-y divide-white/5">
                  {stats.allCustomersWithCancellations.map((item, index) => (
                    <div key={item.customer.id} className="p-4 flex items-center gap-3">
                      {/* Rank */}
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
                        <span className="text-[12px] font-bold text-white/50">#{index + 1}</span>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[15px] font-medium text-white truncate">
                          {item.customer.firstName} {item.customer.lastName}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[12px] text-white/40">
                            {item.cancellationCount} annul. / {item.totalAppointments} RDV
                          </span>
                        </div>
                      </div>

                      {/* Rate Badge */}
                      <div className={`px-3 py-1 rounded-full ${getRateBadgeStyle(item.cancellationRate)}`}>
                        <span className="text-[13px] font-bold">{item.cancellationRate}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-3">
                    <XCircle className="w-6 h-6 text-green-400" />
                  </div>
                  <p className="text-[15px] font-medium text-white mb-1">Aucune annulation</p>
                  <p className="text-[13px] text-white/50">Tous vos clients ont un bon taux de présence</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
