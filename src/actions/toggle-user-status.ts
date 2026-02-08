'use server'

import { subject } from '@casl/ability'
import { defineAbilityFor, type Subjects } from '@inspetor/casl/ability'
import { prisma } from '@inspetor/lib/prisma'
import type { AuthUser } from '@inspetor/types/auth'
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
  .handler(async ({ input, ctx }) => {
    const user = await prisma.user.findUnique({
      where: { id: input.userId },
      select: { id: true, companyId: true },
    })

    if (!user) {
      return returnsDefaultActionMessage({
        message: 'Usuário não encontrado',
        success: false,
      })
    }

    const ability = defineAbilityFor(ctx.user as AuthUser)
    const subjectUser = subject('User', {
      companyId: user.companyId ?? ('' as string),
    }) as unknown as Subjects
    if (!ability.can('update', subjectUser)) {
      return returnsDefaultActionMessage({
        message: 'Sem permissão para alterar status do usuário',
        success: false,
      })
    }

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
