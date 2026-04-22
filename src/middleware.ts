import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protéger les routes /admin (sauf /admin/login)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const token = request.cookies.get('session')?.value

    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET)
      const { payload } = await jwtVerify(token, secret)

      // Vérifier que c'est un admin
      if (payload.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/admin/login', request.url))
      }
    } catch {
      // Token invalide ou expiré
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  // Protéger les routes /api/admin
  if (pathname.startsWith('/api/admin')) {
    const token = request.cookies.get('session')?.value

    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET)
      const { payload } = await jwtVerify(token, secret)

      if (payload.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
      }
    } catch {
      return NextResponse.json({ error: 'Session invalide' }, { status: 401 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
