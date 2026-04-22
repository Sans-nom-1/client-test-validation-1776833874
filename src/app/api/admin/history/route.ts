import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { startOfMonth, endOfMonth } from 'date-fns'

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
    const month = searchParams.get('month') // Format: YYYY-MM
    const status = searchParams.get('status') // Optional filter

    if (!salonId || !month) {
      return NextResponse.json(
        { error: 'salonId et month sont requis' },
        { status: 400 }
      )
    }

    // Parse month to get date range
    const [year, monthNum] = month.split('-').map(Number)
    const date = new Date(year, monthNum - 1, 1)
    const startDate = startOfMonth(date)
    const endDate = endOfMonth(date)

    // Build where clause
    const whereClause: any = {
      salonId,
      startAt: {
        gte: startDate,
        lte: endDate,
      },
    }

    // Filter by status if provided, or default to completed/cancelled appointments
    if (status) {
      whereClause.status = status
    } else {
      whereClause.status = {
        in: ['DONE', 'CANCELLED', 'NO_SHOW'],
      }
    }

    // Fetch appointments for the month
    const appointments = await prisma.appointment.findMany({
      where: whereClause,
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            price: true,
            durationMin: true,
          },
        },
        staff: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        startAt: 'asc',
      },
    })

    // Group appointments by date
    const groupedByDate = appointments.reduce((acc: any, appointment) => {
      const dateKey = appointment.startAt.toISOString().split('T')[0]
      if (!acc[dateKey]) {
        acc[dateKey] = []
      }
      acc[dateKey].push(appointment)
      return acc
    }, {})

    return NextResponse.json({
      month,
      appointments: groupedByDate,
      total: appointments.length,
    })
  } catch (error) {
    console.error('Error fetching history:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'historique' },
      { status: 500 }
    )
  }
}
