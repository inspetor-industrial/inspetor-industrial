import { randomUUID } from 'node:crypto'

import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { env } from '@inspetor/env'
import { auth } from '@inspetor/lib/auth/authjs'
import { prisma } from '@inspetor/lib/prisma'
import { r2 } from '@inspetor/lib/r2'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const FILE_EXPIRATION_TIME_IN_SECONDS = 60 * 60 * 2 // 1 hour
const schema = z.object({
  files: z.array(
    z.object({
      name: z.string(),
      type: z.string(),
      size: z.number(),
      correlationId: z.string(),
    }),
  ),
})

type SignedUrl = {
  signedUrl: string
  key: string
  correlationId: string
  documentId: string
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
  })

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  if (!user.companyId) {
    return NextResponse.json(
      { error: 'User not associated to a company' },
      { status: 400 },
    )
  }

  const bodyJSON = await request.json()
  const { files } = schema.parse(bodyJSON)

  const signedUrls: SignedUrl[] = []
  for (const file of files) {
    const cloudflareR2Key = `${user.companyId}-${randomUUID()}-${file.name}`

    const command = new PutObjectCommand({
      Bucket: env.CLOUDFLARE_R2_BUCKET_NAME,
      Key: cloudflareR2Key,
      ContentType: file.type,
    })

    const document = await prisma.documents.create({
      data: {
        name: file.name,
        type: file.type,
        size: file.size,
        cloudflareR2Key,
        ownerId: user.id,
        companyId: user.companyId,
      },
    })

    const signedUrl = await getSignedUrl(r2, command, {
      expiresIn: FILE_EXPIRATION_TIME_IN_SECONDS,
    })

    signedUrls.push({
      signedUrl,
      key: cloudflareR2Key,
      correlationId: file.correlationId,
      documentId: document.id,
    })
  }

  return NextResponse.json({ signedUrls })
}
