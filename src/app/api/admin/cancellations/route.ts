import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

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

    // Fetch all data in parallel to avoid sequential queries
    const [cancellations, totalAppointments, customerAppointmentCounts] = await Promise.all([
      // Get all cancellation logs with customer info
      prisma.cancellationLog.findMany({
        where: { salonId },
        include: {
          customer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
            },
          },
        },
      }),
      // Get total appointments count
      prisma.appointment.count({
        where: { salonId },
      }),
      // Get appointment counts grouped by customer (avoid N+1)
      prisma.appointment.groupBy({
        by: ['customerId'],
        where: { salonId },
        _count: { id: true },
      }),
    ])

    // Create a map for quick lookup of appointment counts
    const appointmentCountMap = new Map(
      customerAppointmentCounts.map(c => [c.customerId, c._count.id])
    )

    // Calculate stats
    const totalCancellations = cancellations.length
    const avgDelayHours = totalCancellations > 0
      ? cancellations.reduce((sum, log) => sum + log.hoursBeforeAppt, 0) / totalCancellations
      : 0
    const cancellationRate = totalAppointments > 0
      ? (totalCancellations / totalAppointments) * 100
      : 0

    // Group cancellations by customer
    const customerCancellations = cancellations.reduce((acc: Record<string, {
      customer: typeof cancellations[0]['customer'],
      cancellationCount: number
    }>, log) => {
      const customerId = log.customerId
      if (!acc[customerId]) {
        acc[customerId] = {
          customer: log.customer,
          cancellationCount: 0,
        }
      }
      acc[customerId].cancellationCount++
      return acc
    }, {})

    // Build customers with cancellations list (no N+1 - use the map)
    const customersWithCancellations = Object.entries(customerCancellations).map(([customerId, data]) => {
      const customerTotalAppointments = appointmentCountMap.get(customerId) || 0
      const customerCancellationRate = customerTotalAppointments > 0
        ? (data.cancellationCount / customerTotalAppointments) * 100
        : 0

      return {
        customer: data.customer,
        cancellationCount: data.cancellationCount,
        totalAppointments: customerTotalAppointments,
        cancellationRate: parseFloat(customerCancellationRate.toFixed(1)),
      }
    })

    // Sort by cancellation rate (worst to best = highest to lowest)
    customersWithCancellations.sort((a, b) => b.cancellationRate - a.cancellationRate)

    return NextResponse.json({
      totalCancellations,
      avgDelayHours: parseFloat(avgDelayHours.toFixed(1)),
      cancellationRate: parseFloat(cancellationRate.toFixed(1)),
      allCustomersWithCancellations: customersWithCancellations,
    })
  } catch (error) {
    console.error('Error fetching cancellation stats:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des statistiques' },
      { status: 500 }
    )
  }
}
