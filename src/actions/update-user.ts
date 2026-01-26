'use server'

import { prisma } from '@inspetor/lib/prisma'
import { returnsDefaultActionMessage } from '@inspetor/utils/returns-default-action-message'
import type { UserRole } from '@inspetor/generated/prisma/client'
import z from 'zod'

import { authProcedure } from './procedures/auth'

export const updateUserAction = authProcedure
  .createServerAction()
  .input(
    z.object({
      userId: z.string(),
      name: z.string(),
      username: z.string(),
      email: z.string(),
      companyId: z.string(),
      role: z.string(),
    }),
  )
  .handler(async ({ input }) => {
    const user = await prisma.user.findUnique({
      where: {
        email: input.email,
      },
    })

    if (user && user.id !== input.userId) {
      return returnsDefaultActionMessage({
        message:
          'Usuário já existe, com este email. Por favor, use outro email.',
        success: false,
      })
    }

    const userByUsername = await prisma.user.findUnique({
      where: {
        username: input.username,
      },
    })

    if (userByUsername && userByUsername.id !== input.userId) {
      return returnsDefaultActionMessage({
        message:
          'Usuário já existe, com este nome de usuário. Por favor, use outro nome de usuário.',
        success: false,
      })
    }

    await prisma.user.update({
      where: {
        id: input.userId,
      },
      data: {
        name: input.name,
        username: input.username,
        email: input.email,
        companyId: input.companyId,
        role: input.role.toUpperCase() as UserRole,
      },
    })

    return returnsDefaultActionMessage({
      message: 'Usuário atualizado com sucesso',
      success: true,
    })
  })
