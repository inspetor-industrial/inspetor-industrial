import { subject } from '@casl/ability'
import { defineAbilityFor, type Subjects } from '@inspetor/casl/ability'
import { prisma } from '@inspetor/lib/prisma'
import { getSession } from '@inspetor/lib/auth/server'
import { NextRequest, NextResponse } from 'next/server'

const PAGE_SIZE = 10

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> },
) {
  const session = await getSession()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { companyId } = await params
  if (!companyId) {
    return NextResponse.json({ error: 'companyId required' }, { status: 400 })
  }

  const ability = defineAbilityFor(session.user)
  const subjectCompanyUnit = subject('CompanyUnit', {
    companyId,
  }) as unknown as Subjects
  if (!ability.can('read', subjectCompanyUnit)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const page = Math.max(1, Number(searchParams.get('page')) || 1)
  const perPageParam = searchParams.get('perPage')
  const take = perPageParam
    ? Math.min(100, Math.max(1, Number(perPageParam) || PAGE_SIZE))
    : PAGE_SIZE

  const where = { companyId }

  const [units, totalUnits] = await Promise.all([
    prisma.companyUnit.findMany({
      where,
      skip: (page - 1) * take,
      take,
      select: { id: true, name: true, status: true },
      orderBy: { name: 'asc' },
    }),
    prisma.companyUnit.count({ where }),
  ])

  const totalPages = Math.ceil(totalUnits / take)

  return NextResponse.json({
    units: units.map((u) => ({ id: u.id, name: u.name, status: u.status })),
    totalPages,
  })
}
