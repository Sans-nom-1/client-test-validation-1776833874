'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Search,
  Users,
  Phone,
  Calendar,
  TrendingUp,
  Star,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Crown,
  Award,
  Zap
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

// Définition des récompenses par niveau
const REWARDS: Record<number, { name: string; icon: string }> = {
  0: { name: 'Nouveau', icon: '🆕' },
  1: { name: 'Bienvenue', icon: '🎁' },
  2: { name: 'Fidèle', icon: '✂️' },
  3: { name: 'Habitué', icon: '🪒' },
  4: { name: 'VIP Bronze', icon: '🥉' },
  5: { name: 'VIP Silver', icon: '🥈' },
  6: { name: 'VIP Gold', icon: '🥇' },
  7: { name: 'Elite', icon: '⭐' },
  8: { name: 'Champion', icon: '🏆' },
  9: { name: 'Légende', icon: '👑' },
  10: { name: 'Immortel', icon: '💎' },
}

interface Client {
  id: string
  firstName: string
  lastName: string
  phone: string
  email?: string
  visitCount: number
  totalSpent: number
  frequency: number
  preferredService: string
  noShowRate: number
  lastVisit: string | null
  currentLevel: number
  progressInLevel: number
}

type SortKey = 'visitCount' | 'totalSpent' | 'lastVisit' | 'noShowRate' | 'currentLevel'
type SortOrder = 'asc' | 'desc'

export default function ClientsPage() {
  const [data, setData] = useState<{ total: number; clients: Client[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('visitCount')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [expandedClient, setExpandedClient] = useState<string | null>(null)

  useEffect(() => {
    fetchClients()
  }, [search])

  async function fetchClients() {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/clients?salonId=salon-demo&search=${search}`)
      if (!res.ok) throw new Error('Erreur lors du chargement')
      const result = await res.json()

      // Add level calculation to each client
      const clientsWithLevel = result.clients.map((client: Client) => ({
        ...client,
        currentLevel: Math.floor(client.visitCount / 5),
        progressInLevel: client.visitCount % 5,
      }))

      setData({ ...result, clients: clientsWithLevel })
    } catch {
      setError('Impossible de charger les clients')
    } finally {
      setLoading(false)
    }
  }

  const sortedClients = data?.clients.sort((a, b) => {
    let aVal: number | string = a[sortKey] ?? 0
    let bVal: number | string = b[sortKey] ?? 0

    if (sortKey === 'lastVisit') {
      aVal = a.lastVisit ? new Date(a.lastVisit).getTime() : 0
      bVal = b.lastVisit ? new Date(b.lastVisit).getTime() : 0
    }

    if (sortOrder === 'asc') {
      return aVal > bVal ? 1 : -1
    }
    return aVal < bVal ? 1 : -1
  })

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortOrder('desc')
    }
  }

  const getLevelColor = (level: number) => {
    if (level >= 9) return 'from-purple-500 to-pink-500'
    if (level >= 7) return 'from-yellow-400 to-amber-500'
    if (level >= 5) return 'from-gray-300 to-gray-400'
    if (level >= 3) return 'from-amber-600 to-amber-700'
    return 'from-[#4CB0F1] to-blue-600'
  }

  const getLevelIcon = (level: number) => {
    if (level >= 9) return <Crown className="w-4 h-4" />
    if (level >= 7) return <Star className="w-4 h-4" />
    if (level >= 3) return <Award className="w-4 h-4" />
    return <Zap className="w-4 h-4" />
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="px-4 py-3 flex items-center gap-3">
          <Link href="/admin" className="w-11 h-11 flex items-center justify-center rounded-full bg-white/10 text-white active:scale-95 transition-transform">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="text-[17px] font-semibold text-white">Fichier clients</span>
        </div>
      </header>

      <div className="pb-24">
        {/* Title */}
        <div className="px-4 pt-6 pb-4">
          <h1 className="text-[24px] font-semibold text-white mb-1">Fichier clients</h1>
          <p className="text-[14px] text-white/60">Statistiques et niveaux de fidélité</p>
        </div>

        {/* Search */}
        <div className="px-4 mb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="Rechercher un client..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-[15px] text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
            />
          </div>
        </div>

        {/* Sort Filters */}
        <div className="px-4 mb-4">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {[
              { key: 'visitCount' as SortKey, label: 'Visites' },
              { key: 'currentLevel' as SortKey, label: 'Niveau' },
              { key: 'totalSpent' as SortKey, label: 'Dépensé' },
              { key: 'lastVisit' as SortKey, label: 'Dernière visite' },
              { key: 'noShowRate' as SortKey, label: 'No-show' },
            ].map((filter) => (
              <button
                key={filter.key}
                onClick={() => toggleSort(filter.key)}
                className={`flex items-center gap-1 px-3 py-2 rounded-xl text-[13px] font-medium whitespace-nowrap transition-all ${
                  sortKey === filter.key
                    ? 'bg-[#4CB0F1] text-black shadow-lg'
                    : 'bg-white/5 border border-white/10 text-white/60'
                }`}
              >
                {filter.label}
                {sortKey === filter.key && (
                  sortOrder === 'desc' ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="px-4">
            <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl">
              <p className="text-[14px] text-red-400">{error}</p>
            </div>
          </div>
        )}

        {/* Data */}
        {data && !loading && !error && (
          <div className="px-4 space-y-4">
            {/* Stats Card */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#4CB0F1]/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-[#4CB0F1]" />
              </div>
              <div>
                <p className="text-[24px] font-bold text-white">{data.total}</p>
                <p className="text-[13px] text-white/50">clients au total</p>
              </div>
            </div>

            {/* Clients List */}
            <div className="space-y-3">
              {sortedClients?.map((client) => {
                const isExpanded = expandedClient === client.id
                const reward = REWARDS[client.currentLevel] || REWARDS[0]

                return (
                  <div
                    key={client.id}
                    className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
                  >
                    {/* Client Header - Clickable */}
                    <button
                      onClick={() => setExpandedClient(isExpanded ? null : client.id)}
                      className="w-full p-4 flex items-center gap-3 active:bg-white/5"
                    >
                      {/* Level Badge */}
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getLevelColor(client.currentLevel)} flex flex-col items-center justify-center flex-shrink-0`}>
                        {getLevelIcon(client.currentLevel)}
                        <span className="text-[10px] font-bold text-black mt-0.5">
                          Niv.{client.currentLevel}
                        </span>
                      </div>

                      {/* Client Info */}
                      <div className="flex-1 min-w-0 text-left">
                        <p className="text-[15px] font-semibold text-white truncate">
                          {client.firstName} {client.lastName}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[12px] text-white/40">
                            {client.visitCount} visite{client.visitCount > 1 ? 's' : ''}
                          </span>
                          <span className="text-[10px] text-white/30">•</span>
                          <span className="text-[12px] text-white/40">
                            {client.totalSpent}€
                          </span>
                          {client.noShowRate > 10 && (
                            <>
                              <span className="text-[10px] text-white/30">•</span>
                              <span className="text-[12px] text-red-400 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                {client.noShowRate}%
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Level Progress */}
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-lg">{reward.icon}</span>
                        <div className="w-12 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${getLevelColor(client.currentLevel)} rounded-full`}
                            style={{ width: `${(client.progressInLevel / 5) * 100}%` }}
                          />
                        </div>
                      </div>
                    </button>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-0 border-t border-white/10">
                        <div className="pt-4 space-y-3">
                          {/* Contact */}
                          <div className="flex items-center gap-3">
                            <Phone className="w-4 h-4 text-[#4CB0F1]" />
                            <a href={`tel:${client.phone}`} className="text-[14px] text-[#4CB0F1]">
                              {client.phone}
                            </a>
                          </div>

                          {/* Stats Grid */}
                          <div className="grid grid-cols-3 gap-2">
                            <div className="bg-black/30 rounded-lg p-3 text-center">
                              <p className="text-[17px] font-bold text-white">{client.visitCount}</p>
                              <p className="text-[10px] text-white/40 uppercase">Visites</p>
                            </div>
                            <div className="bg-black/30 rounded-lg p-3 text-center">
                              <p className="text-[17px] font-bold text-[#4CB0F1]">{client.totalSpent}€</p>
                              <p className="text-[10px] text-white/40 uppercase">Dépensé</p>
                            </div>
                            <div className="bg-black/30 rounded-lg p-3 text-center">
                              <p className="text-[17px] font-bold text-white">{client.frequency}/m</p>
                              <p className="text-[10px] text-white/40 uppercase">Fréquence</p>
                            </div>
                          </div>

                          {/* Last Visit & Service */}
                          <div className="flex items-center justify-between text-[13px]">
                            <div className="flex items-center gap-2 text-white/50">
                              <Calendar className="w-4 h-4" />
                              <span>
                                {client.lastVisit
                                  ? format(new Date(client.lastVisit), 'dd MMMM yyyy', { locale: fr })
                                  : 'Jamais'}
                              </span>
                            </div>
                            {client.preferredService && (
                              <span className="text-white/40">
                                Préféré: <span className="text-white/60">{client.preferredService}</span>
                              </span>
                            )}
                          </div>

                          {/* Level Progress Info */}
                          <div className="bg-[#4CB0F1]/10 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[12px] text-[#4CB0F1] font-medium">
                                Progression vers niveau {client.currentLevel + 1}
                              </span>
                              <span className="text-[12px] text-white/50">
                                {client.progressInLevel}/5 visites
                              </span>
                            </div>
                            <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                              <div
                                className={`h-full bg-gradient-to-r ${getLevelColor(client.currentLevel)} rounded-full transition-all`}
                                style={{ width: `${(client.progressInLevel / 5) * 100}%` }}
                              />
                            </div>
                            {REWARDS[client.currentLevel + 1] && (
                              <p className="text-[11px] text-white/40 mt-2">
                                Prochaine récompense: {REWARDS[client.currentLevel + 1].icon} {REWARDS[client.currentLevel + 1].name}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}

              {sortedClients?.length === 0 && (
                <div className="py-12 text-center">
                  <Users className="w-12 h-12 text-white/20 mx-auto mb-3" />
                  <p className="text-[15px] text-white/50">Aucun client trouvé</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
