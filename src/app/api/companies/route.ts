import { UserRole } from '@inspetor/generated/prisma/client'
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
  const perPageParam = searchParams.get('perPage')
  const take = perPageParam
    ? Math.min(1000, Math.max(1, Number(perPageParam) || PAGE_SIZE))
    : PAGE_SIZE

  const where = search
    ? {
        name: {
          contains: search,
          mode: 'insensitive' as const,
        },
      }
    : {}

  const [companies, totalCompanies] = await Promise.all([
    prisma.company.findMany({
      where,
      skip: (page - 1) * take,
      take,
      select: {
        id: true,
        name: true,
        cnpj: true,
        status: true,
      },
      orderBy: { name: 'asc' },
    }),
    prisma.company.count({ where }),
  ])

  const totalPages = Math.ceil(totalCompanies / take)

  return NextResponse.json({
    companies,
    totalPages,
  })
}
