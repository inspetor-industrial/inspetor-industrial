'use server'

import { prisma } from '@inspetor/lib/prisma'
import { returnsDefaultActionMessage } from '@inspetor/utils/returns-default-action-message'
import z from 'zod'

import { authProcedure } from './procedures/auth'

export const createBombAction = authProcedure
  .createServerAction()
  .input(
    z.object({
      mark: z.string(),
      model: z.string(),
      stages: z.string(),
      potency: z.string(),
      photoId: z.string(),
    }),
  )
  .handler(async ({ input, ctx }) => {
    if (!ctx?.user?.email) {
      return returnsDefaultActionMessage({
        message: 'Usuário não autenticado',
        success: false,
      })
    }

    const photo = await prisma.documents.findUnique({
      where: {
        id: input.photoId,
        companyId: ctx.user.organization.id,
      },
    })

    if (!photo) {
      return returnsDefaultActionMessage({
        message: 'Foto não encontrada',
        success: false,
      })
    }

    await prisma.bomb.create({
      data: {
        mark: input.mark,
        model: input.model,
        stages: input.stages,
        potency: input.potency,
        photoId: input.photoId,
        companyId: ctx.user.organization.id,
      },
    })

    return returnsDefaultActionMessage({
      message: 'Bomba criada com sucesso',
      success: true,
    })
  })
