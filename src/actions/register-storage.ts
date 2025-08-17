'use server'

import { prisma } from '@inspetor/lib/prisma'
import { returnsDefaultActionMessage } from '@inspetor/utils/returns-default-action-message'
import z from 'zod'

import { authProcedure } from './procedures/auth'

export const registerStorageAction = authProcedure
  .createServerAction()
  .input(
    z.object({
      companyId: z.string(),
      relativeLink: z.string(),
    }),
  )
  .handler(async ({ input }) => {
    const storage = await prisma.storage.findFirst({
      where: {
        companyId: input.companyId,
      },
    })

    if (storage) {
      return returnsDefaultActionMessage({
        message: 'A empresa já possui uma pasta registrada',
        success: false,
      })
    }

    const relativeLink = input.relativeLink.replace(
      'https://drive.google.com/drive/folders',
      '',
    )

    await prisma.storage.create({
      data: {
        companyId: input.companyId,
        relativeLink,
      },
    })

    return returnsDefaultActionMessage({
      message: 'Pasta registrada com sucesso',
      success: true,
    })
  })
