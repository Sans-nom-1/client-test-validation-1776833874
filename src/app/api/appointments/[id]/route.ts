import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { sendCancellationSms, notifySalonOfCancellation } from '@/lib/sms'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Check admin authentication
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès refusé. Authentification admin requise.' },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { status, notes } = body

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        customer: true,
        service: true,
        salon: true,
      },
    })

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: {
        status: status || appointment.status,
        notes: notes !== undefined ? notes : appointment.notes,
      },
      include: {
        customer: true,
        service: true,
        staff: true,
      },
    })

    return NextResponse.json(updatedAppointment)
  } catch (error) {
    console.error('Error updating appointment:', error)
    return NextResponse.json({ error: 'Failed to update appointment' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Check admin authentication
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès refusé. Authentification admin requise.' },
        { status: 403 }
      )
    }

    const { id } = await params

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

    // Calculate hours before appointment for logging
    const now = new Date()
    const appointmentDate = new Date(appointment.startAt)
    const hoursUntil = (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60)

    // Only log cancellation if appointment was in the future and not already cancelled
    if (appointmentDate > now && appointment.status !== 'CANCELLED') {
      // Create cancellation log for admin deletion
      await prisma.cancellationLog.create({
        data: {
          appointmentId: appointment.id,
          customerId: appointment.customerId,
          salonId: appointment.salonId,
          cancelledBy: 'ADMIN',
          hoursBeforeAppt: hoursUntil,
          originalStartAt: appointment.startAt,
        },
      })

      // Send SMS to customer notifying them of cancellation
      try {
        const result = await sendCancellationSms({
          id: appointment.id,
          salonId: appointment.salonId,
          customerId: appointment.customerId,
          startAt: appointment.startAt,
          customer: { phone: appointment.customer.phone },
        }, 'ADMIN')
        console.log('[SMS] Annulation admin -> client:', result.success ? 'envoyé' : 'échec')
      } catch (error) {
        console.error('[SMS] Erreur envoi annulation client:', error)
      }

      // Notifier le salon de l'annulation
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
          service: appointment.service ? { name: appointment.service.name } : undefined,
        })
        console.log('[SMS] Annulation admin -> salon:', result.success ? 'envoyé' : 'échec')
      } catch (error) {
        console.error('[SMS] Erreur notification salon:', error)
      }
    }

    // Delete the appointment
    await prisma.appointment.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting appointment:', error)
    return NextResponse.json({ error: 'Failed to delete appointment' }, { status: 500 })
  }
}
