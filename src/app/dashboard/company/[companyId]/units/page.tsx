import { subject } from '@casl/ability'
import { defineAbilityFor, type Subjects } from '@inspetor/casl/ability'
import { prisma } from '@inspetor/lib/prisma'
import { getSession } from '@inspetor/lib/auth/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { UnitsSection } from './components/units-section'

export default async function CompanyUnitsPage({
  params,
}: {
  params: Promise<{ companyId: string }>
}) {
  const session = await getSession()
  if (!session?.user) {
    redirect('/auth/sign-in')
  }

  const { companyId } = await params
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { id: true, name: true },
  })

  if (!company) {
    redirect('/dashboard/company')
  }

  const ability = defineAbilityFor(session.user)
  const subjectCompanyUnit = subject('CompanyUnit', {
    companyId: company.id,
  }) as unknown as Subjects
  if (!ability.can('read', subjectCompanyUnit)) {
    redirect('/access-denied')
  }

  return (
    <div className="flex flex-col gap-4">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/dashboard/company" className="hover:text-foreground">
          Empresas
        </Link>
        <span aria-hidden>/</span>
        <span className="text-foreground">{company.name}</span>
        <span aria-hidden>/</span>
        <span className="text-foreground">Unidades</span>
      </nav>
      <h1 className="text-2xl font-bold">
        Unidades — {company.name}
      </h1>
      <UnitsSection companyId={company.id} companyName={company.name} />
    </div>
  )
}
