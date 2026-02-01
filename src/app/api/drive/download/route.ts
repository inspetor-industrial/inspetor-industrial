import { Readable } from 'node:stream'

import { getSession } from '@inspetor/lib/auth/server'
import { getGoogleDriveClient } from '@inspetor/lib/google'
import { prisma } from '@inspetor/lib/prisma'

export const runtime = 'nodejs' // garante Node (necessário para Node streams)
export const dynamic = 'force-dynamic'

function toAscii(text: string) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // diacríticos
    .replace(/[^\x20-\x7E]/g, '') // não-ASCII
    .replace(/["\\]/g, '') // aspas/escape
    .replace(/[^A-Za-z0-9._-]+/g, '_') // caracteres fora do permitido
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const fileId = searchParams.get('fileId')
  if (!fileId) return new Response('Bad Request', { status: 400 })

  const session = await getSession()
  if (!session?.user?.email)
    return new Response('Unauthorized', { status: 401 })
  const userEmail = session.user.email!

  const company = await prisma.company.findFirst({
    where: { users: { some: { email: userEmail } } },
  })
  if (!company) return new Response('Unauthorized', { status: 401 })

  const storage = await prisma.storage.findFirst({
    where: { companyId: company.id },
  })
  if (!storage) return new Response('Unauthorized', { status: 401 })

  const drive = await getGoogleDriveClient()
  const metadata = await drive.files.get({
    fileId,
    fields: 'id, name, size, mimeType',
  })

  const filename = metadata.data.name ?? 'arquivo'
  const mimeType = metadata.data.mimeType ?? 'application/octet-stream'
  const size = metadata.data.size ? String(metadata.data.size) : undefined

  // <<< PEÇA COMO STREAM >>>
  const fileResponse = await drive.files.get(
    { fileId, alt: 'media' },
    { responseType: 'stream' }, // <- importante
  )

  const nodeStream = fileResponse.data as unknown as Readable
  const webStream = Readable.toWeb(nodeStream) as unknown as ReadableStream

  // dica: filename com caracteres especiais
  const encodedFilename = encodeURIComponent(filename)
    .replace(/['()]/g, '') // %27 %28 %29
    .replace(/\*/g, '%2A')
  const contentDisposition = `attachment; filename="${toAscii(filename)}"; filename*=UTF-8''${encodedFilename}`

  return new Response(webStream, {
    headers: {
      'Content-Type': mimeType,
      ...(size ? { 'Content-Length': size } : {}),
      'Content-Disposition': contentDisposition,
      'Cache-Control': 'private, no-store',
    },
  })
}
