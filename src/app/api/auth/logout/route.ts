import { COOKIE_CONFIG } from '@inspetor/lib/auth/token'
import { prisma } from '@inspetor/lib/prisma'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get(COOKIE_CONFIG.ACCESS_TOKEN_NAME)?.value

    if (accessToken) {
      // Revoke the session in database
      await prisma.session.updateMany({
        where: {
          accessToken,
          revokedAt: null,
        },
        data: {
          revokedAt: new Date(),
        },
      })
    }

    // Clear cookies
    cookieStore.delete(COOKIE_CONFIG.ACCESS_TOKEN_NAME)
    cookieStore.delete(COOKIE_CONFIG.REFRESH_TOKEN_NAME)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
