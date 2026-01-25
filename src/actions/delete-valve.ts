'use server'

import { prisma } from '@inspetor/lib/prisma'
import { returnsDefaultActionMessage } from '@inspetor/utils/returns-default-action-message'
import z from 'zod'

import { authProcedure } from './procedures/auth'

export const deleteValveAction = authProcedure
  .createServerAction()
  .input(z.object({ valveId: z.string() }))
  .handler(async ({ input, ctx }) => {
    const valve = await prisma.valve.findUnique({
      where: {
        id: input.valveId,
        companyId: ctx.user.organization.id,
      },
    })

    if (!valve) {
      return returnsDefaultActionMessage({
        message: 'Válvula não encontrada',
        success: false,
      })
    }

    await prisma.valve.delete({
      where: {
        id: input.valveId,
        companyId: ctx.user.organization.id,
      },
    })

    return returnsDefaultActionMessage({
      message: 'Válvula deletada com sucesso',
      success: true,
    })
  })
