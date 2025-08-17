'use server'

import { prisma } from '@inspetor/lib/prisma'
import { returnsDefaultActionMessage } from '@inspetor/utils/returns-default-action-message'
import z from 'zod'

import { authProcedure } from './procedures/auth'

export const updateStorageAction = authProcedure
  .createServerAction()
  .input(
    z.object({
      storageId: z.string(),
      companyId: z.string(),
      relativeLink: z.string(),
    }),
  )
  .handler(async ({ input }) => {
    const relativeLink = input.relativeLink.replace(
      'https://drive.google.com/drive/folders',
      '',
    )

    await prisma.storage.update({
      where: {
        id: input.storageId,
      },
      data: {
        companyId: input.companyId,
        relativeLink,
      },
    })

    return returnsDefaultActionMessage({
      message: 'Pasta atualizada com sucesso',
      success: true,
    })
  })
