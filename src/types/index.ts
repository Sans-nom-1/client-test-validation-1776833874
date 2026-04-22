import { Prisma } from '@prisma/client'

export type AppointmentWithRelations = Prisma.AppointmentGetPayload<{
  include: {
    customer: true
    service: true
    staff: true
  }
}>

export type CustomerWithStats = Prisma.CustomerGetPayload<{
  include: {
    visits: true
    appointments: {
      where: {
        status: 'BOOKED'
      }
    }
  }
}>

export type VisitWithRelations = Prisma.VisitGetPayload<{
  include: {
    service: true
    appointment: true
  }
}>

export interface TimeSlot {
  start: string
  end: string
  available: boolean
}

export interface BookingFormData {
  serviceId: string
  staffId?: string
  date: string
  time: string
  firstName: string
  lastName: string
  phone: string
  email?: string
}

export interface CustomerStats {
  totalVisits: number
  lastVisitDate?: Date
  upcomingAppointments: number
  noShowCount: number
}

export interface SalonSettings {
  openingHours: {
    [key: string]: {
      open: string
      close: string
      closed?: boolean
    }
  }
  slotDurationMin: number
  cancellationDeadlineHours: number
  smsReminderHoursBefore: number
  allowSameDayBooking: boolean
}

export const DEFAULT_SALON_SETTINGS: SalonSettings = {
  openingHours: {
    monday: { open: '09:00', close: '19:00' },
    tuesday: { open: '09:00', close: '19:00' },
    wednesday: { open: '09:00', close: '19:00' },
    thursday: { open: '09:00', close: '19:00' },
    friday: { open: '09:00', close: '19:00' },
    saturday: { open: '09:00', close: '18:00' },
    sunday: { closed: true, open: '00:00', close: '00:00' },
  },
  slotDurationMin: 30,
  cancellationDeadlineHours: 12,
  smsReminderHoursBefore: 24,
  allowSameDayBooking: true,
}
