import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting - 5 requests per minute
    const rateLimit = checkRateLimit(request)
    if (!rateLimit.allowed) {
      return rateLimitResponse(rateLimit.resetAt)
    }

    const { phone, code, type = 'PHONE_VERIFICATION' } = await request.json()

    if (!phone || !code) {
      return NextResponse.json(
        { error: 'Numéro de téléphone et code requis' },
        { status: 400 }
      )
    }

    // Validate phone format
    const cleanPhone = phone.replace(/\s/g, '')
    if (!/^(\+33|0)[1-9](\d{8})$/.test(cleanPhone)) {
      return NextResponse.json(
        { error: 'Numéro de téléphone invalide' },
        { status: 400 }
      )
    }

    // Find verification code
    const verificationCode = await prisma.verificationCode.findFirst({
      where: {
        phone: cleanPhone,
        type,
        verified: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    if (!verificationCode) {
      return NextResponse.json(
        { error: 'Code de vérification invalide ou expiré' },
        { status: 400 }
      )
    }

    // Check if code is expired
    if (new Date() > verificationCode.expiresAt) {
      // Delete expired code
      await prisma.verificationCode.delete({
        where: { id: verificationCode.id },
      })

      return NextResponse.json(
        { error: 'Code expiré. Demandez un nouveau code.' },
        { status: 400 }
      )
    }

    // Check if code matches
    if (verificationCode.code !== code) {
      return NextResponse.json(
        { error: 'Code incorrect' },
        { status: 400 }
      )
    }

    // Marquer le code comme vérifié de manière atomique (évite la race condition)
    const updated = await prisma.verificationCode.updateMany({
      where: { id: verificationCode.id, verified: false },
      data: { verified: true },
    })

    if (updated.count === 0) {
      return NextResponse.json(
        { error: 'Code déjà utilisé' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Code vérifié avec succès',
    })
  } catch (error) {
    console.error('Verify code error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la vérification du code' },
      { status: 500 }
    )
  }
}
