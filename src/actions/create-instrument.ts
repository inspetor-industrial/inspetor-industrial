'use server'

import { prisma } from '@inspetor/lib/prisma'
import { returnsDefaultActionMessage } from '@inspetor/utils/returns-default-action-message'
import z from 'zod'

import { authProcedure } from './procedures/auth'

export const createInstrumentAction = authProcedure
  .createServerAction()
  .input(
    z.object({
      type: z.string(),
      manufacturer: z.string(),
      serialNumber: z.string(),
      certificateNumber: z.string(),
      validationDate: z.object({
        month: z.string(),
        year: z.string(),
      }),
    }),
  )
  .handler(async ({ input, ctx }) => {
    if (!ctx?.user?.email) {
      return returnsDefaultActionMessage({
        message: 'Usuário não autenticado',
        success: false,
      })
    }

    const instrument = await prisma.instruments.findFirst({
      where: {
        OR: [
          {
            serialNumber: input.serialNumber,
          },
          {
            certificateNumber: input.certificateNumber,
          },
        ],
      },
    })

    if (instrument) {
      return returnsDefaultActionMessage({
        message: 'Instrumento já existe',
        success: false,
      })
    }

    await prisma.instruments.create({
      data: {
        type: input.type,
        manufacturer: input.manufacturer,
        serialNumber: input.serialNumber,
        certificateNumber: input.certificateNumber,
        validationDate: new Date(
          `20${input.validationDate.year?.trim()}-${input.validationDate.month?.trim()}-01`,
        ),
        companyId: ctx.user.organization.id,
      },
    })

    return returnsDefaultActionMessage({
      message: 'Instrumento criado com sucesso',
      success: true,
    })
  })
