import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

// JWT_SECRET DOIT être défini en production
if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET must be defined in production')
}

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'dev-only-secret-key-min-32-chars-not-for-prod'
)

export interface SessionPayload {
  userId: string
  email: string
  role: string
  expiresAt: Date
}

export interface SessionToken {
  token: string
  expiresAt: Date
}

export async function createSessionToken(userId: string, email: string, role: string): Promise<SessionToken> {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

  const token = await new SignJWT({ userId, email, role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(secret)

  return { token, expiresAt }
}

export async function createSession(userId: string, email: string, role: string) {
  const { token, expiresAt } = await createSessionToken(userId, email, role)

  ;(await cookies()).set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
  })
}

export async function getSession(): Promise<SessionPayload | null> {
  const token = (await cookies()).get('session')?.value

  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, secret)
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      role: payload.role as string,
      expiresAt: new Date((payload.exp as number) * 1000),
    }
  } catch (error) {
    console.error('Invalid session:', error)
    return null
  }
}

export async function deleteSession() {
  ;(await cookies()).delete('session')
}
