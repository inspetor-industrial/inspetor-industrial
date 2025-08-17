'use server'

import { prisma } from '@inspetor/lib/prisma'
import { returnsDefaultActionMessage } from '@inspetor/utils/returns-default-action-message'
import z from 'zod'

import { authProcedure } from './procedures/auth'

export const toggleUserStatusAction = authProcedure
  .createServerAction()
  .input(
    z.object({
      userId: z.string(),
      status: z.enum(['ACTIVE', 'INACTIVE']),
    }),
  )
  .handler(async ({ input }) => {
    await prisma.user.update({
      where: {
        id: input.userId,
      },
      data: {
        status: input.status,
      },
    })

    return returnsDefaultActionMessage({
      message: 'Status do usuário atualizado com sucesso',
      success: true,
    })
  })
