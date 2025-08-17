import { cookies } from 'next/headers'
import { type NextRequest, NextResponse } from 'next/server'

const authPrefix = '/auth'

export async function middleware(request: NextRequest) {
  const nextCookies = await cookies()
  let token = nextCookies.get('authjs.session-token')

  if (!token) {
    token = nextCookies.get('__Secure-authjs.session-token')
  }

  if (!token && !request.nextUrl.pathname.startsWith(authPrefix)) {
    return NextResponse.redirect(new URL('/auth/sign-in', request.url))
  }

  if (token && request.nextUrl.pathname.startsWith(authPrefix)) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/auth/:path*'],
}
