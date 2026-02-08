import { getSession } from '@inspetor/lib/auth/server'
import { prisma } from '@inspetor/lib/prisma'
import { calculatePagination } from '@inspetor/utils/calculate-pagination'
import { NextRequest, NextResponse } from 'next/server'

const PAGE_SIZE = 10

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') ?? ''
  const page = Math.max(1, Number(searchParams.get('page')) || 1)

  const isAdmin = session.user.role.toLowerCase() === 'admin'

  const where = {
    company: {
      name: {
        contains: search,
        mode: 'insensitive' as const,
      },
      ...(isAdmin
        ? {}
        : {
            users: {
              some: {
                username: session.user.username ?? 'unknown',
              },
            },
          }),
    },
  }

  const [storages, totalStorages] = await Promise.all([
    prisma.storage.findMany({
      where,
      include: {
        company: {
          select: {
            name: true,
            id: true,
          },
        },
      },
      ...calculatePagination(page),
    }),
    prisma.storage.count({ where }),
  ])

  const totalPages = Math.ceil(totalStorages / PAGE_SIZE)

  return NextResponse.json({
    storages,
    totalPages,
  })
}
