import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// GET - Fetch all reviews for admin
export async function GET() {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const salonId = 'salon-demo'

    const reviews = await prisma.review.findMany({
      where: { salonId },
      include: {
        customer: {
          select: {
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Calculate stats
    const approvedReviews = reviews.filter(r => r.isApproved)
    const totalReviews = approvedReviews.length
    const averageRating = totalReviews > 0
      ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0

    return NextResponse.json({
      reviews: reviews.map(r => ({
        id: r.id,
        customerName: `${r.customer.firstName} ${r.customer.lastName}`,
        customerPhone: r.customer.phone,
        rating: r.rating,
        comment: r.comment,
        adminReply: r.adminReply,
        adminReplyAt: r.adminReplyAt?.toISOString() || null,
        isApproved: r.isApproved,
        createdAt: r.createdAt.toISOString(),
      })),
      stats: {
        totalReviews,
        averageRating: Math.round(averageRating * 10) / 10,
      },
    })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// DELETE - Delete a review
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const reviewId = searchParams.get('id')

    if (!reviewId) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 })
    }

    await prisma.review.delete({
      where: { id: reviewId },
    })

    return NextResponse.json({ success: true, message: 'Avis supprimé' })
  } catch (error) {
    console.error('Error deleting review:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// PATCH - Reply to a review or toggle approval
export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id, adminReply, isApproved } = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 })
    }

    const updateData: { adminReply?: string | null; adminReplyAt?: Date | null; isApproved?: boolean } = {}

    if (adminReply !== undefined) {
      updateData.adminReply = adminReply || null
      updateData.adminReplyAt = adminReply ? new Date() : null
    }

    if (isApproved !== undefined) {
      updateData.isApproved = isApproved
    }

    const review = await prisma.review.update({
      where: { id },
      data: updateData,
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
      review: {
        id: review.id,
        customerName: `${review.customer.firstName} ${review.customer.lastName}`,
        rating: review.rating,
        comment: review.comment,
        adminReply: review.adminReply,
        adminReplyAt: review.adminReplyAt?.toISOString() || null,
        isApproved: review.isApproved,
        createdAt: review.createdAt.toISOString(),
      },
    })
  } catch (error) {
    console.error('Error updating review:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
