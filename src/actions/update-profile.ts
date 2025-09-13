'use server'

import { prisma } from '@inspetor/lib/prisma'
import { returnsDefaultActionMessage } from '@inspetor/utils/returns-default-action-message'
import z from 'zod'

import { authProcedure } from './procedures/auth'

export const updateProfileAction = authProcedure
  .createServerAction()
  .input(
    z.object({
      userId: z.string(),
      name: z.string(),
      username: z.string(),
      email: z.string(),
    }),
  )
  .handler(async ({ input, ctx }) => {
    if (input.userId !== ctx.user.id) {
      return returnsDefaultActionMessage({
        message: 'Você não pode alterar o perfil de outro usuário',
        success: false,
      })
    }

    const userOnDatabase = await prisma.user.findUnique({
      where: { username: input.username },
    })

    if (userOnDatabase && userOnDatabase.id !== input.userId) {
      return returnsDefaultActionMessage({
        message: 'Usuário já existe, com este nome de usuário',
        success: false,
      })
    }

    const userOnDatabaseByEmail = await prisma.user.findUnique({
      where: { email: input.email },
    })

    if (userOnDatabaseByEmail && userOnDatabaseByEmail.id !== input.userId) {
      return returnsDefaultActionMessage({
        message: 'Usuário já existe, com este e-mail',
        success: false,
      })
    }

    await prisma.user.update({
      where: { id: input.userId },
      data: { name: input.name, username: input.username, email: input.email },
    })

    return returnsDefaultActionMessage({
      message: 'Perfil atualizado com sucesso',
      success: true,
    })
  })
