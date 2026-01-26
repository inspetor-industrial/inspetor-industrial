import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  server: {
    DATABASE_URL: z.url(),
    AUTH_SECRET: z.string(),
    GOOGLE_EMAIL: z.string(),
    GOOGLE_PASSWORD: z.string(),
    SUPPORT_EMAIL: z.string(),
    SUPPORT_PASSWORD: z.string(),

    GOOGLE_SERVICE_ACCOUNT_TYPE: z.string(),
    GOOGLE_PROJECT_ID: z.string(),
    GOOGLE_PRIVATE_KEY_ID: z.string(),
    GOOGLE_PRIVATE_KEY: z.string(),
    GOOGLE_CLIENT_EMAIL: z.string(),
    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_AUTH_URI: z.string(),
    GOOGLE_TOKEN_URI: z.string(),
    GOOGLE_AUTH_PROVIDER_X509_CERT_URL: z.string(),
    GOOGLE_CLIENT_X509_CERT_URL: z.string(),
    GOOGLE_UNIVERSE_DOMAIN: z.string(),

    CLOUDFLARE_R2_BUCKET_ENDPOINT: z.string(),
    CLOUDFLARE_ACCOUNT_KEY_ID: z.string(),
    CLOUDFLARE_SECRET_ACCESS_KEY: z.string(),
    CLOUDFLARE_ENDPOINT: z.string(),
    CLOUDFLARE_R2_BUCKET_NAME: z.string(),

    APPLICATION_URL: z.url(),

    EXPERIMENTATION_CONFIG: z.url(),
    GROWTHBOOK_CLIENT_KEY: z.string(),
  },
  client: {},
  // If you're using Next.js < 13.4.4, you'll need to specify the runtimeEnv manually
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    AUTH_SECRET: process.env.AUTH_SECRET,

    GOOGLE_EMAIL: process.env.GOOGLE_EMAIL,
    GOOGLE_PASSWORD: process.env.GOOGLE_PASSWORD,

    SUPPORT_EMAIL: process.env.SUPPORT_EMAIL,
    SUPPORT_PASSWORD: process.env.SUPPORT_PASSWORD,

    GOOGLE_SERVICE_ACCOUNT_TYPE: process.env.GOOGLE_SERVICE_ACCOUNT_TYPE,
    GOOGLE_PROJECT_ID: process.env.GOOGLE_PROJECT_ID,
    GOOGLE_PRIVATE_KEY_ID: process.env.GOOGLE_PRIVATE_KEY_ID,
    GOOGLE_PRIVATE_KEY: process.env.GOOGLE_PRIVATE_KEY,
    GOOGLE_CLIENT_EMAIL: process.env.GOOGLE_CLIENT_EMAIL,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_AUTH_URI: process.env.GOOGLE_AUTH_URI,
    GOOGLE_TOKEN_URI: process.env.GOOGLE_TOKEN_URI,
    GOOGLE_AUTH_PROVIDER_X509_CERT_URL:
      process.env.GOOGLE_AUTH_PROVIDER_X509_CERT_URL,
    GOOGLE_CLIENT_X509_CERT_URL: process.env.GOOGLE_CLIENT_X509_CERT_URL,
    GOOGLE_UNIVERSE_DOMAIN: process.env.GOOGLE_UNIVERSE_DOMAIN,

    CLOUDFLARE_R2_BUCKET_ENDPOINT: process.env.CLOUDFLARE_R2_BUCKET_ENDPOINT,
    CLOUDFLARE_ACCOUNT_KEY_ID: process.env.CLOUDFLARE_ACCOUNT_KEY_ID,
    CLOUDFLARE_SECRET_ACCESS_KEY: process.env.CLOUDFLARE_SECRET_ACCESS_KEY,
    CLOUDFLARE_ENDPOINT: process.env.CLOUDFLARE_ENDPOINT,
    CLOUDFLARE_R2_BUCKET_NAME: process.env.CLOUDFLARE_R2_BUCKET_NAME,

    APPLICATION_URL: process.env.APPLICATION_URL,

    EXPERIMENTATION_CONFIG: process.env.EXPERIMENTATION_CONFIG,
    GROWTHBOOK_CLIENT_KEY: process.env.GROWTHBOOK_CLIENT_KEY,
  },
  // For Next.js >= 13.4.4, you only need to destructure client variables:
  // experimental__runtimeEnv: {
  //   NEXT_PUBLIC_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_PUBLISHABLE_KEY,
  // }
})
