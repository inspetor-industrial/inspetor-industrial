'use server'

import { prisma } from '@inspetor/lib/prisma'
import { returnsDefaultActionMessage } from '@inspetor/utils/returns-default-action-message'
import z from 'zod'

import { authProcedure } from './procedures/auth'

export const createValveAction = authProcedure
  .createServerAction()
  .input(
    z.object({
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
    if (!ctx?.user?.email) {
      return returnsDefaultActionMessage({
        message: 'Usuário não autenticado',
        success: false,
      })
    }

    const valve = await prisma.valve.findFirst({
      where: {
        serialNumber: input.serialNumber,
      },
    })

    if (valve) {
      return returnsDefaultActionMessage({
        message: 'Válvula já existe com este número de série',
        success: false,
      })
    }

    await prisma.valve.create({
      data: {
        serialNumber: input.serialNumber,
        model: input.model,
        diameter: input.diameter,
        flow: input.flow,
        openingPressure: input.openingPressure,
        closingPressure: input.closingPressure,
        tests: input.tests ?? {},
        companyId: ctx.user.organization.id,
      },
    })

    return returnsDefaultActionMessage({
      message: 'Válvula criada com sucesso',
      success: true,
    })
  })
