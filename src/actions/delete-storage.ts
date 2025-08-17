'use server'

import { prisma } from '@inspetor/lib/prisma'
import { returnsDefaultActionMessage } from '@inspetor/utils/returns-default-action-message'
import z from 'zod'

import { authProcedure } from './procedures/auth'

export const deleteStorageAction = authProcedure
  .createServerAction()
  .input(
    z.object({
      storageId: z.string(),
    }),
  )
  .handler(async ({ input }) => {
    await prisma.storage.delete({
      where: {
        id: input.storageId,
      },
    })

    return returnsDefaultActionMessage({
      message: 'Pasta deletada com sucesso',
      success: true,
    })
  })
