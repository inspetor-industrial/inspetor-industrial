import crypto from 'node:crypto'

export function generateVerificationToken(userId: string) {
  const token = crypto
    .createHash('sha256')
    .update(userId + crypto.randomBytes(16).toString('hex'))
    .digest('hex')

  const expiresInMiliseconds = 2 * 60 * 60 * 1000 // 2 hours
  const expires = new Date(Date.now() + expiresInMiliseconds)

  return {
    token,
    expires,
    identifier: userId,
  }
}
