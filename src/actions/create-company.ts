'use server'

import { randomUUID } from 'node:crypto'

import { defineAbilityFor } from '@inspetor/casl/ability'
import { prisma } from '@inspetor/lib/prisma'
import type { AuthUser } from '@inspetor/types/auth'
import { returnsDefaultActionMessage } from '@inspetor/utils/returns-default-action-message'
import z from 'zod'

import { authProcedure } from './procedures/auth'

export const createCompanyAction = authProcedure
  .createServerAction()
  .input(
    z.object({
      name: z.string(),
      cnpj: z.string().optional(),
    }),
  )
  .handler(async ({ input, ctx }) => {
    const ability = defineAbilityFor(ctx.user as AuthUser)
    if (!ability.can('create', 'Company')) {
      return returnsDefaultActionMessage({
        message: 'Sem permissão para criar empresa',
        success: false,
      })
    }

    const trimmedCnpj = input.cnpj?.trim() ?? ''
    const cnpj = trimmedCnpj !== '' ? trimmedCnpj : `__pending_${randomUUID()}`
    await prisma.company.create({
      data: {
        name: input.name,
        cnpj,
      },
    })

    return returnsDefaultActionMessage({
      message: 'Empresa criada com sucesso',
      success: true,
    })
  })
