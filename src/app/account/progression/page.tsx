'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Star, Trophy, Crown, Award, Zap, Gift } from 'lucide-react'

interface CustomerStats {
  visitCount: number
  rank: number | null
  totalCustomers: number
  nextMilestone: number
  progressToNextReward: number
}

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

export default function ProgressionPage() {
  const router = useRouter()
  const [stats, setStats] = useState<CustomerStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProgression()
  }, [])

  const fetchProgression = async () => {
    try {
      const response = await fetch('/api/auth/customer/me')

      if (!response.ok) {
        router.push('/account')
        return
      }

      const data = await response.json()
      setStats(data.stats)
    } catch (error) {
      console.error('Error fetching progression:', error)
      router.push('/account')
    } finally {
      setLoading(false)
    }
  }

  const currentLevel = stats ? Math.floor(stats.visitCount / 5) : 0
  const progressInLevel = stats ? stats.visitCount % 5 : 0

  const getLevelColor = (level: number) => {
    if (level >= 9) return 'from-purple-500 to-pink-500'
    if (level >= 7) return 'from-yellow-400 to-amber-500'
    if (level >= 5) return 'from-gray-300 to-gray-400'
    if (level >= 3) return 'from-amber-600 to-amber-700'
    return 'from-[#4CB0F1] to-blue-600'
  }

  const getLevelIcon = (level: number) => {
    if (level >= 9) return <Crown className="w-6 h-6" />
    if (level >= 7) return <Trophy className="w-6 h-6" />
    if (level >= 3) return <Award className="w-6 h-6" />
    return <Zap className="w-6 h-6" />
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  if (!stats) {
    return null
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="px-4 py-3 flex items-center gap-3">
          <Link href="/account/profile" className="w-11 h-11 flex items-center justify-center rounded-full bg-white/10 text-white active:scale-95 transition-transform">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="text-[17px] font-semibold text-white">Ma progression</span>
        </div>
      </header>

      <div className="px-4 py-6 pb-safe">
        {/* Current Level Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${getLevelColor(currentLevel)} flex flex-col items-center justify-center shadow-lg`}>
              {getLevelIcon(currentLevel)}
              <span className="text-[12px] font-bold text-black mt-1">
                Niv.{currentLevel}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-[12px] text-white/40 uppercase tracking-wide mb-1">Niveau actuel</p>
              <p className="text-[20px] font-bold text-white">
                {REWARDS[currentLevel]?.name || `Niveau ${currentLevel}`}
              </p>
              <p className="text-[14px] text-white/50 mt-1">
                {stats.visitCount} visite{stats.visitCount > 1 ? 's' : ''} au total
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 text-[#4CB0F1]" />
              <span className="text-[12px] text-white/50">Visites</span>
            </div>
            <p className="text-[28px] font-bold text-white">{stats.visitCount}</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span className="text-[12px] text-white/50">Classement</span>
            </div>
            <p className="text-[28px] font-bold text-white">
              {stats.rank ? `#${stats.rank}` : 'N/A'}
            </p>
          </div>
        </div>

        {/* Progress to Next Level */}
        <div className="bg-[#4CB0F1]/10 border border-[#4CB0F1]/20 rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-[#4CB0F1]" />
              <span className="text-[15px] font-medium text-white">
                Progression vers niveau {currentLevel + 1}
              </span>
            </div>
            <span className="text-[14px] text-white/60">
              {progressInLevel}/5
            </span>
          </div>
          <div className="h-3 bg-black/30 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${getLevelColor(currentLevel)} rounded-full transition-all duration-500`}
              style={{ width: `${(progressInLevel / 5) * 100}%` }}
            />
          </div>
          <p className="text-[13px] text-white/40 mt-3">
            {5 - progressInLevel} visite{5 - progressInLevel > 1 ? 's' : ''} restante{5 - progressInLevel > 1 ? 's' : ''} pour débloquer la prochaine récompense
          </p>
        </div>

        {/* Rewards List */}
        <div>
          <h3 className="text-[15px] font-semibold text-white/60 mb-4 px-1">Récompenses</h3>
          <div className="space-y-3">
            {Object.entries(REWARDS).map(([levelStr, reward]) => {
              const level = parseInt(levelStr)
              const isUnlocked = currentLevel >= level
              const isCurrent = currentLevel === level

              return (
                <div
                  key={level}
                  className={`rounded-2xl p-4 flex items-center gap-4 border ${
                    isUnlocked
                      ? 'bg-white/5 border-white/10'
                      : 'bg-white/[0.02] border-white/5 opacity-50'
                  }`}
                >
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${
                    isUnlocked
                      ? `bg-gradient-to-br ${getLevelColor(level)}`
                      : 'bg-white/10'
                  }`}>
                    {reward.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                        isUnlocked
                          ? `bg-gradient-to-r ${getLevelColor(level)} text-black`
                          : 'bg-white/10 text-white/40'
                      }`}>
                        NIVEAU {level}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] font-medium text-[#4CB0F1]">ACTUEL</span>
                      )}
                    </div>
                    <p className="text-[15px] font-semibold text-white">{reward.name}</p>
                    <p className="text-[13px] text-white/50">{reward.description}</p>
                  </div>
                  {isUnlocked && (
                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Star className="w-4 h-4 text-green-400" fill="currentColor" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
