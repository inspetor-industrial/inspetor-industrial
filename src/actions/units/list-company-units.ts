'use server'

import { subject } from '@casl/ability'
import { defineAbilityFor, type Subjects } from '@inspetor/casl/ability'
import { prisma } from '@inspetor/lib/prisma'
import type { AuthUser } from '@inspetor/types/auth'
import z from 'zod'

import { authProcedure } from '../procedures/auth'

export type CompanyUnitListItem = {
  id: string
  name: string
  status: string
}

export const listCompanyUnitsAction = authProcedure
  .createServerAction()
  .input(z.object({ companyId: z.string() }))
  .handler(async ({ input, ctx }) => {
    const company = await prisma.company.findUnique({
      where: { id: input.companyId },
      select: { id: true },
    })

    if (!company) {
      return { units: [] as CompanyUnitListItem[] }
    }

    const ability = defineAbilityFor(ctx.user as AuthUser)
    const subjectCompanyUnit = subject('CompanyUnit', {
      companyId: input.companyId,
    }) as unknown as Subjects
    if (!ability.can('read', subjectCompanyUnit)) {
      return { units: [] as CompanyUnitListItem[] }
    }

    const units = await prisma.companyUnit.findMany({
      where: { companyId: input.companyId },
      select: { id: true, name: true, status: true },
      orderBy: { name: 'asc' },
    })

    return {
      units: units.map((u) => ({
        id: u.id,
        name: u.name,
        status: u.status,
      })),
    }
  })
