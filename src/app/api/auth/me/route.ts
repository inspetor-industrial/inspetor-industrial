import { COOKIE_CONFIG, isExpired } from '@inspetor/lib/auth/token'
import { prisma } from '@inspetor/lib/prisma'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get(COOKIE_CONFIG.ACCESS_TOKEN_NAME)?.value

    if (!accessToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
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
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    // Check if session is revoked
    if (session.revokedAt) {
      return NextResponse.json(
        { error: 'Session has been revoked' },
        { status: 401 },
      )
    }

    // Check if access token is expired
    if (isExpired(session.expiresAt)) {
      return NextResponse.json(
        { error: 'Access token has expired' },
        { status: 401 },
      )
    }

    // Check if user is still active
    if (session.user.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'User account is inactive' },
        { status: 401 },
      )
    }

    // Return user data
    const { user } = session
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        username: user.username,
        role: user.role,
        responsibility: user.responsibility,
        companyId: user.companyId,
        image: user.image,
        company: user.company,
      },
      session: {
        expiresAt: session.expiresAt,
      },
    })
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
