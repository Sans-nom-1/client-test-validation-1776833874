import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createSessionToken } from '@/lib/auth'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimit = checkRateLimit(request)
    if (!rateLimit.allowed) {
      return rateLimitResponse(rateLimit.resetAt)
    }

    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe requis' },
        { status: 400 }
      )
    }

    // Find admin user
    const staff = await prisma.staff.findUnique({
      where: { email },
    })

    if (!staff || !staff.passwordHash) {
      return NextResponse.json(
        { error: 'Identifiants invalides' },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, staff.passwordHash)

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Identifiants invalides' },
        { status: 401 }
      )
    }

    // Check if user is admin
    if (staff.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès refusé. Compte admin requis.' },
        { status: 403 }
      )
    }

    // Create session token
    const { token, expiresAt } = await createSessionToken(staff.id, staff.email!, staff.role)

    // Create response with cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: staff.id,
        name: staff.name,
        email: staff.email,
        role: staff.role,
      },
    })

    // Set the session cookie on the response
    response.cookies.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la connexion' },
      { status: 500 }
    )
  }
}
