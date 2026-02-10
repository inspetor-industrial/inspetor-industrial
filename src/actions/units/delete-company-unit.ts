'use server'

import { subject } from '@casl/ability'
import { defineAbilityFor, type Subjects } from '@inspetor/casl/ability'
import { prisma } from '@inspetor/lib/prisma'
import type { AuthUser } from '@inspetor/types/auth'
import { returnsDefaultActionMessage } from '@inspetor/utils/returns-default-action-message'
import z from 'zod'

import { authProcedure } from '../procedures/auth'

export const deleteCompanyUnitAction = authProcedure
  .createServerAction()
  .input(z.object({ unitId: z.string() }))
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
    if (!ability.can('delete', subjectCompanyUnit)) {
      return returnsDefaultActionMessage({
        message: 'Sem permissão para excluir unidade',
        success: false,
      })
    }

    const accessCount = await prisma.userUnitAccess.count({
      where: { unitId: input.unitId },
    })

    if (accessCount > 0) {
      return returnsDefaultActionMessage({
        message:
          'Não é possível excluir esta unidade pois existem usuários com acesso restrito a ela.',
        success: false,
        conflict: true,
      })
    }

    const usersWithDefaultUnit = await prisma.user.count({
      where: { defaultUnitId: input.unitId },
    })

    if (usersWithDefaultUnit > 0) {
      await prisma.user.updateMany({
        where: { defaultUnitId: input.unitId },
        data: { defaultUnitId: null },
      })
    }

    await prisma.companyUnit.delete({
      where: { id: input.unitId },
    })

    return returnsDefaultActionMessage({
      message: 'Unidade excluída com sucesso',
      success: true,
    })
  })
