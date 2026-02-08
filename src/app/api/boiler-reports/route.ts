import { UserRole } from '@inspetor/generated/prisma/client'
import { getFullAuthenticatedUser } from '@inspetor/lib/auth/get-full-user'
import { getSession } from '@inspetor/lib/auth/server'
import { prisma } from '@inspetor/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

const PAGE_SIZE = 10

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const fullUser = await getFullAuthenticatedUser(session)
  const isAdmin = session.user.role === UserRole.ADMIN

  if (!isAdmin && !fullUser?.companyId) {
    return NextResponse.json(
      { error: 'Forbidden' },
      { status: 403 },
    )
  }

  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') ?? ''
  const page = Math.max(1, Number(searchParams.get('page')) || 1)
  const companyIdParam = searchParams.get('companyId') ?? ''

  const effectiveCompanyId = isAdmin
    ? companyIdParam || undefined
    : fullUser?.companyId ?? undefined

  const where = {
    ...(effectiveCompanyId ? { companyId: effectiveCompanyId } : {}),
    ...(search
      ? {
          client: {
            companyName: {
              contains: search,
              mode: 'insensitive' as const,
            },
          },
        }
      : {}),
  }

  const [boilerReports, totalBoilerReports] = await Promise.all([
    prisma.boilerReport.findMany({
      where,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        client: { select: { companyName: true } },
        engineer: {
          select: { name: true, username: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.boilerReport.count({ where }),
  ])

  const totalPages = Math.ceil(totalBoilerReports / PAGE_SIZE)

  return NextResponse.json({
    boilerReports,
    totalPages,
  })
}
