'use server'

import { subject } from '@casl/ability'
import { defineAbilityFor } from '@inspetor/casl/ability'
import { prisma } from '@inspetor/lib/prisma'
import { returnsDefaultActionMessage } from '@inspetor/utils/returns-default-action-message'
import z from 'zod'
import type { AuthUser } from '@inspetor/types/auth'

import { authProcedure } from './procedures/auth'

export const deleteMaintenanceAction = authProcedure
  .createServerAction()
  .input(
    z.object({
      dailyMaintenanceId: z.string(),
    }),
  )
  .handler(async ({ input, ctx }) => {
    const dailyMaintenance = await prisma.dailyMaintenance.findUnique({
      where: { id: input.dailyMaintenanceId },
    })

    if (!dailyMaintenance) {
      return returnsDefaultActionMessage({
        message: 'Manutenção diária não encontrada',
        success: false,
      })
    }

    const ability = defineAbilityFor(ctx.user as AuthUser)
    if (
      !ability.can(
        'delete',
        subject('MaintenanceDaily', {
          companyId: dailyMaintenance.companyId,
        }),
      )
    ) {
      return returnsDefaultActionMessage({
        message: 'Sem permissão para excluir manutenção diária',
        success: false,
      })
    }

    await prisma.dailyMaintenance.delete({
      where: {
        id: input.dailyMaintenanceId,
      },
    })

    return returnsDefaultActionMessage({
      message: 'Manutenção diária deletada com sucesso',
      success: true,
    })
  })
