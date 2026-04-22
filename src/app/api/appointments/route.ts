import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendBookingConfirmationSms, notifySalonOfNewBooking, sendModificationSms, notifySalonOfModification, sendCancellationSms, notifySalonOfCancellation } from '@/lib/sms'
import { sendPushToCustomer } from '@/lib/push'
import { parisTimeToUTC } from '@/lib/timezone'
import { getSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const salonId = searchParams.get('salonId')

    if (!salonId) {
      return NextResponse.json({ error: 'salonId is required' }, { status: 400 })
    }

    const appointments = await prisma.appointment.findMany({
      where: {
        salonId,
      },
      include: {
        service: true,
        customer: true,
        staff: true,
      },
      orderBy: {
        startAt: 'asc',
      },
    })

    return NextResponse.json(appointments)
  } catch (error) {
    console.error('Error fetching appointments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { salonId, serviceId, staffId, date, time, firstName, lastName, phone } = body

    if (!salonId || !serviceId || !date || !time || !firstName || !lastName || !phone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Prevent cross-salon bookings
    const expectedSalonId = process.env.SALON_ID || 'salon-demo'
    if (salonId !== expectedSalonId) {
      return NextResponse.json({ error: 'Salon invalide' }, { status: 403 })
    }

    // Récupérer le service pour obtenir la durée
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    })

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    // Créer ou récupérer le client
    let customer = await prisma.customer.findFirst({
      where: {
        phone,
        salonId,
      },
    })

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          firstName,
          lastName,
          phone,
          salonId,
        },
      })
    }

    // Calculer startAt et endAt - convertir l'heure de Paris en UTC
    const startAt = parisTimeToUTC(date, time)

    const endAt = new Date(startAt)
    endAt.setMinutes(endAt.getMinutes() + service.durationMin)

    // Valider le staffId fourni s'il est présent
    if (staffId) {
      const staffExists = await prisma.staff.findFirst({
        where: { id: staffId, salonId, isActive: true },
      })
      if (!staffExists) {
        return NextResponse.json({ error: 'Staff non trouvé ou inactif' }, { status: 400 })
      }
    }

    // Assigner le staff et créer le rendez-vous de manière atomique pour éviter le double-booking
    const appointment = await prisma.$transaction(async (tx) => {
      const dayStart = new Date(startAt)
      dayStart.setUTCHours(0, 0, 0, 0)
      const dayEnd = new Date(startAt)
      dayEnd.setUTCHours(23, 59, 59, 999)

      let assignedStaffId = staffId

      if (!assignedStaffId) {
        const allStaff = await tx.staff.findMany({ where: { salonId, isActive: true } })

        const staffAvailabilities = await tx.staffAvailability.findMany({
          where: {
            staffId: { in: allStaff.map((s) => s.id) },
            date: { gte: dayStart, lte: dayEnd },
          },
        })

        const existingAppointments = await tx.appointment.findMany({
          where: { salonId, startAt: { gte: dayStart, lte: dayEnd }, status: 'BOOKED' },
        })

        for (const staff of allStaff) {
          const avail = staffAvailabilities.find((a) => a.staffId === staff.id)
          if (avail?.isBlocked) continue

          const hasConflict = existingAppointments.some((appt) => {
            if (appt.staffId !== staff.id) return false
            return (
              (startAt >= appt.startAt && startAt < appt.endAt) ||
              (endAt > appt.startAt && endAt <= appt.endAt) ||
              (startAt <= appt.startAt && endAt >= appt.endAt)
            )
          })

          if (!hasConflict) {
            assignedStaffId = staff.id
            break
          }
        }

        if (!assignedStaffId) {
          throw new Error('Aucun staff disponible pour ce créneau')
        }
      } else {
        // Vérifier le conflit pour le staff explicitement choisi dans la transaction
        const conflict = await tx.appointment.findFirst({
          where: {
            staffId: assignedStaffId,
            status: 'BOOKED',
            OR: [
              { startAt: { lte: startAt }, endAt: { gt: startAt } },
              { startAt: { lt: endAt }, endAt: { gte: endAt } },
              { startAt: { gte: startAt }, endAt: { lte: endAt } },
            ],
          },
        })
        if (conflict) throw new Error('Ce créneau n\'est plus disponible')
      }

      return tx.appointment.create({
        data: { salonId, serviceId, staffId: assignedStaffId, customerId: customer.id, startAt, endAt, status: 'BOOKED' },
        include: { service: true, customer: true, staff: true, salon: true },
      })
    }).catch((err: Error) => {
      throw new Error(err.message)
    })

    // Envoyer le SMS de confirmation au client
    try {
      console.log('[SMS] Envoi confirmation au client:', customer.phone)
      const result = await sendBookingConfirmationSms({
        id: appointment.id,
        salonId: appointment.salonId,
        customerId: customer.id,
        startAt,
        customer: { phone: customer.phone, firstName: customer.firstName },
        service: { name: service.name },
        salon: { name: appointment.salon.name },
      })
      console.log('[SMS] Resultat envoi confirmation:', result.success)

      await prisma.appointment.update({
        where: { id: appointment.id },
        data: {
          confirmationSmsSent: result.success,
          confirmationSmsAt: result.success ? new Date() : null,
        },
      })
    } catch (error) {
      console.error('[SMS] Erreur envoi confirmation client:', error)
    }

    try {
      await notifySalonOfNewBooking({
        id: appointment.id,
        salonId: appointment.salonId,
        startAt,
        customer: {
          firstName: customer.firstName,
          lastName: customer.lastName,
          phone: customer.phone,
        },
        service: { name: service.name },
      })
    } catch (error) {
      console.error('Erreur notification salon nouveau RDV:', error)
    }

    // Notification push au client (si abonné)
    try {
      const dateStr = startAt.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Europe/Paris' })
      const timeStr = startAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' })
      await sendPushToCustomer(customer.id, {
        title: 'Rendez-vous confirmé ✓',
        body: `${service.name} — ${dateStr} à ${timeStr}`,
        url: '/',
        tag: `rdv-${appointment.id}`,
      })
    } catch (error) {
      console.error('[Push] Erreur notification confirmation:', error)
    }

    return NextResponse.json(appointment, { status: 201 })
  } catch (error) {
    console.error('Error creating appointment:', error)
    return NextResponse.json(
      { error: 'Failed to create appointment' },
      { status: 500 }
    )
  }
}

// PUT - Modifier un RDV existant (pas créer un nouveau)
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session || session.role !== 'CUSTOMER' || !session.userId) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { appointmentId, serviceId, date, time } = body

    if (!appointmentId) {
      return NextResponse.json(
        { error: 'appointmentId requis' },
        { status: 400 }
      )
    }

    // Récupérer le RDV existant
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        customer: true,
        service: true,
        salon: true,
      },
    })

    if (!existingAppointment) {
      return NextResponse.json({ error: 'RDV non trouvé' }, { status: 404 })
    }

    // Vérifier que le RDV appartient au client
    if (existingAppointment.customerId !== session.userId) {
      return NextResponse.json(
        { error: 'Non autorisé à modifier ce RDV' },
        { status: 403 }
      )
    }

    // Vérifier que le RDV n'est pas annulé
    if (existingAppointment.status === 'CANCELLED') {
      return NextResponse.json(
        { error: 'Impossible de modifier un RDV annulé' },
        { status: 400 }
      )
    }

    // Garder l'ancienne date pour le SMS
    const oldStartAt = new Date(existingAppointment.startAt)

    // Préparer les mises à jour
    const updates: {
      serviceId?: string
      startAt?: Date
      endAt?: Date
    } = {}

    // Si nouveau service
    let service = existingAppointment.service
    if (serviceId && serviceId !== existingAppointment.serviceId) {
      const newService = await prisma.service.findUnique({
        where: { id: serviceId },
      })
      if (!newService) {
        return NextResponse.json({ error: 'Service non trouvé' }, { status: 404 })
      }
      service = newService
      updates.serviceId = serviceId
    }

    // Si nouvelle date/heure
    if (date && time) {
      const newStartAt = parisTimeToUTC(date, time)
      const newEndAt = new Date(newStartAt)
      newEndAt.setMinutes(newEndAt.getMinutes() + service.durationMin)

      // Vérifier disponibilité du créneau (en excluant le RDV actuel)
      const conflictingAppointment = await prisma.appointment.findFirst({
        where: {
          id: { not: appointmentId },
          salonId: existingAppointment.salonId,
          status: 'BOOKED',
          OR: [
            {
              startAt: { lte: newStartAt },
              endAt: { gt: newStartAt },
            },
            {
              startAt: { lt: newEndAt },
              endAt: { gte: newEndAt },
            },
            {
              startAt: { gte: newStartAt },
              endAt: { lte: newEndAt },
            },
          ],
        },
      })

      if (conflictingAppointment) {
        return NextResponse.json(
          { error: 'Ce créneau n\'est plus disponible' },
          { status: 400 }
        )
      }

      updates.startAt = newStartAt
      updates.endAt = newEndAt
    }

    // Si rien à modifier
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'Aucune modification fournie' },
        { status: 400 }
      )
    }

    // Mettre à jour le RDV
    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: updates,
      include: {
        customer: true,
        service: true,
        salon: true,
      },
    })

    // Envoyer SMS de modification au client
    try {
      await sendModificationSms(existingAppointment.customer.phone, {
        oldDate: oldStartAt,
        newDate: new Date(updatedAppointment.startAt),
        service: updatedAppointment.service.name,
      })
    } catch (error) {
      console.error('Erreur envoi SMS modification client:', error)
    }

    // Notifier le salon de la modification
    try {
      await notifySalonOfModification({
        id: updatedAppointment.id,
        salonId: updatedAppointment.salonId,
        oldStartAt: oldStartAt,
        newStartAt: new Date(updatedAppointment.startAt),
        customer: {
          firstName: existingAppointment.customer.firstName,
          lastName: existingAppointment.customer.lastName,
          phone: existingAppointment.customer.phone,
        },
        service: { name: updatedAppointment.service.name },
      })
    } catch (error) {
      console.error('Erreur notification salon modification:', error)
    }

    return NextResponse.json(updatedAppointment)
  } catch (error) {
    console.error('Error modifying appointment:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la modification du RDV' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Appointment ID is required' }, { status: 400 })
    }

    // Récupérer le rendez-vous avec les infos client et service pour les SMS
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        customer: true,
        service: true,
      },
    })

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }

    // Créer un log d'annulation avant de supprimer
    const now = new Date()
    const hoursUntil = (new Date(appointment.startAt).getTime() - now.getTime()) / (1000 * 60 * 60)

    try {
      await prisma.cancellationLog.create({
        data: {
          appointmentId: id,
          customerId: appointment.customerId,
          salonId: appointment.salonId,
          cancelledBy: 'ADMIN',
          hoursBeforeAppt: hoursUntil,
          originalStartAt: appointment.startAt,
        },
      })
    } catch (logError) {
      console.error('Erreur création log annulation:', logError)
    }

    // Supprimer le rendez-vous
    await prisma.appointment.delete({
      where: { id },
    })

    // Envoyer SMS au client pour l'informer de l'annulation
    let customerSmsSent = false
    try {
      const result = await sendCancellationSms({
        id: appointment.id,
        salonId: appointment.salonId,
        customerId: appointment.customerId,
        startAt: appointment.startAt,
        customer: { phone: appointment.customer.phone },
      }, 'ADMIN')
      customerSmsSent = result.success
      console.log('[SMS] Annulation admin -> client:', customerSmsSent ? 'envoyé' : 'échec')
    } catch (error) {
      console.error('[SMS] Erreur envoi annulation client:', error)
    }

    // Notifier le salon aussi (toi) pour avoir une trace
    let salonSmsSent = false
    try {
      const result = await notifySalonOfCancellation({
        id: appointment.id,
        salonId: appointment.salonId,
        startAt: appointment.startAt,
        customer: {
          firstName: appointment.customer.firstName,
          lastName: appointment.customer.lastName,
          phone: appointment.customer.phone,
        },
        service: { name: appointment.service.name },
      })
      salonSmsSent = result.success
      console.log('[SMS] Annulation admin -> salon:', salonSmsSent ? 'envoyé' : 'échec')
    } catch (error) {
      console.error('[SMS] Erreur notification salon:', error)
    }

    return NextResponse.json({
      message: 'Appointment deleted successfully',
      smsStatus: { customer: customerSmsSent, salon: salonSmsSent }
    }, { status: 200 })
  } catch (error) {
    console.error('Error deleting appointment:', error)
    return NextResponse.json(
      { error: 'Failed to delete appointment' },
      { status: 500 }
    )
  }
}
