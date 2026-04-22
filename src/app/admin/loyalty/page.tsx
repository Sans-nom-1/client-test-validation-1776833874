'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Users,
  Trophy,
  Star,
  Gift,
  TrendingUp,
  Crown,
  Award,
  Zap,
  ChevronRight,
  Calendar
} from 'lucide-react'

// Définition des récompenses par niveau
const REWARDS: Record<number, { name: string; description: string; icon: string }> = {
  1: { name: 'Bienvenue', description: 'Produit offert', icon: '🎁' },
  2: { name: 'Fidèle', description: '-5€ sur la prochaine coupe', icon: '✂️' },
  3: { name: 'Habitué', description: 'Barbe offerte', icon: '🪒' },
  4: { name: 'VIP Bronze', description: '-10€ sur un pack', icon: '🥉' },
  5: { name: 'VIP Silver', description: 'Coupe gratuite', icon: '🥈' },
  6: { name: 'VIP Gold', description: 'Pack complet offert', icon: '🥇' },
  7: { name: 'Elite', description: 'Accès prioritaire', icon: '⭐' },
  8: { name: 'Champion', description: '-20€ sur tout', icon: '🏆' },
  9: { name: 'Légende', description: 'Coupe + Barbe offertes', icon: '👑' },
  10: { name: 'Immortel', description: 'Carte VIP à vie', icon: '💎' },
}

interface LeaderboardEntry {
  id: string
  rank: number
  firstName: string
  lastName: string
  visitCount: number
  currentLevel: number
  progressPercent: number
  progressInCurrentLevel: number
}

interface LevelData {
  level: number
  requiredRdv: number
  customersUnlocked: number
  customersInProgress: number
}

interface LoyaltyData {
  totalClients: number
  activeClients: number
  visitsThisMonth: number
  totalVisits: number
  avgVisitsPerClient: number
  leaderboard: LeaderboardEntry[]
  levels: LevelData[]
  milestoneInterval: number
}

export default function LoyaltyPage() {
  const [data, setData] = useState<LoyaltyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'overview' | 'leaderboard' | 'rewards'>('overview')

  useEffect(() => {
    fetchLoyalty()
  }, [])

  async function fetchLoyalty() {
    try {
      const res = await fetch('/api/admin/loyalty?salonId=salon-demo')
      if (!res.ok) throw new Error('Erreur lors du chargement')
      const result = await res.json()
      setData(result)
    } catch {
      setError('Impossible de charger les données de fidélité')
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-400" />
    if (rank === 2) return <Trophy className="w-5 h-5 text-gray-300" />
    if (rank === 3) return <Award className="w-5 h-5 text-amber-600" />
    return <span className="text-[14px] font-bold text-white/50">#{rank}</span>
  }

  const getRankBg = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-500/20 to-transparent border-l-2 border-yellow-500'
    if (rank === 2) return 'bg-gradient-to-r from-gray-400/20 to-transparent border-l-2 border-gray-400'
    if (rank === 3) return 'bg-gradient-to-r from-amber-600/20 to-transparent border-l-2 border-amber-600'
    return ''
  }

  const getLevelColor = (level: number) => {
    if (level >= 9) return 'from-purple-500 to-pink-500'
    if (level >= 7) return 'from-yellow-400 to-amber-500'
    if (level >= 5) return 'from-gray-300 to-gray-400'
    if (level >= 3) return 'from-amber-600 to-amber-700'
    return 'from-[#4CB0F1] to-blue-600'
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="px-4 py-3 flex items-center gap-3">
          <Link href="/admin" className="w-11 h-11 flex items-center justify-center rounded-full bg-white/10 text-white active:scale-95 transition-transform">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="text-[17px] font-semibold text-white">Programme de fidélité</span>
        </div>
      </header>

      <div className="pb-24">
        {/* Title */}
        <div className="px-4 pt-6 pb-4">
          <h1 className="text-[24px] font-semibold text-white mb-1">Fidélité & Récompenses</h1>
          <p className="text-[14px] text-white/60">
            Suivez la progression de vos clients (1 niveau = {data?.milestoneInterval || 5} passages)
          </p>
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
          <>
            {/* Stats Cards */}
            <div className="px-4 mb-6">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-[#4CB0F1]" />
                    <span className="text-[12px] text-white/50">Clients actifs</span>
                  </div>
                  <p className="text-[24px] font-bold text-white">{data.activeClients}</p>
                  <p className="text-[11px] text-white/40">sur {data.totalClients} inscrits</p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-green-400" />
                    <span className="text-[12px] text-white/50">Ce mois</span>
                  </div>
                  <p className="text-[24px] font-bold text-white">{data.visitsThisMonth}</p>
                  <p className="text-[11px] text-white/40">visites</p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-purple-400" />
                    <span className="text-[12px] text-white/50">Total visites</span>
                  </div>
                  <p className="text-[24px] font-bold text-white">{data.totalVisits}</p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <span className="text-[12px] text-white/50">Moyenne</span>
                  </div>
                  <p className="text-[24px] font-bold text-white">{data.avgVisitsPerClient}</p>
                  <p className="text-[11px] text-white/40">visites/client</p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="px-4 mb-4">
              <div className="flex gap-2 bg-white/5 rounded-2xl p-1">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`flex-1 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                    activeTab === 'overview'
                      ? 'bg-[#4CB0F1] text-black shadow-lg'
                      : 'text-white/60'
                  }`}
                >
                  Vue d'ensemble
                </button>
                <button
                  onClick={() => setActiveTab('leaderboard')}
                  className={`flex-1 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                    activeTab === 'leaderboard'
                      ? 'bg-[#4CB0F1] text-black shadow-lg'
                      : 'text-white/60'
                  }`}
                >
                  Classement
                </button>
                <button
                  onClick={() => setActiveTab('rewards')}
                  className={`flex-1 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                    activeTab === 'rewards'
                      ? 'bg-[#4CB0F1] text-black shadow-lg'
                      : 'text-white/60'
                  }`}
                >
                  Récompenses
                </button>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div className="px-4 space-y-4">
                {/* Levels Overview */}
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                  <div className="p-4 border-b border-white/10 flex items-center gap-2">
                    <Star className="w-4 h-4 text-[#4CB0F1]" />
                    <p className="text-[15px] font-semibold text-white">Distribution par niveau</p>
                  </div>

                  <div className="p-4 space-y-3">
                    {data.levels.map((level) => {
                      const reward = REWARDS[level.level]
                      const total = level.customersUnlocked + level.customersInProgress
                      return (
                        <div key={level.level} className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getLevelColor(level.level)} flex items-center justify-center flex-shrink-0`}>
                            <span className="text-[14px] font-bold text-black">{level.level}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[13px] text-white font-medium truncate">
                                {reward?.name || `Niveau ${level.level}`}
                              </span>
                              <span className="text-[12px] text-white/50">
                                {level.requiredRdv} visites
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                                <div
                                  className={`h-full bg-gradient-to-r ${getLevelColor(level.level)} rounded-full`}
                                  style={{ width: `${(level.customersUnlocked / Math.max(data.activeClients, 1)) * 100}%` }}
                                />
                              </div>
                              <span className="text-[11px] text-white/40 w-8 text-right">
                                {level.customersUnlocked}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'leaderboard' && (
              <div className="px-4">
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                  <div className="p-4 border-b border-white/10 flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-yellow-400" />
                    <p className="text-[15px] font-semibold text-white">Top 10 clients</p>
                  </div>

                  {data.leaderboard.length > 0 ? (
                    <div className="divide-y divide-white/5">
                      {data.leaderboard.map((client) => {
                        const reward = REWARDS[client.currentLevel]
                        return (
                          <div
                            key={client.id}
                            className={`p-4 flex items-center gap-3 ${getRankBg(client.rank)}`}
                          >
                            {/* Rank */}
                            <div className="w-10 h-10 rounded-full bg-black/30 flex items-center justify-center flex-shrink-0">
                              {getRankIcon(client.rank)}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <p className="text-[15px] font-medium text-white truncate">
                                {client.firstName} {client.lastName}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[12px] text-white/40">
                                  {client.visitCount} visite{client.visitCount > 1 ? 's' : ''}
                                </span>
                                <span className="text-[10px] text-white/30">•</span>
                                <span className="text-[12px] text-white/40">
                                  {client.progressInCurrentLevel}/{data.milestoneInterval} vers niv.{client.currentLevel + 1}
                                </span>
                              </div>
                            </div>

                            {/* Level Badge */}
                            <div className="flex flex-col items-end gap-1">
                              <div className={`px-2.5 py-1 rounded-lg bg-gradient-to-r ${getLevelColor(client.currentLevel)} flex items-center gap-1`}>
                                <span className="text-[11px] font-bold text-black">
                                  Niv.{client.currentLevel}
                                </span>
                              </div>
                              {reward && (
                                <span className="text-[10px] text-white/40">{reward.icon}</span>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="p-6 text-center">
                      <p className="text-[15px] text-white/50">Aucun client avec des visites</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'rewards' && (
              <div className="px-4 space-y-3">
                <div className="bg-[#4CB0F1]/10 border border-[#4CB0F1]/20 rounded-xl p-4 mb-4">
                  <p className="text-[14px] text-[#4CB0F1] font-medium mb-1">
                    Système de récompenses
                  </p>
                  <p className="text-[13px] text-white/60">
                    Chaque {data.milestoneInterval} visites = 1 niveau débloqué avec une récompense.
                    Modifiez les récompenses dans le code pour les personnaliser.
                  </p>
                </div>

                {Object.entries(REWARDS).map(([levelStr, reward]) => {
                  const level = parseInt(levelStr)
                  const levelData = data.levels.find(l => l.level === level)
                  return (
                    <div
                      key={level}
                      className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4"
                    >
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${getLevelColor(level)} flex items-center justify-center flex-shrink-0`}>
                        <span className="text-2xl">{reward.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded bg-gradient-to-r ${getLevelColor(level)} text-black`}>
                            NIVEAU {level}
                          </span>
                          <span className="text-[11px] text-white/40">
                            {level * data.milestoneInterval} visites
                          </span>
                        </div>
                        <p className="text-[15px] font-semibold text-white">{reward.name}</p>
                        <p className="text-[13px] text-white/50">{reward.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[17px] font-bold text-white">{levelData?.customersUnlocked || 0}</p>
                        <p className="text-[10px] text-white/40">clients</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
