'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  Calendar,
  Users,
  Trophy,
  History,
  XCircle,
  Trash2,
  ChevronRight,
  LogOut,
  Home,
  User
} from 'lucide-react'

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
  customer: {
    firstName: string
    lastName: string
    phone: string
    email?: string
  }
  staff?: {
    name: string
  }
}

export default function AdminPage() {
  const router = useRouter()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming')

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
    router.refresh()
  }

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      const response = await fetch('/api/appointments?salonId=salon-demo')
      if (!response.ok) throw new Error('Failed to fetch appointments')
      const data = await response.json()
      setAppointments(data)
    } catch (error) {
      console.error('Error fetching appointments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAppointment = async (appointmentId: string, customerName: string) => {
    if (!confirm(`Supprimer le rendez-vous de ${customerName} ?`)) return

    try {
      const response = await fetch(`/api/appointments?id=${appointmentId}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete appointment')
      await fetchAppointments()
    } catch (error) {
      console.error('Error deleting appointment:', error)
      alert('Erreur lors de la suppression')
    }
  }

  const filteredAppointments = appointments.filter((apt) => {
    const aptDate = new Date(apt.startAt)
    const now = new Date()
    if (filter === 'upcoming') return aptDate >= now
    if (filter === 'past') return aptDate < now
    return true
  })

  const stats = {
    total: appointments.length,
    upcoming: appointments.filter(a => new Date(a.startAt) >= new Date()).length,
    today: appointments.filter(a => {
      const aptDate = new Date(a.startAt)
      const today = new Date()
      return aptDate.toDateString() === today.toDateString()
    }).length,
  }

  const quickActions = [
    { href: '/admin/calendar', icon: Calendar, label: 'Disponibilités', primary: true },
    { href: '/admin/cancellations', icon: XCircle, label: 'Absences' },
  ]

  const menuItems = [
    { href: '/admin/history', icon: History, label: 'Historique' },
    { href: '/admin/clients', icon: Users, label: 'Clients' },
    { href: '/admin/loyalty', icon: Trophy, label: 'Fidélité' },
  ]

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10 header-safe">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="w-11 h-11 flex items-center justify-center rounded-full bg-white/10 text-white active:scale-95 transition-transform">
              <Home className="w-5 h-5" />
            </Link>
            <span className="text-[17px] font-semibold text-white">Admin</span>
          </div>
          <button
            onClick={handleLogout}
            className="w-11 h-11 flex items-center justify-center rounded-full bg-white/10 text-white/60 active:scale-95 transition-all"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="flex-1 px-4 py-6 pb-safe">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
            <p className="text-[24px] font-bold text-white">{stats.today}</p>
            <p className="text-[12px] text-white/50">Aujourd'hui</p>
          </div>
          <div className="bg-[#4CB0F1]/10 border border-[#4CB0F1]/20 rounded-2xl p-4 text-center">
            <p className="text-[24px] font-bold text-[#4CB0F1]">{stats.upcoming}</p>
            <p className="text-[12px] text-white/50">À venir</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
            <p className="text-[24px] font-bold text-white">{stats.total}</p>
            <p className="text-[12px] text-white/50">Total</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2 mb-6">
          {quickActions.map(({ href, icon: Icon, label, primary }) => (
            <Link key={href} href={href}>
              <div className={`rounded-2xl p-4 flex items-center gap-3 active:scale-[0.98] transition-all ${
                primary
                  ? 'bg-[#4CB0F1] text-black shadow-lg shadow-[#4CB0F1]/20'
                  : 'bg-white/5 border border-white/10 text-white'
              }`}>
                <Icon className="w-5 h-5" />
                <span className="text-[15px] font-medium">{label}</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Menu Items */}
        <div className="bg-white/5 border border-white/10 rounded-2xl mb-6 overflow-hidden divide-y divide-white/10">
          {menuItems.map(({ href, icon: Icon, label }) => (
            <Link key={href} href={href}>
              <div className="flex items-center justify-between p-4 active:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-[15px] text-white">{label}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-white/30" />
              </div>
            </Link>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 p-1 bg-white/5 rounded-2xl mb-4">
          {(['all', 'upcoming', 'past'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 py-2.5 rounded-xl text-[14px] font-medium transition-all ${
                filter === f
                  ? 'bg-[#4CB0F1] text-black shadow-lg'
                  : 'text-white/60 active:text-white'
              }`}
            >
              {f === 'all' ? 'Tous' : f === 'upcoming' ? 'À venir' : 'Passés'}
            </button>
          ))}
        </div>

        {/* Appointments List */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-white/40" />
            </div>
            <p className="text-[15px] text-white/50">Aucun rendez-vous</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredAppointments.map((appointment) => {
              const aptDate = parseISO(appointment.startAt)
              const isPast = aptDate < new Date()

              return (
                <div
                  key={appointment.id}
                  className={`bg-white/5 border border-white/10 rounded-2xl p-4 ${isPast ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    {/* Date badge */}
                    <div className="flex-shrink-0 w-14 text-center">
                      <p className="text-[12px] text-white/50 uppercase">
                        {format(aptDate, 'EEE', { locale: fr })}
                      </p>
                      <p className="text-[20px] font-bold text-white">
                        {format(aptDate, 'd')}
                      </p>
                      <p className="text-[14px] font-medium text-[#4CB0F1]">
                        {format(aptDate, 'HH:mm')}
                      </p>
                    </div>

                    {/* Divider */}
                    <div className="w-px h-12 bg-white/10" />

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-white/40" />
                        <p className="text-[15px] font-medium text-white truncate">
                          {appointment.customer.firstName} {appointment.customer.lastName}
                        </p>
                      </div>
                      <p className="text-[13px] text-white/50 mt-1">
                        {appointment.service.name} · {appointment.service.price}€
                      </p>
                    </div>

                    {/* Delete */}
                    <button
                      onClick={() => handleDeleteAppointment(
                        appointment.id,
                        `${appointment.customer.firstName} ${appointment.customer.lastName}`
                      )}
                      className="p-2 rounded-xl text-white/30 active:text-red-400 active:bg-red-400/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
