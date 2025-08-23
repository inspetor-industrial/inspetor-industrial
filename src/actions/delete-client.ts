'use server'

import { prisma } from '@inspetor/lib/prisma'
import { returnsDefaultActionMessage } from '@inspetor/utils/returns-default-action-message'
import z from 'zod'

import { authProcedure } from './procedures/auth'

export const deleteClientAction = authProcedure
  .createServerAction()
  .input(z.object({ clientId: z.string() }))
  .handler(async ({ input }) => {
    await prisma.clients.delete({
      where: {
        id: input.clientId,
      },
    })

    return returnsDefaultActionMessage({
      message: 'Cliente deletado com sucesso',
      success: true,
    })
  })
