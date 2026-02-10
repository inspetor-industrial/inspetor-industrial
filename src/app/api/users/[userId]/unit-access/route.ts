import { subject } from '@casl/ability'
import { defineAbilityFor, type Subjects } from '@inspetor/casl/ability'
import { prisma } from '@inspetor/lib/prisma'
import { getSession } from '@inspetor/lib/auth/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  const session = await getSession()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { userId } = await params
  const companyId = request.nextUrl.searchParams.get('companyId')
  if (!userId || !companyId) {
    return NextResponse.json(
      { error: 'userId and companyId required' },
      { status: 400 },
    )
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, companyId: true, defaultUnitId: true },
  })

  if (!user) {
    return NextResponse.json(null)
  }

  const ability = defineAbilityFor(session.user)
  const subjectUser = subject('User', {
    companyId: user.companyId ?? '',
  }) as unknown as Subjects
  if (!ability.can('update', subjectUser)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const accessRows = await prisma.userUnitAccess.findMany({
    where: { userId, companyId },
    select: { unitId: true },
  })

  const hasFullAccess = accessRows.some((r) => r.unitId === null)
  const allowedUnitIds = accessRows
    .filter((r): r is { unitId: string } => r.unitId !== null)
    .map((r) => r.unitId)

  if (hasFullAccess) {
    return NextResponse.json({
      scope: 'all',
      allowedUnitIds: [],
      defaultUnitId: user.defaultUnitId ?? null,
    })
  }

  return NextResponse.json({
    scope: 'restricted',
    allowedUnitIds,
    defaultUnitId: user.defaultUnitId ?? null,
  })
}
