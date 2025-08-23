'use server'

import { prisma } from '@inspetor/lib/prisma'
import { returnsDefaultActionMessage } from '@inspetor/utils/returns-default-action-message'
import { z } from 'zod'

import { authProcedure } from './procedures/auth'

export const createClientAction = authProcedure
  .createServerAction()
  .input(
    z.object({
      companyName: z.string(),
      taxId: z.string(),
      taxRegistration: z.string(),
      state: z.string(),
      city: z.string(),
      address: z.string(),
      zipCode: z.string(),
      phone: z.string(),
    }),
  )
  .handler(async ({ input }) => {
    const client = await prisma.clients.findFirst({
      where: {
        OR: [
          { taxId: input.taxId },
          { taxRegistration: input.taxRegistration },
        ],
      },
      select: {
        id: true,
      },
    })

    if (client) {
      return returnsDefaultActionMessage({
        message: 'Cliente já existe',
        success: false,
      })
    }

    await prisma.clients.create({
      data: {
        companyName: input.companyName,
        taxId: input.taxId,
        taxRegistration: input.taxRegistration,
        state: input.state,
        city: input.city,
        address: input.address,
        zipCode: input.zipCode,
        phone: input.phone,
      },
    })

    return returnsDefaultActionMessage({
      message: 'Cliente criado com sucesso',
      success: true,
    })
  })
