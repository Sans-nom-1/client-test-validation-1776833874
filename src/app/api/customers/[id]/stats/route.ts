import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { subDays } from 'date-fns'
import { getSession } from '@/lib/auth'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Vérifier l'authentification
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id } = await params

    // Vérifier que l'utilisateur accède à ses propres stats ou est admin
    if (session.role !== 'ADMIN' && session.userId !== id) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const customer = await prisma.customer.findUnique({
      where: { id },
    })

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    const totalVisits = await prisma.visit.count({
      where: { customerId: id },
    })

    const lastVisit = await prisma.visit.findFirst({
      where: { customerId: id },
      orderBy: { occurredAt: 'desc' },
      select: { occurredAt: true },
    })

    const upcomingAppointments = await prisma.appointment.count({
      where: {
        customerId: id,
        status: 'BOOKED',
        startAt: { gte: new Date() },
      },
    })

    const noShowCount = await prisma.appointment.count({
      where: {
        customerId: id,
        status: 'NO_SHOW',
      },
    })

    const recentVisits = await prisma.visit.findMany({
      where: { customerId: id },
      orderBy: { occurredAt: 'desc' },
      take: 10,
      include: {
        appointment: {
          include: {
            service: true,
          },
        },
      },
    })

    const isActive = lastVisit ? lastVisit.occurredAt > subDays(new Date(), 60) : false

    return NextResponse.json({
      totalVisits,
      lastVisitDate: lastVisit?.occurredAt,
      upcomingAppointments,
      noShowCount,
      recentVisits,
      isActive,
    })
  } catch (error) {
    console.error('Error fetching customer stats:', error)
    return NextResponse.json({ error: 'Failed to fetch customer stats' }, { status: 500 })
  }
}
