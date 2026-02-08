'use server'

import { subject } from '@casl/ability'
import { type Subjects, defineAbilityFor } from '@inspetor/casl/ability'
import { prisma } from '@inspetor/lib/prisma'
import { returnsDefaultActionMessage } from '@inspetor/utils/returns-default-action-message'
import z from 'zod'
import type { AuthUser } from '@inspetor/types/auth'

import { authProcedure } from './procedures/auth'

export const updateMaintenanceAction = authProcedure
  .createServerAction()
  .input(
    z.object({
      dailyMaintenanceId: z.string(),
      equipment: z.string(),
      operatorName: z.string(),
      description: z.string(),
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
    const subjectMaintenance = subject('MaintenanceDaily', {
      companyId: dailyMaintenance.companyId,
    }) as unknown as Subjects
    if (!ability.can('update', subjectMaintenance)) {
      return returnsDefaultActionMessage({
        message: 'Sem permissão para atualizar manutenção diária',
        success: false,
      })
    }

    await prisma.dailyMaintenance.update({
      where: {
        id: input.dailyMaintenanceId,
      },
      data: {
        equipmentId: input.equipment,
        operatorName: input.operatorName,
        description: input.description,
      },
    })

    return returnsDefaultActionMessage({
      message: 'Manutenção diária atualizada com sucesso',
      success: true,
    })
  })
