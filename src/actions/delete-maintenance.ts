'use server'

import { prisma } from '@inspetor/lib/prisma'
import { returnsDefaultActionMessage } from '@inspetor/utils/returns-default-action-message'
import z from 'zod'

import { authProcedure } from './procedures/auth'

export const deleteMaintenanceAction = authProcedure
  .createServerAction()
  .input(
    z.object({
      dailyMaintenanceId: z.string(),
    }),
  )
  .handler(async ({ input }) => {
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
