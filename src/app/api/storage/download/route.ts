import { GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { env } from '@inspetor/env'
import { auth } from '@inspetor/lib/auth/authjs'
import { prisma } from '@inspetor/lib/prisma'
import { r2 } from '@inspetor/lib/r2'
import { NextRequest, NextResponse } from 'next/server'

const FILE_EXPIRATION_TIME_IN_SECONDS = 60 * 60 * 2 // 2 hours

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const documentId = searchParams.get('documentId')

  if (!documentId) {
    return NextResponse.json({ error: 'documentId is required' }, { status: 400 })
  }

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

  const document = await prisma.documents.findUnique({
    where: {
      id: documentId,
    },
  })

  if (!document) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 })
  }

  // Verify user has access to this document (same company)
  if (document.companyId !== user.companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const command = new GetObjectCommand({
    Bucket: env.CLOUDFLARE_R2_BUCKET_NAME,
    Key: document.cloudflareR2Key,
  })

  const signedUrl = await getSignedUrl(r2, command, {
    expiresIn: FILE_EXPIRATION_TIME_IN_SECONDS,
  })

  return NextResponse.json({
    url: signedUrl,
    fileName: document.name,
  })
}
