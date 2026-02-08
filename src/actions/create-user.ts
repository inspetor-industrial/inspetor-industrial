'use server'

import { subject } from '@casl/ability'
import { defineAbilityFor, type Subjects } from '@inspetor/casl/ability'
import type { UserRole } from '@inspetor/generated/prisma/client'
import { prisma } from '@inspetor/lib/prisma'
import type { AuthUser } from '@inspetor/types/auth'
import { hashPassword } from '@inspetor/utils/crypto'
import { returnsDefaultActionMessage } from '@inspetor/utils/returns-default-action-message'
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
  .handler(async ({ input, ctx }) => {
    const ability = defineAbilityFor(ctx.user as AuthUser)
    const scope =
      ctx.user.companyId != null
        ? (subject('User', {
            companyId: ctx.user.companyId,
          }) as unknown as Subjects)
        : 'User'
    if (!ability.can('create', scope)) {
      return returnsDefaultActionMessage({
        message: 'Sem permissão para criar usuário',
        success: false,
      })
    }

    const isAdmin = ctx.user.role === 'ADMIN'
    if (!isAdmin && input.companyId !== (ctx.user.companyId ?? '')) {
      return returnsDefaultActionMessage({
        message: 'Sem permissão para criar usuário em outra empresa',
        success: false,
      })
    }

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
