import {
  COOKIE_CONFIG,
  generateToken,
  getAccessTokenExpiry,
  getRefreshTokenExpiry,
  isExpired,
} from '@inspetor/lib/auth/token'
import { prisma } from '@inspetor/lib/prisma'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const cookieStore = await cookies()
    const refreshToken = cookieStore.get(
      COOKIE_CONFIG.REFRESH_TOKEN_NAME,
    )?.value

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token is required' },
        { status: 401 },
      )
    }

    // Find session by refresh token
    const session = await prisma.session.findUnique({
      where: {
        refreshToken,
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
      return NextResponse.json(
        { error: 'Invalid refresh token' },
        { status: 401 },
      )
    }

    // Check if session is revoked
    if (session.revokedAt) {
      return NextResponse.json(
        { error: 'Session has been revoked' },
        { status: 401 },
      )
    }

    // Check if refresh token is expired
    if (isExpired(session.refreshExpiresAt)) {
      // Revoke the session
      await prisma.session.update({
        where: { id: session.id },
        data: { revokedAt: new Date() },
      })

      // Clear cookies
      cookieStore.delete(COOKIE_CONFIG.ACCESS_TOKEN_NAME)
      cookieStore.delete(COOKIE_CONFIG.REFRESH_TOKEN_NAME)

      return NextResponse.json(
        { error: 'Refresh token has expired' },
        { status: 401 },
      )
    }

    // Check if user is still active
    if (session.user.status !== 'ACTIVE') {
      // Revoke the session
      await prisma.session.update({
        where: { id: session.id },
        data: { revokedAt: new Date() },
      })

      // Clear cookies
      cookieStore.delete(COOKIE_CONFIG.ACCESS_TOKEN_NAME)
      cookieStore.delete(COOKIE_CONFIG.REFRESH_TOKEN_NAME)

      return NextResponse.json(
        { error: 'User account is inactive' },
        { status: 401 },
      )
    }

    // Generate new tokens
    const newAccessToken = generateToken()
    const newRefreshToken = generateToken()

    // Update session with new tokens
    await prisma.session.update({
      where: { id: session.id },
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresAt: getAccessTokenExpiry(),
        refreshExpiresAt: getRefreshTokenExpiry(),
      },
    })

    // Set new cookies
    cookieStore.set(COOKIE_CONFIG.ACCESS_TOKEN_NAME, newAccessToken, {
      httpOnly: COOKIE_CONFIG.httpOnly,
      secure: COOKIE_CONFIG.secure,
      sameSite: COOKIE_CONFIG.sameSite,
      path: COOKIE_CONFIG.path,
      expires: getAccessTokenExpiry(),
    })

    cookieStore.set(COOKIE_CONFIG.REFRESH_TOKEN_NAME, newRefreshToken, {
      httpOnly: COOKIE_CONFIG.httpOnly,
      secure: COOKIE_CONFIG.secure,
      sameSite: COOKIE_CONFIG.sameSite,
      path: COOKIE_CONFIG.path,
      expires: getRefreshTokenExpiry(),
    })

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
      },
    })
  } catch (error) {
    console.error('Refresh error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
