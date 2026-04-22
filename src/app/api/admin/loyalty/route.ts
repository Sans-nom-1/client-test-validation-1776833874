import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { startOfMonth } from 'date-fns'

const MILESTONE_INTERVAL = 5
const MAX_LEVELS = 10

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès refusé. Authentification admin requise.' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const salonId = searchParams.get('salonId')

    if (!salonId) {
      return NextResponse.json(
        { error: 'salonId est requis' },
        { status: 400 }
      )
    }

    // Get all customers with their appointments
    const customers = await prisma.customer.findMany({
      where: {
        salonId,
      },
      include: {
        appointments: {
          where: {
            status: 'DONE',
          },
        },
        visits: true,
      },
    })

    // Calculate top clients (leaderboard) with level info
    const leaderboard = customers
      .map((customer) => {
        const visitCount = customer.appointments.length
        const currentLevel = Math.floor(visitCount / MILESTONE_INTERVAL)
        return {
          id: customer.id,
          firstName: customer.firstName,
          lastName: customer.lastName,
          visitCount,
          currentLevel,
          progressInCurrentLevel: visitCount % MILESTONE_INTERVAL,
          progressPercent: ((visitCount % MILESTONE_INTERVAL) / MILESTONE_INTERVAL) * 100,
        }
      })
      .filter((customer) => customer.visitCount > 0)
      .sort((a, b) => b.visitCount - a.visitCount)
      .slice(0, 10) // Top 10
      .map((customer, index) => ({
        ...customer,
        rank: index + 1,
      }))

    // Calculate total active clients (clients with at least 1 visit)
    const activeClients = customers.filter((c) => c.appointments.length > 0).length

    // Calculate visits this month
    const startOfCurrentMonth = startOfMonth(new Date())
    const visitsThisMonth = await prisma.visit.count({
      where: {
        salonId,
        occurredAt: {
          gte: startOfCurrentMonth,
        },
      },
    })

    // Calculate level distribution based on 5-RDV milestones
    const levelDistribution: Record<number, number> = {}
    for (let i = 0; i <= MAX_LEVELS; i++) {
      levelDistribution[i] = 0
    }

    customers.forEach((customer) => {
      const visitCount = customer.appointments.length
      const level = Math.min(Math.floor(visitCount / MILESTONE_INTERVAL), MAX_LEVELS)
      levelDistribution[level]++
    })

    // Generate levels data for battle pass view
    const levels = []
    for (let i = 1; i <= MAX_LEVELS; i++) {
      const requiredRdv = i * MILESTONE_INTERVAL
      const customersAtOrAbove = customers.filter(c => c.appointments.length >= requiredRdv).length
      const customersInProgress = customers.filter(c => {
        const visits = c.appointments.length
        return visits > (i - 1) * MILESTONE_INTERVAL && visits < requiredRdv
      }).length

      levels.push({
        level: i,
        requiredRdv,
        customersUnlocked: customersAtOrAbove,
        customersInProgress,
      })
    }

    // Calculate global stats
    const totalVisits = customers.reduce((sum, c) => sum + c.appointments.length, 0)
    const avgVisitsPerClient = activeClients > 0 ? Math.round(totalVisits / activeClients * 10) / 10 : 0

    return NextResponse.json({
      totalClients: customers.length,
      activeClients,
      visitsThisMonth,
      totalVisits,
      avgVisitsPerClient,
      leaderboard,
      levelDistribution,
      levels,
      milestoneInterval: MILESTONE_INTERVAL,
    })
  } catch (error) {
    console.error('Error fetching loyalty data:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des données de fidélité' },
      { status: 500 }
    )
  }
}
