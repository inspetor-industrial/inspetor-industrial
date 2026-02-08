import { getSession } from '@inspetor/lib/auth/server'
import { prisma } from '@inspetor/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await getSession()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const isAdmin = session.user.role === 'ADMIN'
  const userCompanyId = session.user.companyId ?? null

  if (!isAdmin && userCompanyId === null) {
    return NextResponse.json({ companies: [], total: 0 })
  }

  const where = isAdmin ? {} : { id: userCompanyId as string }
  const [companies, total] = await Promise.all([
    prisma.company.findMany({
      where,
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
    prisma.company.count({ where }),
  ])

  return NextResponse.json({ companies, total })
}
