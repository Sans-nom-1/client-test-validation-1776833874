import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Cron job qui marque automatiquement les rendez-vous comme DONE
// après l'heure de fin du RDV (endAt)
// Exécuté toutes les 5 minutes via Vercel Cron

export async function GET(request: NextRequest) {
  try {
    // Vérifier le CRON_SECRET pour sécuriser l'endpoint
    const cronSecret = process.env.CRON_SECRET
    if (!cronSecret) {
      console.error('CRON_SECRET non défini')
      return NextResponse.json({ error: 'Configuration manquante' }, { status: 500 })
    }

    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()

    // Trouver tous les rendez-vous BOOKED dont l'heure de fin est passée
    const appointmentsToComplete = await prisma.appointment.findMany({
      where: {
        status: 'BOOKED',
        endAt: {
          lte: now, // L'heure de fin est passée
        },
      },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        service: {
          select: {
            name: true,
            price: true,
          },
        },
      },
    })

    const completedAppointments = []

    for (const appointment of appointmentsToComplete) {
      // Marquer le rendez-vous comme DONE
      await prisma.appointment.update({
        where: { id: appointment.id },
        data: { status: 'DONE' },
      })

      // Créer une entrée Visit pour l'historique (si le modèle Visit est utilisé)
      await prisma.visit.create({
        data: {
          salonId: appointment.salonId,
          customerId: appointment.customerId,
          appointmentId: appointment.id,
          occurredAt: appointment.startAt,
          serviceSnapshot: JSON.stringify({
            name: appointment.service.name,
            price: appointment.service.price,
          }),
          amount: appointment.service.price,
        },
      })

      completedAppointments.push({
        appointmentId: appointment.id,
        customer: `${appointment.customer.firstName} ${appointment.customer.lastName}`,
        service: appointment.service.name,
        completedAt: now.toISOString(),
      })
    }

    console.log(`[Cron] ${completedAppointments.length} rendez-vous marqués comme DONE`)

    return NextResponse.json({
      success: true,
      completedCount: completedAppointments.length,
      appointments: completedAppointments,
      executedAt: now.toISOString(),
    })
  } catch (error) {
    console.error('Error completing appointments:', error)
    return NextResponse.json({ error: 'Failed to complete appointments' }, { status: 500 })
  }
}
