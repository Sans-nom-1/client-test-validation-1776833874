'use client'

import { useState } from 'react'
import ServiceSelection from '@/components/booking/ServiceSelection'
import DateTimeSelection from '@/components/booking/DateTimeSelection'
import AuthStep from '@/components/booking/AuthStep'
import BookingConfirmation from '@/components/booking/BookingConfirmation'
import FloatingNav from '@/components/navigation/FloatingNav'
import { SALON_ID } from '@/lib/config'
import { IOSStepper, IOSCard } from '@/components/ios'

type BookingStep = 'service' | 'datetime' | 'auth' | 'confirmation'

interface BookingData {
  salonId: string
  serviceId?: string
  staffId?: string
  date?: string
  time?: string
  firstName?: string
  lastName?: string
  phone?: string
  appointmentId?: string
}

export default function BookingPage() {
  const [step, setStep] = useState<BookingStep>('service')
  const [bookingData, setBookingData] = useState<BookingData>({
    salonId: SALON_ID,
  })

  const updateBookingData = (data: Partial<BookingData>) => {
    setBookingData((prev) => ({ ...prev, ...data }))
  }

  const handleServiceSelect = (serviceId: string) => {
    updateBookingData({ serviceId })
    setStep('datetime')
  }

  const handleDateTimeSelect = (date: string, time: string) => {
    updateBookingData({ date, time })
    setStep('auth')
  }

  const handleAuthenticated = async () => {
    try {
      const profileResponse = await fetch('/api/auth/customer/me')
      if (!profileResponse.ok) {
        throw new Error('Erreur lors de la récupération du profil')
      }

      const { customer } = await profileResponse.json()

      const appointmentResponse = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...bookingData,
          firstName: customer.firstName,
          lastName: customer.lastName,
          phone: customer.phone,
        }),
      })

      if (!appointmentResponse.ok) {
        const error = await appointmentResponse.json()
        throw new Error(error.error || 'Erreur lors de la réservation')
      }

      const appointment = await appointmentResponse.json()
      updateBookingData({ appointmentId: appointment.id })
      setStep('confirmation')
    } catch (error) {
      console.error('Booking error:', error)
      alert(error instanceof Error ? error.message : 'Erreur lors de la réservation')
    }
  }

  const goBack = () => {
    const steps: BookingStep[] = ['service', 'datetime', 'auth', 'confirmation']
    const currentIndex = steps.indexOf(step)
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1])
    }
  }

  const stepNumber = (s: BookingStep) => {
    const steps: BookingStep[] = ['service', 'datetime', 'auth', 'confirmation']
    return steps.indexOf(s)
  }

  const stepLabels = ['Service', 'Date', 'Confirmer']

  return (
    <div className="min-h-screen bg-background-primary">
      <FloatingNav />

      <div className="mx-auto max-w-2xl px-4 py-10 pt-24 pb-16">
        {/* Progress Steps - iOS Style */}
        <IOSStepper
          steps={stepLabels}
          currentStep={step === 'confirmation' ? 3 : stepNumber(step)}
          className="mb-ios-6"
        />

        {/* Content Card */}
        <IOSCard variant="elevated" className="animate-ios-fade-in">
          {step === 'service' && (
            <ServiceSelection salonId={bookingData.salonId} onSelect={handleServiceSelect} />
          )}

          {step === 'datetime' && bookingData.serviceId && (
            <DateTimeSelection
              salonId={bookingData.salonId}
              serviceId={bookingData.serviceId}
              onSelect={handleDateTimeSelect}
              onBack={goBack}
            />
          )}

          {step === 'auth' && (
            <AuthStep onAuthenticated={handleAuthenticated} onBack={goBack} />
          )}

          {step === 'confirmation' && bookingData.appointmentId && (
            <BookingConfirmation appointmentId={bookingData.appointmentId} />
          )}
        </IOSCard>
      </div>
    </div>
  )
}
