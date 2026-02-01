import { cookies } from 'next/headers'
import { type NextRequest, NextResponse } from 'next/server'

const authPrefix = '/auth'
const ACCESS_TOKEN_NAME = 'inspetor_access_token'

export async function proxy(request: NextRequest) {
  const nextCookies = await cookies()
  const accessToken = nextCookies.get(ACCESS_TOKEN_NAME)

  // Redirect to sign-in if not authenticated and trying to access protected routes
  if (!accessToken && !request.nextUrl.pathname.startsWith(authPrefix)) {
    return NextResponse.redirect(new URL('/auth/sign-in', request.url))
  }

  // Redirect to dashboard if authenticated and trying to access auth pages
  if (accessToken && request.nextUrl.pathname.startsWith(authPrefix)) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/auth/:path*'],
}
