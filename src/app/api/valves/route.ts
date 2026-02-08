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
  const companyId = searchParams.get('companyId') ?? ''

  const where = {
    ...(search
      ? {
          serialNumber: {
            contains: search,
            mode: 'insensitive' as const,
          },
        }
      : {}),
    ...(companyId ? { companyId } : {}),
  }

  const [valves, totalValves] = await Promise.all([
    prisma.valve.findMany({
      where,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        serialNumber: true,
        model: true,
        diameter: true,
        flow: true,
        openingPressure: true,
        closingPressure: true,
        companyId: true,
        company: {
          select: { name: true },
        },
      },
      orderBy: { serialNumber: 'asc' },
    }),
    prisma.valve.count({ where }),
  ])

  const totalPages = Math.ceil(totalValves / PAGE_SIZE)

  return NextResponse.json({
    valves,
    totalPages,
  })
}
