import { defineAbilityFor } from '@inspetor/casl/ability'
import { UserResponsibility } from '@inspetor/generated/prisma/enums'
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
  if (!ability.can('read', 'User')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const page = Math.max(1, Number(searchParams.get('page')) || 1)
  const perPageParam = searchParams.get('perPage')
  const take = perPageParam
    ? Math.min(1000, Math.max(1, Number(perPageParam) || PAGE_SIZE))
    : PAGE_SIZE

  const isAdmin = session.user.role === 'ADMIN'
  const userCompanyId = session.user.companyId ?? undefined
  const companyIdParam = searchParams.get('companyId')
  const resolvedCompanyId =
    isAdmin && companyIdParam ? companyIdParam : userCompanyId

  const where = {
    responsibility: UserResponsibility.ENGINEER,
    ...(resolvedCompanyId ? { companyId: resolvedCompanyId } : {}),
  }

  const engineers = await prisma.user.findMany({
    where,
    skip: (page - 1) * take,
    take,
    select: {
      id: true,
      name: true,
      username: true,
    },
    orderBy: { name: 'asc' },
  })

  const totalCount = await prisma.user.count({ where })
  const totalPages = Math.ceil(totalCount / take)

  return NextResponse.json({
    engineers,
    totalPages,
  })
}
