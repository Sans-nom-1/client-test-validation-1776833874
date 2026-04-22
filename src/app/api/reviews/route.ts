import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { autoCompleteAppointments } from '@/lib/auto-complete-appointments'

// GET - Fetch approved reviews and stats
export async function GET() {
  try {
    const salonId = 'salon-demo'

    // Auto-compléter les rendez-vous passés pour avoir le bon compte de RDV
    await autoCompleteAppointments(salonId)

    // Get approved reviews
    const reviews = await prisma.review.findMany({
      where: {
        salonId,
        isApproved: true,
      },
      include: {
        customer: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Calculate stats
    const totalReviews = reviews.length
    const averageRating = totalReviews > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0

    // Get total customers count
    const totalCustomers = await prisma.customer.count({
      where: { salonId },
    })

    // Get total appointments count (DONE status)
    const totalAppointments = await prisma.appointment.count({
      where: {
        salonId,
        status: 'DONE',
      },
    })

    // Format reviews for response
    const formattedReviews = reviews.map((review) => ({
      id: review.id,
      name: `${review.customer.firstName} ${review.customer.lastName.charAt(0)}.`,
      rating: review.rating,
      comment: review.comment,
      adminReply: review.adminReply,
      adminReplyAt: review.adminReplyAt?.toISOString() || null,
      createdAt: review.createdAt.toISOString(),
    }))

    return NextResponse.json({
      reviews: formattedReviews,
      stats: {
        totalReviews,
        averageRating: Math.round(averageRating * 10) / 10,
        totalCustomers,
        totalAppointments,
      },
    })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST - Create a new review (requires authentication)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session || session.role !== 'CUSTOMER') {
      return NextResponse.json(
        { error: 'Vous devez être connecté pour laisser un avis' },
        { status: 401 }
      )
    }

    const { rating, comment } = await request.json()

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'La note doit être entre 1 et 5' },
        { status: 400 }
      )
    }

    // Check if customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: session.userId },
    })

    if (!customer) {
      return NextResponse.json(
        { error: 'Client non trouvé' },
        { status: 404 }
      )
    }

    // Check if customer already left a review
    const existingReview = await prisma.review.findFirst({
      where: {
        customerId: session.userId,
        salonId: customer.salonId,
      },
    })

    if (existingReview) {
      return NextResponse.json(
        { error: 'Vous avez déjà laissé un avis' },
        { status: 400 }
      )
    }

    // Create the review (auto-approved)
    const review = await prisma.review.create({
      data: {
        salonId: customer.salonId,
        customerId: session.userId,
        rating,
        comment: comment?.trim() || null,
        isApproved: true,
      },
      include: {
        customer: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Merci pour votre avis !',
      review: {
        id: review.id,
        name: `${review.customer.firstName} ${review.customer.lastName.charAt(0)}.`,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt.toISOString(),
      },
    })
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
