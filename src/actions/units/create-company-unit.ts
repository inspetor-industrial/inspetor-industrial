'use server'

import { subject } from '@casl/ability'
import { defineAbilityFor, type Subjects } from '@inspetor/casl/ability'
import type { CompanyStatus } from '@inspetor/generated/prisma/client'
import { prisma } from '@inspetor/lib/prisma'
import type { AuthUser } from '@inspetor/types/auth'
import { returnsDefaultActionMessage } from '@inspetor/utils/returns-default-action-message'
import z from 'zod'

import { authProcedure } from '../procedures/auth'

export const createCompanyUnitAction = authProcedure
  .createServerAction()
  .input(
    z.object({
      companyId: z.string(),
      name: z.string().min(1, 'Nome é obrigatório'),
      status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
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
    const subjectCompanyUnit = subject('CompanyUnit', {
      companyId: input.companyId,
    }) as unknown as Subjects
    if (!ability.can('create', subjectCompanyUnit)) {
      return returnsDefaultActionMessage({
        message: 'Sem permissão para criar unidade',
        success: false,
      })
    }

    await prisma.companyUnit.create({
      data: {
        companyId: input.companyId,
        name: input.name.trim(),
        status: (input.status ?? 'ACTIVE') as CompanyStatus,
      },
    })

    return returnsDefaultActionMessage({
      message: 'Unidade criada com sucesso',
      success: true,
    })
  })
