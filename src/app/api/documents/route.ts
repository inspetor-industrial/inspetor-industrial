import { getSession } from '@inspetor/lib/auth/server'
import { prisma } from '@inspetor/lib/prisma'
import { calculatePagination } from '@inspetor/utils/calculate-pagination'
import { NextRequest, NextResponse } from 'next/server'

const PAGE_SIZE = 10

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') ?? ''
  const page = Math.max(1, Number(searchParams.get('page')) || 1)

  const isAdmin = session.user.role.toLowerCase() === 'admin'
  const username = session.user.username ?? 'unknown'

  const where = {
    name: {
      contains: search,
      mode: 'insensitive' as const,
    },
    owner: {
      username,
    },
    ...(isAdmin
      ? {}
      : {
          company: {
            users: {
              some: {
                username,
              },
            },
          },
        }),
  }

  const [documents, totalDocuments] = await Promise.all([
    prisma.documents.findMany({
      where,
      include: {
        owner: {
          select: {
            name: true,
          },
        },
      },
      ...calculatePagination(page),
    }),
    prisma.documents.count({ where }),
  ])

  const totalPages = Math.ceil(totalDocuments / PAGE_SIZE)

  return NextResponse.json({
    documents,
    totalPages,
  })
}
