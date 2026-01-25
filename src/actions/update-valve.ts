'use server'

import { prisma } from '@inspetor/lib/prisma'
import { returnsDefaultActionMessage } from '@inspetor/utils/returns-default-action-message'
import z from 'zod'

import { authProcedure } from './procedures/auth'

export const updateValveAction = authProcedure
  .createServerAction()
  .input(
    z.object({
      valveId: z.string(),
      serialNumber: z.string(),
      model: z.string(),
      diameter: z.string(),
      flow: z.string(),
      openingPressure: z.string(),
      closingPressure: z.string(),
      tests: z.any().optional(),
    }),
  )
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

    await prisma.valve.update({
      where: {
        id: input.valveId,
      },
      data: {
        serialNumber: input.serialNumber,
        model: input.model,
        diameter: input.diameter,
        flow: input.flow,
        openingPressure: input.openingPressure,
        closingPressure: input.closingPressure,
        tests: input.tests ?? {},
      },
    })

    return returnsDefaultActionMessage({
      message: 'Válvula atualizada com sucesso',
      success: true,
    })
  })
