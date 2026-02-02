import { env } from '@inspetor/env'
import { PrivateKeyNormalizer } from '@inspetor/utils/normalize-private-key'
import { snakify } from '@inspetor/utils/snakify'
import { google } from 'googleapis'

const googlePrivateKey = PrivateKeyNormalizer.normalize(env.GOOGLE_PRIVATE_KEY)

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

  const credentials = Object.keys(bucket).reduce(
    (acc, key) => {
      acc[snakify(key)] = bucket[key as keyof typeof bucket] as string
      return acc
    },
    {} as Record<string, string>,
  )

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  })

  const drive = google.drive({ version: 'v3', auth })
  return drive
}
