import 'next-auth'

declare module 'next-auth' {
  interface User {
    id: string
    role?: string
    salonId?: string
    userType?: string
  }

  interface Session {
    user: {
      id: string
      email?: string | null
      name?: string | null
      role?: string
      salonId?: string
      userType?: string
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role?: string
    salonId?: string
    userType?: string
  }
}
