import 'server-only'

import { COOKIE_CONFIG, isExpired } from '@inspetor/lib/auth/token'
import { prisma } from '@inspetor/lib/prisma'
import type { AuthUser, Session } from '@inspetor/types/auth'
import { cookies } from 'next/headers'

/**
 * Gets the current session from cookies and validates it against the database.
 * This function should only be used in Server Components and Server Actions.
 * @returns The session object if valid, null otherwise
 */
export async function getSession(): Promise<Session | null> {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get(COOKIE_CONFIG.ACCESS_TOKEN_NAME)?.value

    if (!accessToken) {
      return null
    }

    // Find session by access token
    const session = await prisma.session.findUnique({
      where: {
        accessToken,
      },
      include: {
        user: {
          include: {
            company: true,
          },
        },
      },
    })

    if (!session) {
      return null
    }

    // Check if session is revoked
    if (session.revokedAt) {
      return null
    }

    // Check if access token is expired
    if (isExpired(session.expiresAt)) {
      return null
    }

    // Check if user is still active
    if (session.user.status !== 'ACTIVE') {
      return null
    }

    // Build user object
    const user: AuthUser = {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      username: session.user.username,
      role: session.user.role,
      responsibility: session.user.responsibility,
      companyId: session.user.companyId,
      image: session.user.image,
      company: session.user.company,
    }

    return {
      user,
      expiresAt: session.expiresAt,
    }
  } catch (error) {
    console.error('Error getting session:', error)
    return null
  }
}

/**
 * Gets the current user from the session.
 * This is a convenience function that returns just the user object.
 * @returns The user object if authenticated, null otherwise
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const session = await getSession()
  return session?.user ?? null
}

/**
 * Checks if the current user is authenticated.
 * @returns True if authenticated, false otherwise
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession()
  return session !== null
}

/**
 * Requires authentication and returns the session.
 * Throws an error if not authenticated.
 * @returns The session object
 * @throws Error if not authenticated
 */
export async function requireAuth(): Promise<Session> {
  const session = await getSession()
  if (!session) {
    throw new Error('Not authenticated')
  }
  return session
}
