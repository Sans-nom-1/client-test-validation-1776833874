import { NextRequest, NextResponse } from 'next/server'

interface RateLimitEntry {
  count: number
  resetAt: number
}

// Simple in-memory rate limiter (pour production, utiliser Redis)
const rateLimitMap = new Map<string, RateLimitEntry>()

// Nettoyer les entrées expirées toutes les 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitMap.entries()) {
    if (entry.resetAt < now) {
      rateLimitMap.delete(key)
    }
  }
}, 5 * 60 * 1000)

interface RateLimitConfig {
  maxRequests: number
  windowMs: number
}

const defaultConfig: RateLimitConfig = {
  maxRequests: 10,
  windowMs: 60 * 1000, // 1 minute
}

// Configurations spécifiques par route
const routeConfigs: Record<string, RateLimitConfig> = {
  '/api/auth/send-verification-code': { maxRequests: 3, windowMs: 60 * 1000 },
  '/api/auth/verify-code': { maxRequests: 5, windowMs: 60 * 1000 },
  '/api/auth/login': { maxRequests: 5, windowMs: 60 * 1000 },
  '/api/auth/customer/login': { maxRequests: 5, windowMs: 60 * 1000 },
  '/api/auth/customer/register': { maxRequests: 3, windowMs: 60 * 1000 },
  '/api/auth/reset-password': { maxRequests: 3, windowMs: 60 * 1000 },
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  const realIP = request.headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }
  return 'unknown'
}

export function checkRateLimit(request: NextRequest): { allowed: boolean; remaining: number; resetAt: number } {
  const pathname = request.nextUrl.pathname
  const config = routeConfigs[pathname] || defaultConfig

  const clientIP = getClientIP(request)
  const key = `${clientIP}:${pathname}`

  const now = Date.now()
  const entry = rateLimitMap.get(key)

  if (!entry || entry.resetAt < now) {
    // Nouvelle entrée ou entrée expirée
    rateLimitMap.set(key, {
      count: 1,
      resetAt: now + config.windowMs,
    })
    return { allowed: true, remaining: config.maxRequests - 1, resetAt: now + config.windowMs }
  }

  if (entry.count >= config.maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt }
  }

  entry.count++
  return { allowed: true, remaining: config.maxRequests - entry.count, resetAt: entry.resetAt }
}

export function rateLimitResponse(resetAt: number): NextResponse {
  const retryAfter = Math.ceil((resetAt - Date.now()) / 1000)
  return NextResponse.json(
    { error: 'Trop de requêtes. Réessayez dans quelques instants.' },
    {
      status: 429,
      headers: {
        'Retry-After': retryAfter.toString(),
        'X-RateLimit-Reset': new Date(resetAt).toISOString(),
      }
    }
  )
}
