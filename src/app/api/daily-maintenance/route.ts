import { getSession } from '@inspetor/lib/auth/server'
import { prisma } from '@inspetor/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

const PAGE_SIZE = 10

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const equipmentId = searchParams.get('equipmentId')
  const search = searchParams.get('search') ?? ''
  const page = Math.max(1, Number(searchParams.get('page')) || 1)

  if (!equipmentId) {
    return NextResponse.json(
      { error: 'equipmentId is required' },
      { status: 400 },
    )
  }

  const isAdmin = session.user.role === 'ADMIN'
  const userCompanyId = session.user.companyId ?? null

  const equipment = await prisma.equipment.findFirst({
    where: {
      id: equipmentId,
      ...(isAdmin ? {} : { companyId: userCompanyId ?? undefined }),
    },
  })

  if (!equipment) {
    return NextResponse.json({ error: 'Equipment not found' }, { status: 404 })
  }

  const where = {
    equipmentId,
    ...(search
      ? {
          OR: [
            {
              operatorName: {
                contains: search,
                mode: 'insensitive' as const,
              },
            },
            {
              description: {
                contains: search,
                mode: 'insensitive' as const,
              },
            },
          ],
        }
      : {}),
    ...(isAdmin ? {} : { companyId: userCompanyId ?? undefined }),
  }

  const [dailyMaintenances, total] = await Promise.all([
    prisma.dailyMaintenance.findMany({
      where,
      include: {
        company: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.dailyMaintenance.count({ where }),
  ])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return NextResponse.json({
    dailyMaintenances,
    totalPages,
  })
}
