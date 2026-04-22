import { toZonedTime, fromZonedTime, format as formatTz } from 'date-fns-tz'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

// Timezone de Paris
export const PARIS_TIMEZONE = 'Europe/Paris'

/**
 * Convertit une date UTC en heure de Paris pour l'affichage
 */
export function toParisTime(date: Date): Date {
  return toZonedTime(date, PARIS_TIMEZONE)
}

/**
 * Convertit une date/heure locale de Paris en UTC pour le stockage
 * @param dateStr - Date au format YYYY-MM-DD
 * @param timeStr - Heure au format HH:mm
 */
export function parisTimeToUTC(dateStr: string, timeStr: string): Date {
  // Creer une date en heure de Paris
  const parisDateTimeStr = `${dateStr}T${timeStr}:00`
  // fromZonedTime convertit une heure locale vers UTC
  return fromZonedTime(parisDateTimeStr, PARIS_TIMEZONE)
}

/**
 * Formate une date en francais avec l'heure de Paris
 */
export function formatDateParis(date: Date, formatStr: string = 'EEEE d MMMM'): string {
  const parisDate = toParisTime(date)
  return format(parisDate, formatStr, { locale: fr })
}

/**
 * Formate l'heure en heure de Paris
 */
export function formatTimeParis(date: Date): string {
  const parisDate = toParisTime(date)
  return format(parisDate, 'HH:mm', { locale: fr })
}

/**
 * Obtient le jour de la semaine en heure de Paris
 */
export function getParisDay(date: Date): number {
  const parisDate = toParisTime(date)
  return parisDate.getDay()
}

/**
 * Obtient le debut du jour en UTC pour une date donnee (minuit Paris)
 */
export function getStartOfDayParis(date: Date): Date {
  const parisDate = toParisTime(date)
  const startOfDay = new Date(parisDate)
  startOfDay.setHours(0, 0, 0, 0)
  return fromZonedTime(startOfDay, PARIS_TIMEZONE)
}

/**
 * Obtient la fin du jour en UTC pour une date donnee (23:59:59 Paris)
 */
export function getEndOfDayParis(date: Date): Date {
  const parisDate = toParisTime(date)
  const endOfDay = new Date(parisDate)
  endOfDay.setHours(23, 59, 59, 999)
  return fromZonedTime(endOfDay, PARIS_TIMEZONE)
}
