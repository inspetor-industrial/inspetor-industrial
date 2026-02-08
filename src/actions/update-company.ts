'use server'

import { subject } from '@casl/ability'
import { type Subjects, defineAbilityFor } from '@inspetor/casl/ability'
import type { AuthUser } from '@inspetor/types/auth'
import { prisma } from '@inspetor/lib/prisma'
import { returnsDefaultActionMessage } from '@inspetor/utils/returns-default-action-message'
import z from 'zod'

import { authProcedure } from './procedures/auth'

export const updateCompanyAction = authProcedure
  .createServerAction()
  .input(
    z.object({
      companyId: z.string(),
      name: z.string(),
      cnpj: z.string(),
    }),
  )
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
    const subjectCompany = subject('Company', company) as unknown as Subjects
    if (!ability.can('update', subjectCompany)) {
      return returnsDefaultActionMessage({
        message: 'Sem permissão para editar empresa',
        success: false,
      })
    }

    await prisma.company.update({
      where: { id: input.companyId },
      data: {
        name: input.name,
        cnpj: input.cnpj,
      },
    })

    return returnsDefaultActionMessage({
      message: 'Empresa atualizada com sucesso',
      success: true,
    })
  })
