import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createSession } from '@/lib/auth'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'
import bcrypt from 'bcryptjs'

const isEmail = (v: string) => v.includes('@')
const cleanPhone = (v: string) => v.replace(/\s/g, '')

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimit = checkRateLimit(request)
    if (!rateLimit.allowed) {
      return rateLimitResponse(rateLimit.resetAt)
    }

    const { identifier, password, phone } = await request.json()

    // Support both new (identifier) and old (phone) API
    const loginId = (identifier || phone || '').trim()

    if (!loginId || !password) {
      return NextResponse.json({ error: 'Identifiant et mot de passe requis' }, { status: 400 })
    }

    // Determine if email or phone
    const isEmailLogin = isEmail(loginId)
    const searchValue = isEmailLogin ? loginId.toLowerCase() : cleanPhone(loginId)

    // First, check if it's an admin (Staff) login
    if (isEmailLogin) {
      const staff = await prisma.staff.findUnique({
        where: { email: searchValue },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          passwordHash: true,
        },
      })

      if (staff?.passwordHash && (await bcrypt.compare(password, staff.passwordHash))) {
        // Admin found and password matches
        await createSession(staff.id, staff.email!, staff.role)

        return NextResponse.json({
          success: true,
          role: staff.role,
          redirectTo: '/admin',
          user: {
            id: staff.id,
            name: staff.name,
            email: staff.email,
            role: staff.role,
          },
        })
      }
    }

    // Find customer by email or phone
    const customer = await prisma.customer.findFirst({
      where: isEmailLogin
        ? { email: searchValue }
        : { phone: searchValue },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        email: true,
        passwordHash: true,
      },
    })

    // Verify password (constant-time comparison for security)
    if (!customer?.passwordHash || !(await bcrypt.compare(password, customer.passwordHash))) {
      // Don't reveal if account exists
      return NextResponse.json({ error: 'Identifiants invalides' }, { status: 401 })
    }

    // Create session
    await createSession(customer.id, customer.phone, 'CUSTOMER')

    return NextResponse.json({
      success: true,
      role: 'CUSTOMER',
      customer: {
        id: customer.id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        phone: customer.phone,
        email: customer.email,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Erreur lors de la connexion' }, { status: 500 })
  }
}
