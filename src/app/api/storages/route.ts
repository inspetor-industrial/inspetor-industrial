import type { StorageWhereInput } from '@inspetor/generated/prisma/models'
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

  const isAdmin = session.user.role === 'ADMIN'
  const userCompanyId = session.user.companyId ?? null

  let where: StorageWhereInput = {
    ...(search
      ? {
          company: {
            name: {
              contains: search,
              mode: 'insensitive' as const,
            },
          },
        }
      : {}),
    ...(isAdmin ? {} : { companyId: userCompanyId ?? undefined }),
  }

  if (!isAdmin && userCompanyId) {
    const accessRows = await prisma.userUnitAccess.findMany({
      where: {
        userId: session.user.id,
        companyId: userCompanyId,
      },
      select: { unitId: true },
    })
    const hasFullAccess = accessRows.some((r) => r.unitId === null)
    const allowedUnitIds = accessRows
      .filter((r): r is { unitId: string } => r.unitId !== null)
      .map((r) => r.unitId)

    if (!hasFullAccess && allowedUnitIds.length > 0) {
      where = {
        ...where,
        OR: [
          { storageUnits: { none: {} } },
          {
            storageUnits: {
              some: { unitId: { in: allowedUnitIds } },
            },
          },
        ],
      }
    }
  }

  const [storagesRaw, totalStorages] = await Promise.all([
    prisma.storage.findMany({
      where,
      include: {
        company: {
          select: {
            name: true,
            id: true,
          },
        },
        storageUnits: {
          include: {
            unit: {
              select: { id: true, name: true },
            },
          },
        },
      },
      ...calculatePagination(page),
    }),
    prisma.storage.count({ where }),
  ])

  const storages = storagesRaw.map((s) => {
    const { storageUnits, ...rest } = s
    return {
      ...rest,
      units: storageUnits.map((su) => ({
        id: su.unit.id,
        name: su.unit.name,
      })),
    }
  })

  const totalPages = Math.ceil(totalStorages / PAGE_SIZE)

  return NextResponse.json({
    storages,
    totalPages,
  })
}
