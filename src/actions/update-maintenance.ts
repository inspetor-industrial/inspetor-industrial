'use server'

import { prisma } from '@inspetor/lib/prisma'
import { returnsDefaultActionMessage } from '@inspetor/utils/returns-default-action-message'
import z from 'zod'

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
  .handler(async ({ input }) => {
    await prisma.dailyMaintenance.update({
      where: {
        id: input.dailyMaintenanceId,
      },
      data: {
        equipment: input.equipment,
        operatorName: input.operatorName,
        description: input.description,
      },
    })

    return returnsDefaultActionMessage({
      message: 'Manutenção diária atualizada com sucesso',
      success: true,
    })
  })
