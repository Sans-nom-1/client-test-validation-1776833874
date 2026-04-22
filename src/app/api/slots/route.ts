import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { addMinutes } from 'date-fns'
import { DEFAULT_SALON_SETTINGS } from '@/types'
import { parisTimeToUTC, toParisTime, getStartOfDayParis, getEndOfDayParis, getParisDay } from '@/lib/timezone'

// Helper function to format Date to HH:mm in Paris time
function formatParis(date: Date): string {
  const parisDate = toParisTime(date)
  const hours = parisDate.getHours().toString().padStart(2, '0')
  const minutes = parisDate.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const salonId = searchParams.get('salonId')
    const serviceId = searchParams.get('serviceId')
    const date = searchParams.get('date')

    if (!salonId || !serviceId || !date) {
      return NextResponse.json(
        { error: 'salonId, serviceId, and date are required' },
        { status: 400 }
      )
    }

    const salon = await prisma.salon.findUnique({
      where: { id: salonId },
    })

    if (!salon) {
      return NextResponse.json({ error: 'Salon not found' }, { status: 404 })
    }

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    })

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    const settings = salon.settings
      ? (typeof salon.settings === 'string' ? JSON.parse(salon.settings) : salon.settings)
      : DEFAULT_SALON_SETTINGS

    // Utiliser la timezone Paris pour determiner le jour de la semaine
    const targetDate = parisTimeToUTC(date, '12:00') // Midi pour eviter les problemes de changement de jour
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const dayOfWeek = dayNames[getParisDay(targetDate)]
    const daySettings = settings.openingHours?.[dayOfWeek]

    if (!daySettings || daySettings.closed) {
      return NextResponse.json([])
    }

    // Récupérer tous les staff actifs du salon
    const allStaff = await prisma.staff.findMany({
      where: {
        salonId,
        isActive: true,
      },
      select: {
        id: true,
      },
    })

    if (allStaff.length === 0) {
      return NextResponse.json([])
    }

    // Calculer le debut et la fin du jour en UTC (minuit Paris -> 23h59 Paris)
    const dayStart = getStartOfDayParis(targetDate)
    const dayEnd = getEndOfDayParis(targetDate)

    // Récupérer les disponibilités de tous les staff pour ce jour
    const staffAvailabilities = await prisma.staffAvailability.findMany({
      where: {
        staffId: {
          in: allStaff.map(s => s.id),
        },
        date: {
          gte: dayStart,
          lte: dayEnd,
        },
      },
    })

    // Si AUCUN staff n'a de disponibilité définie pour ce jour, retourner tableau vide
    if (staffAvailabilities.length === 0) {
      return NextResponse.json([])
    }

    // Récupérer tous les rendez-vous existants pour ce jour
    const existingAppointments = await prisma.appointment.findMany({
      where: {
        salonId,
        startAt: {
          gte: dayStart,
          lte: dayEnd,
        },
        status: {
          in: ['BOOKED'],
        },
      },
      select: {
        staffId: true,
        startAt: true,
        endAt: true,
      },
    })


    // Generer les creneaux en agregeant les disponibilites de tous les staff
    const slots = generateAggregatedTimeSlots(
      service.durationMin,
      allStaff.map(s => s.id),
      staffAvailabilities,
      existingAppointments,
      targetDate,
      date
    )

    return NextResponse.json(slots)
  } catch (error) {
    console.error('Error fetching slots:', error)
    return NextResponse.json({ error: 'Failed to fetch available slots' }, { status: 500 })
  }
}

function generateAggregatedTimeSlots(
  durationMin: number,
  staffIds: string[],
  staffAvailabilities: any[],
  existingAppointments: { staffId: string | null; startAt: Date; endAt: Date }[],
  targetDate: Date,
  dateStr: string
) {
  const slots: { start: string; end: string; available: boolean }[] = []
  const slotSet = new Map<string, { time: Date; available: boolean }>() // Pour eviter les doublons

  // Pour chaque disponibilite de staff, generer des creneaux
  staffAvailabilities.forEach((availability) => {
    // Si le staff est bloque, ne pas generer de creneaux
    if (availability.isBlocked) {
      return
    }

    // Les heures de disponibilite sont en heure Paris (ex: "09:00")
    // On les convertit en UTC pour les stocker
    const slotStartUTC = parisTimeToUTC(dateStr, availability.startTime)
    const slotEndUTC = parisTimeToUTC(dateStr, availability.endTime)

    // Generer les creneaux pour cette plage horaire
    const currentSlot = new Date(slotStartUTC)

    while (currentSlot < slotEndUTC) {
      const slotEndTime = addMinutes(currentSlot, durationMin)
      // Utiliser l'heure Paris pour la cle (c'est ce que voit l'utilisateur)
      const slotKey = formatParis(currentSlot)

      // Si ce creneau n'existe pas encore dans le Map, l'ajouter
      if (!slotSet.has(slotKey)) {
        // Un creneau est disponible si au moins UN staff peut le prendre
        const isAvailable = staffIds.some((staffId) => {
          // Verifier les disponibilites de ce staff
          const staffAvails = staffAvailabilities.filter((a) => a.staffId === staffId)

          // Si le staff n'a aucune disponibilite, il ne peut pas prendre le creneau
          if (staffAvails.length === 0) {
            return false
          }

          // Verifier si au moins une plage horaire de ce staff couvre ce creneau
          const hasAvailability = staffAvails.some((avail) => {
            if (avail.isBlocked) return false

            const staffStart = parisTimeToUTC(dateStr, avail.startTime)
            const staffEnd = parisTimeToUTC(dateStr, avail.endTime)

            // Le creneau doit COMMENCER dans la plage de disponibilite
            return currentSlot >= staffStart && currentSlot < staffEnd
          })

          if (!hasAvailability) {
            return false
          }

          // Verifier si le staff a deja un rendez-vous pendant ce creneau
          const hasAppointment = existingAppointments.some((appt) => {
            if (appt.staffId !== staffId) return false

            const conflict = (
              (currentSlot >= appt.startAt && currentSlot < appt.endAt) ||
              (slotEndTime > appt.startAt && slotEndTime <= appt.endAt) ||
              (currentSlot <= appt.startAt && slotEndTime >= appt.endAt)
            )

            return conflict
          })

          // Ce staff est disponible si pas de rendez-vous
          return !hasAppointment
        })

        // Verifier si le creneau est dans le passe
        const currentTime = new Date()
        const isPastSlot = currentSlot <= currentTime

        slotSet.set(slotKey, { time: new Date(currentSlot), available: isAvailable && !isPastSlot })
      }

      currentSlot.setTime(currentSlot.getTime() + 30 * 60 * 1000)
    }
  })

  // Convertir le Map en array et trier par heure
  const sortedSlots = Array.from(slotSet.entries())
    .map(([start, data]) => {
      const slotEnd = addMinutes(data.time, durationMin)

      return {
        start,
        end: formatParis(slotEnd),
        available: data.available,
      }
    })
    .sort((a, b) => a.start.localeCompare(b.start))

  return sortedSlots
}
