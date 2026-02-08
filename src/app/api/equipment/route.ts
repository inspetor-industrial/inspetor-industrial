import type { EquipmentWhereInput } from '@inspetor/generated/prisma/models'
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
  const search = searchParams.get('search') ?? ''
  const page = Math.max(1, Number(searchParams.get('page')) || 1)

  const isAdmin = session.user.role === 'ADMIN'
  const userCompanyId = session.user.companyId ?? null

  const where: EquipmentWhereInput = {
    ...(search
      ? {
          name: {
            contains: search,
            mode: 'insensitive' as const,
          },
        }
      : {}),
    ...(isAdmin ? {} : { companyId: userCompanyId ?? undefined }),
  }

  const [equipments, totalEquipments] = await Promise.all([
    prisma.equipment.findMany({
      where,
      include: {
        company: {
          select: { name: true },
        },
      },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.equipment.count({ where }),
  ])

  const totalPages = Math.ceil(totalEquipments / PAGE_SIZE)

  return NextResponse.json({
    equipments,
    totalPages,
  })
}
