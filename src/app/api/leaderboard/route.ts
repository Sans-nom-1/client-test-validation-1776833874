import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { autoCompleteAppointments } from '@/lib/auto-complete-appointments'

export async function GET() {
  try {
    // Vérifier l'authentification
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Auto-compléter les rendez-vous passés avant de récupérer le classement
    await autoCompleteAppointments('salon-demo')

    // Récupérer tous les clients avec leurs RDV terminés
    const customers = await prisma.customer.findMany({
      where: {
        salonId: 'salon-demo',
      },
      include: {
        appointments: {
          where: {
            status: 'DONE',
          }
        }
      }
    })

    // Calculer le nombre de visites pour chaque client
    const leaderboard = customers
      .map(customer => ({
        id: customer.id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        visitCount: customer.appointments.length,
      }))
      .filter(customer => customer.visitCount > 0) // Only show customers with visits
      .sort((a, b) => b.visitCount - a.visitCount) // Sort by visit count descending
      .map((customer, index) => ({
        ...customer,
        rank: index + 1,
      }))

    return NextResponse.json(leaderboard)
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    )
  }
}
