import { PrismaAdapter } from '@auth/prisma-adapter'
import { comparePassword } from '@inspetor/utils/crypto'
import type { UserRole } from '@prisma/client'
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
      }

      if (trigger === 'update' && session) {
        token.role = session?.user?.role as UserRole
      }

      return token
    },
    session: async ({ session, token }) => {
      if (!token.role) {
        throw new Error('Role not found')
      }

      session.user.role = token.role as UserRole
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

          const user = await prisma.user.findUnique({
            where: {
              email: email as string,
              status: 'ACTIVE',
            },
          })

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

          return user
        } catch {
          throw new InvalidLoginError()
        }
      },
    }),
  ],
})
