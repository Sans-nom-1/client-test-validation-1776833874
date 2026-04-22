import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendReminderSMS } from '@/lib/sms'
import { addDays, startOfDay, endOfDay } from 'date-fns'

export async function POST(request: NextRequest) {
  try {
    // OBLIGATOIRE: Vérifier le token d'authentification
    const authHeader = request.headers.get('authorization')
    const expectedToken = process.env.CRON_SECRET

    if (!expectedToken) {
      console.error('CRON_SECRET non défini')
      return NextResponse.json({ error: 'Configuration manquante' }, { status: 500 })
    }

    if (authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Calculer la plage horaire de demain
    const tomorrow = addDays(new Date(), 1)
    const tomorrowStart = startOfDay(tomorrow)
    const tomorrowEnd = endOfDay(tomorrow)

    // Récupérer tous les RDV de demain qui n'ont pas encore reçu de rappel
    const appointments = await prisma.appointment.findMany({
      where: {
        startAt: {
          gte: tomorrowStart,
          lte: tomorrowEnd,
        },
        status: 'BOOKED',
        reminderSmsSent: false,
      },
      include: {
        customer: true,
        service: true,
        salon: true,
      },
    })

    console.log(`📱 Envoi de ${appointments.length} rappels SMS...`)

    const results = {
      total: appointments.length,
      sent: 0,
      failed: 0,
      errors: [] as string[],
    }

    // Envoyer les rappels
    for (const appointment of appointments) {
      try {
        const sent = await sendReminderSMS(appointment.customer.phone, {
          customerName: `${appointment.customer.firstName} ${appointment.customer.lastName}`,
          serviceName: appointment.service.name,
          date: appointment.startAt,
          salonName: appointment.salon.name,
          salonAddress: appointment.salon.address || undefined,
        })

        // Mettre à jour le statut d'envoi du SMS
        await prisma.appointment.update({
          where: { id: appointment.id },
          data: {
            reminderSmsSent: sent,
            reminderSmsAt: sent ? new Date() : null,
          },
        })

        // Logger le SMS
        await prisma.smsLog.create({
          data: {
            salonId: appointment.salonId,
            customerId: appointment.customerId,
            phone: appointment.customer.phone,
            type: 'REMINDER',
            payload: JSON.stringify({
              appointmentId: appointment.id,
              serviceName: appointment.service.name,
              startAt: appointment.startAt.toISOString(),
            }),
            status: sent ? 'SENT' : 'FAILED',
          },
        })

        if (sent) {
          results.sent++
        } else {
          results.failed++
        }
      } catch (error) {
        results.failed++
        const errorMsg = `RDV ${appointment.id}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
        results.errors.push(errorMsg)
        console.error('Erreur lors de l\'envoi du rappel:', errorMsg)
      }
    }

    console.log(`✅ Rappels envoyés: ${results.sent}/${results.total}`)

    return NextResponse.json({
      success: true,
      ...results,
    })
  } catch (error) {
    console.error('Erreur lors de l\'envoi des rappels:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi des rappels' },
      { status: 500 }
    )
  }
}
