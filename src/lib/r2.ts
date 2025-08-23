import { S3Client } from '@aws-sdk/client-s3'
import { env } from '@inspetor/env'

export const r2 = new S3Client({
  region: 'auto',
  endpoint: env.CLOUDFLARE_R2_BUCKET_ENDPOINT,
  credentials: {
    accessKeyId: env.CLOUDFLARE_ACCOUNT_KEY_ID,
    secretAccessKey: env.CLOUDFLARE_SECRET_ACCESS_KEY,
  },
})
