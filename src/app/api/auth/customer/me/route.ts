import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { autoCompleteAppointments } from '@/lib/auto-complete-appointments'

export async function GET() {
  try {
    const session = await getSession()

    if (!session || session.role !== 'CUSTOMER') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    // Auto-compléter les rendez-vous passés avant de récupérer les stats
    await autoCompleteAppointments()

    // Get customer info
    const customer = await prisma.customer.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        dateOfBirth: true,
      },
    })

    if (!customer) {
      return NextResponse.json(
        { error: 'Client non trouvé' },
        { status: 404 }
      )
    }

    // Get customer's appointments
    const appointments = await prisma.appointment.findMany({
      where: {
        customerId: session.userId,
      },
      include: {
        service: true,
        staff: true,
      },
      orderBy: {
        startAt: 'desc',
      },
    })

    // Calculate visit count (completed appointments)
    const visitCount = await prisma.appointment.count({
      where: {
        customerId: session.userId,
        status: 'DONE',
      },
    })

    // Calculate customer's rank (scoped to current salon)
    const salonId = process.env.SALON_ID || 'salon-demo'
    const allCustomers = await prisma.customer.findMany({
      where: { salonId },
      select: {
        id: true,
        appointments: {
          where: { status: 'DONE' },
        },
      },
    })

    const leaderboard = allCustomers
      .map(c => ({
        id: c.id,
        visitCount: c.appointments.length,
      }))
      .filter(c => c.visitCount > 0)
      .sort((a, b) => b.visitCount - a.visitCount)

    const rank = leaderboard.findIndex(c => c.id === session.userId) + 1

    // Calculate progression with milestones every 5 RDV
    const MILESTONE_INTERVAL = 5
    const currentLevel = Math.floor(visitCount / MILESTONE_INTERVAL)
    const nextMilestone = (currentLevel + 1) * MILESTONE_INTERVAL
    const progressInCurrentLevel = visitCount % MILESTONE_INTERVAL
    const rdvToNextReward = MILESTONE_INTERVAL - progressInCurrentLevel

    // Generate levels data for the battle pass
    const levels = []
    const maxLevels = 10 // Show 10 levels (up to 50 RDV)
    for (let i = 1; i <= maxLevels; i++) {
      const requiredRdv = i * MILESTONE_INTERVAL
      const isUnlocked = visitCount >= requiredRdv
      const isInProgress = visitCount > (i - 1) * MILESTONE_INTERVAL && visitCount < requiredRdv
      const progress = isInProgress
        ? ((visitCount - (i - 1) * MILESTONE_INTERVAL) / MILESTONE_INTERVAL) * 100
        : isUnlocked ? 100 : 0

      levels.push({
        level: i,
        requiredRdv,
        isUnlocked,
        isInProgress,
        progress,
        reward: `Niveau ${i}` // Placeholder for actual rewards
      })
    }

    return NextResponse.json({
      customer,
      appointments,
      stats: {
        visitCount,
        rank: rank || null,
        currentLevel,
        nextMilestone,
        progressInCurrentLevel,
        rdvToNextReward,
        progressPercent: (progressInCurrentLevel / MILESTONE_INTERVAL) * 100,
        levels,
      },
    })
  } catch (error) {
    console.error('Error fetching customer profile:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du profil' },
      { status: 500 }
    )
  }
}
