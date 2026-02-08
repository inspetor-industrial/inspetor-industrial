import { UserRole, type UserStatus } from '@inspetor/generated/prisma/client'
import { getSession } from '@inspetor/lib/auth/server'
import { prisma } from '@inspetor/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

const PAGE_SIZE = 10

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (session.user.role !== UserRole.ADMIN) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') ?? ''
  const page = Math.max(1, Number(searchParams.get('page')) || 1)
  const statusParam = searchParams.get('status') ?? ''

  const where = {
    ...(search
      ? {
          name: {
            contains: search,
            mode: 'insensitive' as const,
          },
        }
      : {}),
    ...(statusParam === 'ACTIVE' || statusParam === 'INACTIVE'
      ? { status: statusParam as UserStatus }
      : {}),
  }

  const [users, totalUsers] = await Promise.all([
    prisma.user.findMany({
      where,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        company: {
          select: { name: true },
        },
      },
    }),
    prisma.user.count({ where }),
  ])

  const totalPages = Math.ceil(totalUsers / PAGE_SIZE)

  return NextResponse.json({
    users,
    totalPages,
  })
}
