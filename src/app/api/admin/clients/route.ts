import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { differenceInMonths } from 'date-fns'
import { autoCompleteAppointments } from '@/lib/auto-complete-appointments'

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

    // Auto-compléter les rendez-vous passés avant de récupérer les stats
    if (salonId) {
      await autoCompleteAppointments(salonId)
    }
    const search = searchParams.get('search') || ''
    const sortBy = searchParams.get('sortBy') || 'visitCount' // visitCount, totalSpent, frequency, lastVisit

    // Validation de la pagination pour éviter les abus
    const pageParam = parseInt(searchParams.get('page') || '1')
    const limitParam = parseInt(searchParams.get('limit') || '50')
    const page = Math.max(1, Math.min(pageParam, 1000)) // Max 1000 pages
    const limit = Math.max(1, Math.min(limitParam, 100)) // Max 100 par page
    const skip = (page - 1) * limit

    if (!salonId) {
      return NextResponse.json(
        { error: 'salonId est requis' },
        { status: 400 }
      )
    }

    // Build search filter
    const searchFilter = search
      ? {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' as const } },
            { lastName: { contains: search, mode: 'insensitive' as const } },
            { phone: { contains: search } },
          ],
        }
      : {}

    // Fetch customers with their appointments and visits
    const customers = await prisma.customer.findMany({
      where: {
        salonId,
        ...searchFilter,
      },
      include: {
        appointments: {
          include: {
            service: {
              select: {
                name: true,
                price: true,
              },
            },
          },
        },
        visits: {
          select: {
            occurredAt: true,
          },
          orderBy: {
            occurredAt: 'desc',
          },
        },
      },
    })

    // Calculate statistics for each customer
    const clientsWithStats = customers.map((customer) => {
      const doneAppointments = customer.appointments.filter(
        (apt) => apt.status === 'DONE'
      )
      const noShowAppointments = customer.appointments.filter(
        (apt) => apt.status === 'NO_SHOW'
      )
      const totalAppointments = customer.appointments.length

      // Calculate total spent
      const totalSpent = doneAppointments.reduce((sum, apt) => {
        return sum + (apt.service.price || 0)
      }, 0)

      // Calculate visit count
      const visitCount = doneAppointments.length

      // Calculate frequency (visits per month)
      let frequency = 0
      if (customer.visits.length > 0) {
        const firstVisit = customer.visits[customer.visits.length - 1].occurredAt
        const lastVisit = customer.visits[0].occurredAt
        const monthsDiff = differenceInMonths(lastVisit, firstVisit) || 1
        frequency = customer.visits.length / monthsDiff
      }

      // Find preferred service (most frequent)
      const serviceCounts: { [key: string]: number } = {}
      doneAppointments.forEach((apt) => {
        const serviceName = apt.service.name
        serviceCounts[serviceName] = (serviceCounts[serviceName] || 0) + 1
      })
      const preferredService =
        Object.keys(serviceCounts).length > 0
          ? Object.entries(serviceCounts).sort((a, b) => b[1] - a[1])[0][0]
          : 'Aucun'

      // Calculate no-show rate
      const noShowRate =
        totalAppointments > 0
          ? (noShowAppointments.length / totalAppointments) * 100
          : 0

      // Get last visit date
      const lastVisit = customer.visits[0]?.occurredAt || null

      return {
        id: customer.id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        phone: customer.phone,
        visitCount,
        totalSpent,
        frequency: parseFloat(frequency.toFixed(2)),
        preferredService,
        noShowRate: parseFloat(noShowRate.toFixed(1)),
        lastVisit,
        createdAt: customer.createdAt,
      }
    })

    // Sort clients
    const sortedClients = clientsWithStats.sort((a, b) => {
      switch (sortBy) {
        case 'visitCount':
          return b.visitCount - a.visitCount
        case 'totalSpent':
          return b.totalSpent - a.totalSpent
        case 'frequency':
          return b.frequency - a.frequency
        case 'lastVisit':
          if (!a.lastVisit) return 1
          if (!b.lastVisit) return -1
          return new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime()
        default:
          return b.visitCount - a.visitCount
      }
    })

    // Paginate
    const paginatedClients = sortedClients.slice(skip, skip + limit)

    return NextResponse.json({
      clients: paginatedClients,
      total: sortedClients.length,
      page,
      limit,
      totalPages: Math.ceil(sortedClients.length / limit),
    })
  } catch (error) {
    console.error('Error fetching clients:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des clients' },
      { status: 500 }
    )
  }
}
