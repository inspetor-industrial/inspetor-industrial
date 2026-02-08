'use server'

import { subject } from '@casl/ability'
import { defineAbilityFor } from '@inspetor/casl/ability'
import { Prisma } from '@inspetor/generated/prisma/client'
import type { AuthUser } from '@inspetor/types/auth'
import { prisma } from '@inspetor/lib/prisma'
import { returnsDefaultActionMessage } from '@inspetor/utils/returns-default-action-message'
import z from 'zod'

import { authProcedure } from './procedures/auth'

export const deleteCompanyAction = authProcedure
  .createServerAction()
  .input(z.object({ companyId: z.string() }))
  .handler(async ({ input, ctx }) => {
    const company = await prisma.company.findUnique({
      where: { id: input.companyId },
      select: { id: true },
    })

    if (!company) {
      return returnsDefaultActionMessage({
        message: 'Empresa não encontrada',
        success: false,
      })
    }

    const ability = defineAbilityFor(ctx.user as AuthUser)
    const subjectCompany = subject('Company', company)
    if (!ability.can('delete', subjectCompany)) {
      return returnsDefaultActionMessage({
        message: 'Sem permissão para excluir empresa',
        success: false,
      })
    }

    const [row] = await prisma.$queryRaw<[{ exists: boolean }]>(
      Prisma.sql`
        SELECT (
          EXISTS (SELECT 1 FROM "User" WHERE "companyId" = ${input.companyId})
          OR EXISTS (SELECT 1 FROM "Clients" WHERE "companyId" = ${input.companyId})
          OR EXISTS (SELECT 1 FROM "BoilerReport" WHERE "companyId" = ${input.companyId})
          OR EXISTS (SELECT 1 FROM "Documents" WHERE "companyId" = ${input.companyId})
          OR EXISTS (SELECT 1 FROM "Equipment" WHERE "companyId" = ${input.companyId})
          OR EXISTS (SELECT 1 FROM "DailyMaintenance" WHERE "companyId" = ${input.companyId})
          OR EXISTS (SELECT 1 FROM "Instruments" WHERE "companyId" = ${input.companyId})
          OR EXISTS (SELECT 1 FROM "Storage" WHERE "companyId" = ${input.companyId})
          OR EXISTS (SELECT 1 FROM "Valve" WHERE "companyId" = ${input.companyId})
          OR EXISTS (SELECT 1 FROM "Bomb" WHERE "companyId" = ${input.companyId})
        ) AS "exists"
      `,
    )

    const hasDependencies = row?.exists ?? false

    if (hasDependencies) {
      return returnsDefaultActionMessage({
        message:
          'Não é possível excluir esta empresa pois existem usuários, clientes, relatórios, documentos, equipamentos, manutenções, instrumentos, armazenamentos, válvulas ou bombas vinculados a ela.',
        success: false,
        conflict: true,
      })
    }

    await prisma.company.delete({
      where: { id: input.companyId },
    })

    return returnsDefaultActionMessage({
      message: 'Empresa deletada com sucesso',
      success: true,
    })
  })
