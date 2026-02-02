import { env } from '@inspetor/env'
import { snakify } from '@inspetor/utils/snakify'
import { google } from 'googleapis'

const PEM_HEADER = '-----BEGIN'

/**
 * Normalizes GOOGLE_PRIVATE_KEY for OpenSSL 3 compatibility in production.
 * Accepts either raw PEM (with real newlines or escaped \n) or base64-encoded PEM.
 * Ensures newlines are real so the decoder does not throw ERR_OSSL_UNSUPPORTED.
 */
function normalizePrivateKey(raw: string): string {
  const trimmed = raw.trim()
  if (trimmed.startsWith(PEM_HEADER)) {
    return trimmed.replace(/\\n/g, '\n')
  }

  const base64Clean = trimmed.replace(/\s/g, '')
  const decoded = Buffer.from(base64Clean, 'base64').toString('utf-8')
  return decoded.replace(/\\n/g, '\n').trim()
}

const googlePrivateKey = normalizePrivateKey(env.GOOGLE_PRIVATE_KEY)

export function getGoogleDriveClient() {
  const bucket = {
    type: env.GOOGLE_SERVICE_ACCOUNT_TYPE,
    projectId: env.GOOGLE_PROJECT_ID,
    privateKeyId: env.GOOGLE_PRIVATE_KEY_ID,
    privateKey: googlePrivateKey,
    clientEmail: env.GOOGLE_CLIENT_EMAIL,
    clientId: env.GOOGLE_CLIENT_ID,
    authUri: env.GOOGLE_AUTH_URI,
    tokenUri: env.GOOGLE_TOKEN_URI,
    authProviderX509CertUrl: env.GOOGLE_AUTH_PROVIDER_X509_CERT_URL,
    clientX509CertUrl: env.GOOGLE_CLIENT_X509_CERT_URL,
    universeDomain: env.GOOGLE_UNIVERSE_DOMAIN,
  }

  console.debug('[DEBUG] bucket credentials', bucket)

  const credentials = Object.keys(bucket).reduce(
    (acc, key) => {
      acc[snakify(key)] = bucket[key as keyof typeof bucket] as string
      return acc
    },
    {} as Record<string, string>,
  )

  console.debug('[DEBUG] credentials', credentials)

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  })

  console.debug('[DEBUG] auth', auth)

  const drive = google.drive({ version: 'v3', auth })
  console.debug('[DEBUG] drive', drive)
  return drive
}
