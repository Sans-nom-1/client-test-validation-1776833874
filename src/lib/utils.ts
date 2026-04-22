import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO, addHours, isBefore, isAfter } from 'date-fns'
import { fr } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string, formatStr: string = 'PPP') {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, formatStr, { locale: fr })
}

export function formatTime(date: Date | string) {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, 'HH:mm')
}

export function formatDateTime(date: Date | string) {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, 'dd/MM/yyyy à HH:mm', { locale: fr })
}

export function canCancelAppointment(appointmentDate: Date | string, hoursBeforeLimit: number = 12) {
  const apptDate = typeof appointmentDate === 'string' ? parseISO(appointmentDate) : appointmentDate
  const cancelDeadline = addHours(new Date(), hoursBeforeLimit)
  return isAfter(apptDate, cancelDeadline)
}

export function shouldSendReminder(appointmentDate: Date | string, reminderHoursBefore: number = 24) {
  const apptDate = typeof appointmentDate === 'string' ? parseISO(appointmentDate) : appointmentDate
  const reminderTime = addHours(apptDate, -reminderHoursBefore)
  const now = new Date()

  return isBefore(now, apptDate) && isAfter(now, reminderTime)
}

export function generateCancelToken() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}
