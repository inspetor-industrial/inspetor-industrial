'use server'

import { prisma } from '@inspetor/lib/prisma'
import { returnsDefaultActionMessage } from '@inspetor/utils/returns-default-action-message'
import z from 'zod'

import { authProcedure } from './procedures/auth'

export const deleteInstrumentAction = authProcedure
  .createServerAction()
  .input(z.object({ instrumentId: z.string() }))
  .handler(async ({ input, ctx }) => {
    const instrument = await prisma.instruments.findUnique({
      where: {
        id: input.instrumentId,
        companyId: ctx.user.organization.id,
      },
    })

    if (!instrument) {
      return returnsDefaultActionMessage({
        message: 'Instrumento não encontrado',
        success: false,
      })
    }

    await prisma.instruments.delete({
      where: {
        id: input.instrumentId,
        companyId: ctx.user.organization.id,
      },
    })

    return returnsDefaultActionMessage({
      message: 'Instrumento deletado com sucesso',
      success: true,
    })
  })
