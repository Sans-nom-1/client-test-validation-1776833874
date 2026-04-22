import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendSMS } from '@/lib/sms'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'Salon'

// Generate a 6-digit code
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting - 3 requests per minute
    const rateLimit = checkRateLimit(request)
    if (!rateLimit.allowed) {
      return rateLimitResponse(rateLimit.resetAt)
    }

    const { phone, type = 'PHONE_VERIFICATION' } = await request.json()

    if (!phone) {
      return NextResponse.json(
        { error: 'Numéro de téléphone requis' },
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

    // Convert to international format
    const internationalPhone = cleanPhone.startsWith('+33')
      ? cleanPhone
      : cleanPhone.replace(/^0/, '+33')

    // Delete old verification codes for this phone and type
    await prisma.verificationCode.deleteMany({
      where: {
        phone: cleanPhone,
        type,
      },
    })

    // Generate new code
    const code = generateCode()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Save code to database
    const verificationRecord = await prisma.verificationCode.create({
      data: {
        phone: cleanPhone,
        code,
        type,
        expiresAt,
      },
    })

    // Send SMS
    const message = type === 'PASSWORD_RESET'
      ? `Ton code de réinitialisation ${SITE_NAME} : ${code}\n\nValable 10 minutes.`
      : `Ton code de vérification ${SITE_NAME} : ${code}\n\nValable 10 minutes.`

    try {
      await sendSMS({ to: internationalPhone, message })

      return NextResponse.json({
        success: true,
        message: 'Code envoyé par SMS',
        expiresAt,
      })
    } catch (smsError) {
      console.error('SMS sending failed:', smsError)
      // Supprimer le code orphelin si l'envoi SMS échoue
      await prisma.verificationCode.delete({ where: { id: verificationRecord.id } }).catch(() => {})
      return NextResponse.json(
        { error: 'Impossible d\'envoyer le SMS. Veuillez réessayer.' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Send verification code error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi du code' },
      { status: 500 }
    )
  }
}
