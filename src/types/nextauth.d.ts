import { UserResponsibility, UserRole } from '@prisma/client'
import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      /** The user's unique ID */
      id: string

      role: UserRole
      username: string
      responsibility: UserResponsibility | null
    } & DefaultSession['user']
  }

  interface User extends DefaultUser {
    id: string
    role: UserRole
    username: string
    responsibility: UserResponsibility | null
  }

  interface JWT {
    /** The user's unique ID */
    id: string
    role: UserRole
    username: string
    responsibility: UserResponsibility | null
  }
}
