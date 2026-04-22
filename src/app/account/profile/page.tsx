'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  ArrowLeft,
  Calendar,
  Clock,
  Scissors,
  User,
  LogOut,
  Edit3,
  ChevronRight,
  X,
  Crown,
  Zap,
  TrendingUp,
  Award
} from 'lucide-react'
import { ProgressionSlider } from '@/components/account/ProgressionSlider'

interface Customer {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
}

interface Appointment {
  id: string
  startAt: string
  endAt: string
  status: string
  service: {
    name: string
    durationMin: number
    price: number
  }
  staff?: {
    name: string
  }
}

interface Level {
  level: number
  requiredRdv: number
  isUnlocked: boolean
  isInProgress: boolean
  progress: number
  reward: string
}

interface Stats {
  visitCount: number
  rank: number | null
  currentLevel: number
  nextMilestone: number
  progressInCurrentLevel: number
  rdvToNextReward: number
  progressPercent: number
  levels: Level[]
}

export default function ProfilePage() {
  const router = useRouter()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [showCancelModal, setShowCancelModal] = useState<string | null>(null)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/auth/customer/me')

      if (!response.ok) {
        router.push('/account')
        return
      }

      const data = await response.json()
      setCustomer(data.customer)
      setAppointments(data.appointments || [])
      setStats(data.stats || null)
    } catch (error) {
      console.error('Error fetching profile:', error)
      router.push('/account')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
    router.refresh()
  }

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      setCancellingId(appointmentId)
      const response = await fetch(`/api/appointments/${appointmentId}/cancel`, {
        method: 'POST',
      })

      if (response.ok) {
        await fetchProfile()
        setShowCancelModal(null)
      } else {
        const data = await response.json()
        alert(data.error || 'Erreur lors de l\'annulation')
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error)
      alert('Erreur lors de l\'annulation du rendez-vous')
    } finally {
      setCancellingId(null)
    }
  }

  const getHoursUntilAppointment = (appointmentDate: string) => {
    const now = new Date()
    const apptDate = new Date(appointmentDate)
    const hours = (apptDate.getTime() - now.getTime()) / (1000 * 60 * 60)
    return Math.round(hours * 10) / 10
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  if (!customer) return null

  const upcomingAppointments = appointments.filter(
    a => new Date(a.startAt) >= new Date() && a.status !== 'CANCELLED'
  )
  const pastAppointments = appointments.filter(a => new Date(a.startAt) < new Date()).slice(0, 3)

  // Message motivationnel intelligent
  const getMotivationalMessage = () => {
    if (!stats) return ''
    if (stats.visitCount === 0) {
      return 'Votre aventure commence ici'
    }
    if (stats.rdvToNextReward === 1) {
      return 'Plus qu\'un passage pour le prochain niveau !'
    }
    if (stats.rdvToNextReward <= 2) {
      return `Presque au niveau ${stats.currentLevel + 1} !`
    }
    return `${stats.rdvToNextReward} passages avant le niveau ${stats.currentLevel + 1}`
  }

  // Message de statut (vocabulaire premium)
  const getRankMessage = () => {
    if (!stats || !stats.rank) return 'Classement en cours'
    if (stats.rank === 1) return 'Au sommet'
    if (stats.rank <= 3) return 'Statut élite'
    if (stats.rank <= 10) return 'Statut privilégié'
    if (stats.rank <= 20) return 'Statut confirmé'
    return 'En progression'
  }

  // Couleur selon le rang
  const getRankColor = () => {
    if (!stats || !stats.rank) return 'from-[#4CB0F1] to-[#4CB0F1]/50'
    if (stats.rank === 1) return 'from-yellow-400 to-amber-600'
    if (stats.rank === 2) return 'from-gray-300 to-gray-500'
    if (stats.rank === 3) return 'from-amber-600 to-amber-800'
    return 'from-[#4CB0F1] to-[#4CB0F1]/50'
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10 header-safe">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="w-11 h-11 flex items-center justify-center rounded-full bg-white/10 text-white active:scale-95 transition-transform">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <span className="text-[17px] font-semibold text-white">Mon espace</span>
          </div>
          <button
            onClick={handleLogout}
            className="w-11 h-11 flex items-center justify-center rounded-full bg-white/10 text-white/60 active:scale-95 transition-all"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="flex-1 pb-safe">
        {/* 1. En-tête personnalisé */}
        <div className="px-4 pt-6 pb-2">
          <h1 className="text-[24px] font-semibold text-white mb-1">
            {customer.firstName}
          </h1>
          <p className="text-[14px] text-white/50">{getMotivationalMessage()}</p>
        </div>

        {/* 2. BLOC STATUT - Premium et mystérieux */}
        {stats && (
          <div className="px-4 py-4">
            <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${getRankColor()} p-[1px]`}>
              <div className="relative bg-[#0a0a0a] rounded-2xl p-6">
                {/* Effet de brillance subtil */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl" />

                <div className="relative">
                  {/* Header avec titre et badge */}
                  <div className="flex items-center justify-between mb-6">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-white/40 font-medium">
                      Statut
                    </p>
                    <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${getRankColor()} bg-opacity-20`}>
                      <span className={`text-[11px] font-semibold uppercase tracking-wide bg-gradient-to-r ${getRankColor()} bg-clip-text text-transparent`}>
                        {getRankMessage()}
                      </span>
                    </div>
                  </div>

                  {/* Rang principal - centré et imposant */}
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center gap-4">
                      {/* Icône de statut */}
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getRankColor()} flex items-center justify-center shadow-lg`}>
                        {stats.rank === 1 ? (
                          <Crown className="w-8 h-8 text-black" />
                        ) : stats.rank && stats.rank <= 3 ? (
                          <Award className="w-8 h-8 text-black" />
                        ) : (
                          <TrendingUp className="w-8 h-8 text-black" />
                        )}
                      </div>

                      {/* Rang */}
                      <div className="text-left">
                        <p className="text-[11px] text-white/30 uppercase tracking-wider mb-1">
                          Rang
                        </p>
                        {stats.rank ? (
                          <p className="text-[48px] font-black text-white leading-none">
                            #{stats.rank}
                          </p>
                        ) : (
                          <p className="text-[24px] font-semibold text-white/50 leading-none">
                            Non classé
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Micro-texte motivationnel */}
                  <p className="text-center text-[12px] text-white/30 mb-6">
                    Votre fidélité est récompensée
                  </p>

                  {/* Stats en bas - vocabulaire premium */}
                  <div className="relative pt-4 border-t border-white/10 flex items-center justify-around">
                    <div className="text-center">
                      <p className="text-[20px] font-bold text-white">{stats.visitCount}</p>
                      <p className="text-[10px] text-white/30 uppercase tracking-wider">Visites</p>
                    </div>
                    <div className="w-px h-8 bg-white/10" />
                    <div className="text-center">
                      <p className="text-[20px] font-bold text-[#4CB0F1]">{stats.currentLevel}</p>
                      <p className="text-[10px] text-white/30 uppercase tracking-wider">Niveau</p>
                    </div>
                    <div className="w-px h-8 bg-white/10" />
                    <div className="text-center">
                      <p className="text-[20px] font-bold text-white">{stats.rdvToNextReward}</p>
                      <p className="text-[10px] text-white/30 uppercase tracking-wider">Prochain</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. Bloc principal : Progression / Pass de combat */}
        {stats && (
          <div className="mb-6">
            <div className="flex items-center justify-between px-4 mb-3">
              <h2 className="text-[17px] font-semibold text-white">Ma progression</h2>
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#4CB0F1]/10 rounded-lg">
                <Zap className="w-3.5 h-3.5 text-[#4CB0F1]" />
                <span className="text-[13px] font-medium text-[#4CB0F1]">
                  Niveau {stats.currentLevel}
                </span>
              </div>
            </div>

            <ProgressionSlider
              levels={stats.levels}
              currentLevel={stats.currentLevel}
              visitCount={stats.visitCount}
              rdvToNextReward={stats.rdvToNextReward}
            />

            {/* Message récompenses bientôt disponibles */}
            <div className="mx-4 mt-4 p-4 bg-[#4CB0F1]/10 border border-[#4CB0F1]/20 rounded-xl">
              <p className="text-[14px] text-[#4CB0F1] font-medium mb-1">
                Récompenses bientôt disponibles
              </p>
              <p className="text-[13px] text-white/60 leading-relaxed">
                Pas de panique ! Vos passages sont bien comptabilisés depuis le lancement du site. Les récompenses seront activées très prochainement.
              </p>
            </div>
          </div>
        )}

        {/* 3. Bloc RDV */}
        <div className="px-4 mb-6">
          <h2 className="text-[17px] font-semibold text-white mb-3">Rendez-vous</h2>

          {upcomingAppointments.length > 0 ? (
            <div className="space-y-3">
              {upcomingAppointments.slice(0, 2).map((apt) => {
                const aptDate = parseISO(apt.startAt)
                const hoursUntil = getHoursUntilAppointment(apt.startAt)
                const isLateCancel = hoursUntil < 12

                return (
                  <div key={apt.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                    <div className="p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-[#4CB0F1]" />
                        <div>
                          <p className="text-[15px] text-white font-medium capitalize">
                            {format(aptDate, 'EEEE d MMMM', { locale: fr })}
                          </p>
                          <p className="text-[13px] text-white/50">{format(aptDate, 'HH:mm')}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Scissors className="w-5 h-5 text-[#4CB0F1]" />
                        <div>
                          <p className="text-[15px] text-white">{apt.service.name}</p>
                          <p className="text-[13px] text-white/50">
                            {apt.service.durationMin} min · {apt.service.price}€
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-[#4CB0F1]" />
                        <p className="text-[15px] text-white/60">
                          {hoursUntil > 24
                            ? `Dans ${Math.floor(hoursUntil / 24)} jour${Math.floor(hoursUntil / 24) > 1 ? 's' : ''}`
                            : `Dans ${Math.floor(hoursUntil)} heure${Math.floor(hoursUntil) > 1 ? 's' : ''}`}
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-white/5 p-4">
                      <button
                        onClick={() => setShowCancelModal(apt.id)}
                        className="w-full py-3 rounded-xl text-[14px] font-medium text-red-400 bg-red-500/10 border border-red-500/20 active:bg-red-500/20 transition-all"
                      >
                        Annuler le rendez-vous
                      </button>
                    </div>

                    {isLateCancel && (
                      <div className="px-4 pb-4">
                        <p className="text-[12px] text-yellow-500 text-center">
                          Moins de 12h avant le RDV
                        </p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-white/40" />
              </div>
              <p className="text-[15px] text-white/50 mb-5">Aucun rendez-vous prevu</p>
              <Link href="/">
                <button className="px-8 py-4 bg-[#4CB0F1] text-black rounded-2xl text-[15px] font-semibold shadow-lg shadow-[#4CB0F1]/20 active:scale-[0.98] transition-all">
                  Reserver maintenant
                </button>
              </Link>
            </div>
          )}
        </div>

        {/* 5. Historique récent */}
        {pastAppointments.length > 0 && (
          <div className="px-4 mb-6">
            <h2 className="text-[17px] font-semibold text-white mb-3">Historique</h2>
            <div className="space-y-2">
              {pastAppointments.map((apt) => {
                const aptDate = parseISO(apt.startAt)
                return (
                  <div key={apt.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 opacity-60">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[15px] text-white capitalize">
                          {format(aptDate, 'EEEE d MMMM', { locale: fr })}
                        </p>
                        <p className="text-[13px] text-white/50">
                          {apt.service.name} · {format(aptDate, 'HH:mm')}
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-white/10 rounded-full text-[12px] text-white/50">
                        Terminé
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* 6. Mes informations (secondaire) */}
        <div className="px-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[17px] font-semibold text-white">Mes informations</h2>
            <Link href="/account/profile/edit">
              <button className="flex items-center gap-1.5 text-[14px] text-[#4CB0F1]">
                <Edit3 className="w-4 h-4" />
                Modifier
              </button>
            </Link>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl divide-y divide-white/5">
            <div className="px-4 py-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-[13px] text-white/40">Nom complet</p>
                <p className="text-[15px] text-white font-medium">{customer.firstName} {customer.lastName}</p>
              </div>
            </div>
            <div className="px-4 py-4">
              <p className="text-[13px] text-white/40">Email</p>
              <p className="text-[15px] text-white">{customer.email}</p>
            </div>
            <div className="px-4 py-4">
              <p className="text-[13px] text-white/40">Telephone</p>
              <p className="text-[15px] text-white">{customer.phone}</p>
            </div>
          </div>
        </div>

        {/* 7. Liens secondaires */}
        <div className="px-4">
          <Link href="/account/privacy">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between active:bg-white/10 transition-all">
              <span className="text-[15px] text-white">Parametres du compte</span>
              <ChevronRight className="w-5 h-5 text-white/40" />
            </div>
          </Link>
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-black border-t border-white/10 rounded-t-3xl p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[17px] font-semibold text-white">Annuler le rendez-vous ?</h3>
              <button onClick={() => setShowCancelModal(null)} className="text-white/60">
                <X className="w-6 h-6" />
              </button>
            </div>

            {(() => {
              const apt = upcomingAppointments.find(a => a.id === showCancelModal)
              if (!apt) return null
              const hoursUntil = getHoursUntilAppointment(apt.startAt)
              const isLate = hoursUntil < 12

              return (
                <>
                  {isLate && (
                    <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-xl">
                      <p className="text-[14px] text-yellow-500 font-medium mb-1">Annulation tardive</p>
                      <p className="text-[13px] text-white/60">
                        Il reste moins de 12h avant votre RDV. Merci de prévenir par téléphone si possible.
                      </p>
                    </div>
                  )}

                  <p className="text-[14px] text-white/60 mb-6">
                    Cette action est irréversible. Vous devrez reprendre un nouveau rendez-vous.
                  </p>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowCancelModal(null)}
                      className="flex-1 py-4 rounded-xl text-[15px] font-medium text-white bg-white/10"
                    >
                      Non, garder
                    </button>
                    <button
                      onClick={() => handleCancelAppointment(showCancelModal)}
                      disabled={cancellingId === showCancelModal}
                      className="flex-1 py-4 rounded-xl text-[15px] font-medium text-white bg-red-500 disabled:opacity-50"
                    >
                      {cancellingId === showCancelModal ? 'Annulation...' : 'Oui, annuler'}
                    </button>
                  </div>
                </>
              )
            })()}
          </div>
        </div>
      )}
    </div>
  )
}
