import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { startOfDay, endOfDay, subDays } from 'date-fns'

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
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
      return NextResponse.json({ error: 'salonId is required' }, { status: 400 })
    }

    const today = new Date()
    const startOfToday = startOfDay(today)
    const endOfToday = endOfDay(today)

    const todayAppointments = await prisma.appointment.count({
      where: {
        salonId,
        startAt: {
          gte: startOfToday,
          lte: endOfToday,
        },
        status: 'BOOKED',
      },
    })

    const upcomingAppointments = await prisma.appointment.count({
      where: {
        salonId,
        status: 'BOOKED',
        startAt: { gte: today },
      },
    })

    const totalCustomers = await prisma.customer.count({
      where: { salonId },
    })

    const activeCustomers = await prisma.customer.count({
      where: {
        salonId,
        visits: {
          some: {
            occurredAt: {
              gte: subDays(today, 60),
            },
          },
        },
      },
    })

    const totalVisits = await prisma.visit.count({
      where: { salonId },
    })

    const totalNoShows = await prisma.appointment.count({
      where: {
        salonId,
        status: 'NO_SHOW',
      },
    })

    const totalCompletedAppointments = await prisma.appointment.count({
      where: {
        salonId,
        status: 'DONE',
      },
    })

    const noShowRate =
      totalCompletedAppointments > 0
        ? ((totalNoShows / (totalNoShows + totalCompletedAppointments)) * 100).toFixed(2)
        : '0.00'

    const recentAppointments = await prisma.appointment.findMany({
      where: {
        salonId,
        startAt: { gte: startOfToday },
      },
      include: {
        customer: true,
        service: true,
        staff: true,
      },
      orderBy: {
        startAt: 'asc',
      },
      take: 20,
    })

    return NextResponse.json({
      todayAppointments,
      upcomingAppointments,
      totalCustomers,
      activeCustomers,
      totalVisits,
      noShowRate: parseFloat(noShowRate),
      recentAppointments,
    })
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 })
  }
}
