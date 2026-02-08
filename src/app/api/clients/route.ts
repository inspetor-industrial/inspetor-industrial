import { defineAbilityFor } from '@inspetor/casl/ability'
import { getSession } from '@inspetor/lib/auth/server'
import { prisma } from '@inspetor/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

const PAGE_SIZE = 10

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const ability = defineAbilityFor(session.user)
  if (!ability.can('read', 'Client')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') ?? ''
  const page = Math.max(1, Number(searchParams.get('page')) || 1)

  const isAdmin = session.user.role === 'ADMIN'
  const userCompanyId = session.user.companyId ?? undefined

  const where = {
    companyName: {
      contains: search,
      mode: 'insensitive' as const,
    },
    ...(isAdmin ? {} : { companyId: userCompanyId }),
  }

  const [clients, totalClients] = await Promise.all([
    prisma.clients.findMany({
      where,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        company: {
          select: { name: true },
        },
      },
    }),
    prisma.clients.count({ where }),
  ])

  const totalPages = Math.ceil(totalClients / PAGE_SIZE)

  return NextResponse.json({
    clients,
    totalPages,
  })
}
