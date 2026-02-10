'use server'

import { subject } from '@casl/ability'
import { defineAbilityFor, type Subjects } from '@inspetor/casl/ability'
import type { CompanyStatus } from '@inspetor/generated/prisma/client'
import { prisma } from '@inspetor/lib/prisma'
import type { AuthUser } from '@inspetor/types/auth'
import { returnsDefaultActionMessage } from '@inspetor/utils/returns-default-action-message'
import z from 'zod'

import { authProcedure } from '../procedures/auth'

export const updateCompanyUnitAction = authProcedure
  .createServerAction()
  .input(
    z.object({
      unitId: z.string(),
      name: z.string().min(1, 'Nome é obrigatório'),
      status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
    }),
  )
  .handler(async ({ input, ctx }) => {
    const unit = await prisma.companyUnit.findUnique({
      where: { id: input.unitId },
      select: { id: true, companyId: true },
    })

    if (!unit) {
      return returnsDefaultActionMessage({
        message: 'Unidade não encontrada',
        success: false,
      })
    }

    const ability = defineAbilityFor(ctx.user as AuthUser)
    const subjectCompanyUnit = subject('CompanyUnit', {
      companyId: unit.companyId,
    }) as unknown as Subjects
    if (!ability.can('update', subjectCompanyUnit)) {
      return returnsDefaultActionMessage({
        message: 'Sem permissão para editar unidade',
        success: false,
      })
    }

    await prisma.companyUnit.update({
      where: { id: input.unitId },
      data: {
        name: input.name.trim(),
        ...(input.status !== undefined && {
          status: input.status as CompanyStatus,
        }),
      },
    })

    return returnsDefaultActionMessage({
      message: 'Unidade atualizada com sucesso',
      success: true,
    })
  })
