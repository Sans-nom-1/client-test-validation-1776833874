import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { sendCancellationSms, notifySalonOfCancellation } from '@/lib/sms'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()

    if (!session || session.role !== 'CUSTOMER') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const { id } = await params
    const appointmentId = id

    // Get the appointment with customer info for SMS
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        customer: true,
        service: true,
      },
    })

    if (!appointment) {
      return NextResponse.json(
        { error: 'Rendez-vous non trouvé' },
        { status: 404 }
      )
    }

    // Verify the appointment belongs to the customer
    if (appointment.customerId !== session.userId) {
      return NextResponse.json(
        { error: 'Non autorisé à annuler ce rendez-vous' },
        { status: 403 }
      )
    }

    // Check if appointment is in the past
    if (new Date(appointment.startAt) < new Date()) {
      return NextResponse.json(
        { error: 'Impossible d\'annuler un rendez-vous passé' },
        { status: 400 }
      )
    }

    // Check if appointment is already cancelled (should not happen since we delete now)
    if (appointment.status === 'CANCELLED') {
      return NextResponse.json(
        { error: 'Ce rendez-vous est déjà annulé' },
        { status: 400 }
      )
    }

    // Check if appointment can still be cancelled (not completed)
    if (appointment.status === 'COMPLETED') {
      return NextResponse.json(
        { error: 'Impossible d\'annuler un rendez-vous terminé' },
        { status: 400 }
      )
    }

    // Calculate hours until appointment
    const now = new Date()
    const appointmentDate = new Date(appointment.startAt)
    const hoursUntil = (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60)

    // Create cancellation log first
    await prisma.cancellationLog.create({
      data: {
        appointmentId,
        customerId: appointment.customerId,
        salonId: appointment.salonId,
        cancelledBy: 'CUSTOMER',
        hoursBeforeAppt: hoursUntil,
        originalStartAt: appointment.startAt,
      },
    })

    // Delete the appointment (same as admin does - for consistency)
    await prisma.appointment.delete({
      where: { id: appointmentId },
    })

    // Send cancellation SMS to customer
    let customerSmsSent = false
    try {
      const result = await sendCancellationSms({
        id: appointment.id,
        salonId: appointment.salonId,
        customerId: appointment.customerId,
        startAt: appointment.startAt,
        customer: { phone: appointment.customer.phone },
      }, 'CUSTOMER')
      customerSmsSent = result.success
      console.log('SMS annulation client envoye:', customerSmsSent, 'tel:', appointment.customer.phone)
    } catch (error) {
      console.error('Failed to send cancellation SMS to customer:', error)
    }

    // Notify salon of the cancellation
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
      console.log('SMS annulation salon envoye:', salonSmsSent)
    } catch (error) {
      console.error('Failed to notify salon of cancellation:', error)
    }

    return NextResponse.json({
      success: true,
      deleted: true,
      isLateCancel: hoursUntil < 12,
      hoursUntil: Math.round(hoursUntil * 10) / 10,
      smsStatus: { customer: customerSmsSent, salon: salonSmsSent },
    })
  } catch (error) {
    console.error('Error cancelling appointment:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'annulation du rendez-vous' },
      { status: 500 }
    )
  }
}
