import 'server-only'

// Token configuration
export const TOKEN_CONFIG = {
  // Access token expires in 15 minutes
  ACCESS_TOKEN_EXPIRY_MS: 15 * 60 * 1000,
  // Refresh token expires in 7 days
  REFRESH_TOKEN_EXPIRY_MS: 7 * 24 * 60 * 60 * 1000,
  // Token length in bytes (will be 64 characters when hex encoded)
  TOKEN_LENGTH: 32,
} as const

// Cookie configuration
export const COOKIE_CONFIG = {
  ACCESS_TOKEN_NAME: 'inspetor_access_token',
  REFRESH_TOKEN_NAME: 'inspetor_refresh_token',
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
} as const

/**
 * Generates a cryptographically secure random token
 * @param length - Number of random bytes (token will be 2x this length when hex encoded)
 * @returns Hex-encoded random string
 */
export function generateToken(
  length: number = TOKEN_CONFIG.TOKEN_LENGTH,
): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length))
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Creates a SHA-256 hash of the token for secure storage
 * @param token - The plain token to hash
 * @returns Hex-encoded hash
 */
export async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(token)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = new Uint8Array(hashBuffer)
  return Array.from(hashArray)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Calculates the expiration date for an access token
 * @returns Date when the access token will expire
 */
export function getAccessTokenExpiry(): Date {
  return new Date(Date.now() + TOKEN_CONFIG.ACCESS_TOKEN_EXPIRY_MS)
}

/**
 * Calculates the expiration date for a refresh token
 * @returns Date when the refresh token will expire
 */
export function getRefreshTokenExpiry(): Date {
  return new Date(Date.now() + TOKEN_CONFIG.REFRESH_TOKEN_EXPIRY_MS)
}

/**
 * Checks if a date is in the past (expired)
 * @param date - The date to check
 * @returns True if the date is in the past
 */
export function isExpired(date: Date): boolean {
  return date.getTime() < Date.now()
}
