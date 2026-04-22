'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Check, Calendar, Clock, Scissors, User, Bell, ChevronRight } from 'lucide-react'

interface Appointment {
  id: string
  startAt: string
  endAt: string
  service: {
    name: string
    durationMin: number
    price: number
  }
  customer: {
    firstName: string
    lastName: string
    phone: string
  }
  staff?: {
    name: string
  }
}

interface BookingConfirmationProps {
  appointmentId: string
}

export default function BookingConfirmation({ appointmentId }: BookingConfirmationProps) {
  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAppointment()
  }, [appointmentId])

  const fetchAppointment = async () => {
    try {
      const response = await fetch(`/api/appointments?salonId=salon-demo`)
      if (!response.ok) throw new Error('Failed to fetch appointment')

      const appointments = await response.json()
      const appt = appointments.find((a: Appointment) => a.id === appointmentId)
      setAppointment(appt)
    } catch (error) {
      console.error('Error fetching appointment:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  if (!appointment) {
    return (
      <div className="text-center py-8">
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-[14px]">
          Impossible de charger les details du rendez-vous
        </div>
      </div>
    )
  }

  const startDate = parseISO(appointment.startAt)

  return (
    <div className="animate-fade-in">
      {/* Success Animation */}
      <div className="flex flex-col items-center mb-8">
        <div className="relative">
          {/* Cercles d'animation */}
          <div className="absolute inset-0 w-24 h-24 rounded-full bg-green-500/20 animate-ping" />
          <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/30">
            <Check className="w-12 h-12 text-white" strokeWidth={3} />
          </div>
        </div>

        <h2 className="text-[24px] font-bold text-white mt-6 mb-2">Confirme !</h2>
        <p className="text-[14px] text-white/60 text-center">
          Un SMS de confirmation a été envoyé au<br />
          <span className="text-white font-medium">{appointment.customer.phone}</span>
        </p>
      </div>

      {/* Appointment Card */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden mb-6">
        {/* Header */}
        <div className="p-5 border-b border-white/10">
          <p className="text-[12px] text-white/40 uppercase tracking-wider mb-1">Votre rendez-vous</p>
          <p className="text-[20px] font-semibold text-white capitalize">
            {format(startDate, 'EEEE d MMMM', { locale: fr })}
          </p>
        </div>

        {/* Details */}
        <div className="divide-y divide-white/5">
          <div className="flex items-center gap-4 px-5 py-4">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[13px] text-white/40">Heure</p>
              <p className="text-[16px] text-white font-medium">{format(startDate, 'HH:mm')}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 px-5 py-4">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Scissors className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-[13px] text-white/40">Prestation</p>
              <p className="text-[16px] text-white font-medium">{appointment.service.name}</p>
            </div>
            <p className="text-[15px] text-white/60">{appointment.service.durationMin} min</p>
          </div>

          <div className="flex items-center gap-4 px-5 py-4">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[13px] text-white/40">Client</p>
              <p className="text-[16px] text-white font-medium">
                {appointment.customer.firstName} {appointment.customer.lastName}
              </p>
            </div>
          </div>
        </div>

        {/* Price Footer */}
        <div className="px-5 py-4 bg-white/5 flex items-center justify-between">
          <span className="text-[15px] text-white/60">Prix indicatif</span>
          <span className="text-[20px] font-bold text-white">{appointment.service.price} €</span>
        </div>
      </div>

      {/* Info Alert */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center flex-shrink-0">
            <Bell className="w-5 h-5 text-accent" />
          </div>
          <div>
            <p className="text-[15px] text-white font-medium mb-1">Rappel SMS</p>
            <p className="text-[13px] text-white/50 leading-relaxed">
              Vous recevrez un SMS de rappel 24h avant votre rendez-vous.
              Annulation possible jusqu&apos;a 12h avant.
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <Link href="/account/profile" className="block">
          <button className="w-full py-4 rounded-2xl text-[16px] font-semibold bg-[#4CB0F1] text-black shadow-lg shadow-[#4CB0F1]/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
            Acceder a mon compte
            <ChevronRight className="w-5 h-5" />
          </button>
        </Link>

        <Link href="/" className="block">
          <button className="w-full py-3 text-[15px] text-white/50 text-center hover:text-white/70 transition-colors">
            Retour a l&apos;accueil
          </button>
        </Link>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  )
}
