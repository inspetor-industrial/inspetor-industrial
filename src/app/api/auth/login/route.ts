import { prisma } from '@inspetor/lib/prisma'
import {
  COOKIE_CONFIG,
  generateToken,
  getAccessTokenExpiry,
  getRefreshTokenExpiry,
} from '@inspetor/lib/auth/token'
import { comparePassword } from '@inspetor/utils/crypto'
import { cookies, headers } from 'next/headers'
import { NextResponse } from 'next/server'

interface LoginRequest {
  email: string
  password: string
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LoginRequest
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 },
      )
    }

    // Find user by email or username
    let user = await prisma.user.findUnique({
      where: {
        email,
        status: 'ACTIVE',
      },
      include: {
        company: true,
      },
    })

    // Try finding by username if not found by email
    if (!user) {
      user = await prisma.user.findUnique({
        where: {
          username: email,
          status: 'ACTIVE',
        },
        include: {
          company: true,
        },
      })
    }

    if (!user || !user.password) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 },
      )
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password)
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 },
      )
    }

    // Generate tokens
    const accessToken = generateToken()
    const refreshToken = generateToken()

    // Get request metadata
    const headersList = await headers()
    const userAgent = headersList.get('user-agent')
    const forwardedFor = headersList.get('x-forwarded-for')
    const ipAddress = forwardedFor?.split(',').at(0)?.trim() ?? null

    // Create session in database
    await prisma.session.create({
      data: {
        userId: user.id,
        accessToken,
        refreshToken,
        expiresAt: getAccessTokenExpiry(),
        refreshExpiresAt: getRefreshTokenExpiry(),
        userAgent,
        ipAddress,
      },
    })

    // Set cookies
    const cookieStore = await cookies()

    cookieStore.set(COOKIE_CONFIG.ACCESS_TOKEN_NAME, accessToken, {
      httpOnly: COOKIE_CONFIG.httpOnly,
      secure: COOKIE_CONFIG.secure,
      sameSite: COOKIE_CONFIG.sameSite,
      path: COOKIE_CONFIG.path,
      expires: getAccessTokenExpiry(),
    })

    cookieStore.set(COOKIE_CONFIG.REFRESH_TOKEN_NAME, refreshToken, {
      httpOnly: COOKIE_CONFIG.httpOnly,
      secure: COOKIE_CONFIG.secure,
      sameSite: COOKIE_CONFIG.sameSite,
      path: COOKIE_CONFIG.path,
      expires: getRefreshTokenExpiry(),
    })

    // Return user data (without sensitive fields)
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
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
