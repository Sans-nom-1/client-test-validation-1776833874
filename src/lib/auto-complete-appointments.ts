import { prisma } from '@/lib/prisma'

// Fonction utilitaire qui marque automatiquement les rendez-vous comme DONE
// après l'heure de fin du RDV (endAt)
// Cette fonction est appelée par les APIs qui récupèrent les stats

export async function autoCompleteAppointments(salonId?: string) {
  try {
    const now = new Date()

    // Trouver tous les rendez-vous BOOKED dont l'heure de fin est passée
    const whereClause: {
      status: string
      endAt: { lte: Date }
      salonId?: string
    } = {
      status: 'BOOKED',
      endAt: {
        lte: now,
      },
    }

    if (salonId) {
      whereClause.salonId = salonId
    }

    const appointmentsToComplete = await prisma.appointment.findMany({
      where: whereClause,
      include: {
        service: {
          select: {
            name: true,
            price: true,
          },
        },
      },
    })

    if (appointmentsToComplete.length === 0) {
      return { completed: 0 }
    }

    // Marquer les rendez-vous comme DONE et créer les visites
    for (const appointment of appointmentsToComplete) {
      // Marquer le rendez-vous comme DONE
      await prisma.appointment.update({
        where: { id: appointment.id },
        data: { status: 'DONE' },
      })

      // Vérifier si une visite existe déjà pour ce rendez-vous
      const existingVisit = await prisma.visit.findFirst({
        where: { appointmentId: appointment.id },
      })

      if (!existingVisit) {
        // Créer une entrée Visit pour l'historique
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
      }
    }

    console.log(`[AutoComplete] ${appointmentsToComplete.length} rendez-vous marqués comme DONE`)

    return { completed: appointmentsToComplete.length }
  } catch (error) {
    console.error('Error auto-completing appointments:', error)
    return { completed: 0, error }
  }
}
