import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { phone, code, newPassword } = await request.json()

    if (!phone || !code || !newPassword) {
      return NextResponse.json(
        { error: 'Numéro de téléphone, code et nouveau mot de passe requis' },
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

    // Validate password strength
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 8 caractères' },
        { status: 400 }
      )
    }

    // Find and verify code
    const verificationCode = await prisma.verificationCode.findFirst({
      where: {
        phone: cleanPhone,
        type: 'PASSWORD_RESET',
        code,
        verified: true, // Must be verified
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    if (!verificationCode) {
      return NextResponse.json(
        { error: 'Code invalide ou non vérifié. Veuillez d\'abord vérifier votre code.' },
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

    // Find customer by phone (get the one with a password set, or the first one)
    const customer = await prisma.customer.findFirst({
      where: {
        phone: cleanPhone,
        passwordHash: { not: null },
      },
    }) || await prisma.customer.findFirst({
      where: {
        phone: cleanPhone,
      },
    })

    if (!customer) {
      return NextResponse.json(
        { error: 'Aucun compte trouvé avec ce numéro de téléphone' },
        { status: 404 }
      )
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10)

    // Update ALL customers with this phone number (they may have multiple salon entries)
    await prisma.customer.updateMany({
      where: { phone: cleanPhone },
      data: { passwordHash },
    })

    // Delete verification code after successful reset
    await prisma.verificationCode.delete({
      where: { id: verificationCode.id },
    })

    return NextResponse.json({
      success: true,
      message: 'Mot de passe réinitialisé avec succès',
    })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la réinitialisation du mot de passe' },
      { status: 500 }
    )
  }
}
