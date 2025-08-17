'use server'

import { prisma } from '@inspetor/lib/prisma'
import { returnsDefaultActionMessage } from '@inspetor/utils/returns-default-action-message'
import type { UserRole } from '@prisma/client'
import z from 'zod'

import { authProcedure } from './procedures/auth'

export const updateUserAction = authProcedure
  .createServerAction()
  .input(
    z.object({
      userId: z.string(),
      name: z.string(),
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

    await prisma.user.update({
      where: {
        id: input.userId,
      },
      data: {
        name: input.name,
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
