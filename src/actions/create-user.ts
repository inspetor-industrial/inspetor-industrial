'use server'

import { prisma } from '@inspetor/lib/prisma'
import { hashPassword } from '@inspetor/utils/crypto'
import { returnsDefaultActionMessage } from '@inspetor/utils/returns-default-action-message'
import type { UserRole } from '@inspetor/generated/prisma/client'
import z from 'zod'

import { authProcedure } from './procedures/auth'
import { getUserByUsernameOrEmail } from './utils/get-user-by-username-or-email'

export const createUserAction = authProcedure
  .createServerAction()
  .input(
    z.object({
      name: z.string(),
      username: z.string(),
      email: z.string(),
      password: z.string(),
      companyId: z.string(),
      role: z.string(),
    }),
  )
  .handler(async ({ input }) => {
    const { name, username, email, password, companyId } = input

    const user = await getUserByUsernameOrEmail({
      email,
      username,
    })

    if (user) {
      return returnsDefaultActionMessage({
        message: 'Usuário já existe',
        success: false,
      })
    }

    const hashedPassword = await hashPassword(password)
    await prisma.user.create({
      data: {
        name,
        username,
        email,
        password: hashedPassword,
        companyId,
        role: input.role.toUpperCase() as UserRole,
      },
    })

    return returnsDefaultActionMessage({
      message: 'Usuário criado com sucesso',
      success: true,
    })
  })
