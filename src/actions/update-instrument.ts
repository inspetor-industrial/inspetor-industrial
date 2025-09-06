'use server'

import { prisma } from '@inspetor/lib/prisma'
import { returnsDefaultActionMessage } from '@inspetor/utils/returns-default-action-message'
import z from 'zod'

import { authProcedure } from './procedures/auth'

export const updateInstrumentAction = authProcedure
  .createServerAction()
  .input(
    z.object({
      instrumentId: z.string(),
      type: z.string(),
      manufacturer: z.string(),
      serialNumber: z.string(),
      certificateNumber: z.string(),
      validationDate: z.object({ month: z.string(), year: z.string() }),
    }),
  )
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

    await prisma.instruments.update({
      where: {
        id: input.instrumentId,
      },
      data: {
        type: input.type,
        manufacturer: input.manufacturer,
        serialNumber: input.serialNumber,
        certificateNumber: input.certificateNumber,
        validationDate: new Date(
          `20${input.validationDate.year?.trim()}-${input.validationDate.month?.trim()}-01`,
        ),
      },
    })

    return returnsDefaultActionMessage({
      message: 'Instrumento atualizado com sucesso',
      success: true,
    })
  })
