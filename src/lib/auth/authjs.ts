import { PrismaAdapter } from '@auth/prisma-adapter'
import type {
  UserResponsibility,
  UserRole,
} from '@inspetor/generated/prisma/client'
import { comparePassword } from '@inspetor/utils/crypto'
import NextAuth, { CredentialsSignin } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

import { prisma } from '../prisma'

class InvalidLoginError extends CredentialsSignin {
  code = 'invalid_credentials'
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    jwt: async ({ token, user, session, trigger }) => {
      if (user) {
        token.role = user.role as UserRole
        token.username = user.username
        token.responsibility = user.responsibility as UserResponsibility | null
      }

      if (trigger === 'update' && session) {
        token.role = session?.user?.role as UserRole
        token.username = session?.user?.username
        token.responsibility = session?.user
          ?.responsibility as UserResponsibility | null
      }

      return token
    },
    session: async ({ session, token }) => {
      if (!token.role) {
        throw new Error('Role not found')
      }

      session.user.role = token.role as UserRole
      session.user.username = token.username as string
      session.user.responsibility =
        (token.responsibility as UserResponsibility) ?? null
      return session
    },
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: 'E-mail', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        try {
          const { email, password } = credentials

          if (!email || !password) {
            throw new InvalidLoginError()
          }

          let user = await prisma.user.findUnique({
            where: {
              email: email as string,
              status: 'ACTIVE',
            },
          })

          if (!user) {
            user = await prisma.user.findUnique({
              where: {
                username: email as string,
                status: 'ACTIVE',
              },
            })
          }

          if (!user || !user?.password) {
            throw new InvalidLoginError()
          }

          const isPasswordValid = await comparePassword(
            password as string,
            user.password,
          )

          if (!isPasswordValid) {
            throw new InvalidLoginError()
          }

          return {
            ...user,
            username: user.username as string,
            responsibility: user.responsibility,
          }
        } catch {
          throw new InvalidLoginError()
        }
      },
    }),
  ],
})
