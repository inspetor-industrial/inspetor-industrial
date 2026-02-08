'use server'

import { subject } from '@casl/ability'
import { type Subjects, defineAbilityFor } from '@inspetor/casl/ability'
import { prisma } from '@inspetor/lib/prisma'
import { returnsDefaultActionMessage } from '@inspetor/utils/returns-default-action-message'
import type { AuthUser } from '@inspetor/types/auth'
import { z } from 'zod'

import { authProcedure } from './procedures/auth'

export const createClientAction = authProcedure
  .createServerAction()
  .input(
    z.object({
      companyName: z.string(),
      taxId: z.string(),
      taxRegistration: z.string(),
      state: z.string(),
      city: z.string(),
      address: z.string(),
      zipCode: z.string(),
      phone: z.string(),
      companyId: z.string().optional(),
    }),
  )
  .handler(async ({ input, ctx }) => {
    const ability = defineAbilityFor(ctx.user as AuthUser)
    const scope =
      ctx.user.companyId != null
        ? (subject('Client', {
            companyId: ctx.user.companyId,
          }) as unknown as Subjects)
        : 'Client'
    if (!ability.can('create', scope)) {
      return returnsDefaultActionMessage({
        message: 'Sem permissão para criar cliente',
        success: false,
      })
    }

    const isAdmin = ctx.user.role === 'ADMIN'
    const companyId =
      isAdmin && input.companyId
        ? input.companyId
        : ctx.user.companyId ?? undefined

    const client = await prisma.clients.findFirst({
      where: {
        OR: [
          { taxId: input.taxId },
          { taxRegistration: input.taxRegistration },
        ],
        ...(companyId ? { companyId } : {}),
      },
      select: {
        id: true,
      },
    })

    if (client) {
      return returnsDefaultActionMessage({
        message: 'Cliente já existe',
        success: false,
      })
    }

    await prisma.clients.create({
      data: {
        companyName: input.companyName,
        taxId: input.taxId,
        taxRegistration: input.taxRegistration,
        state: input.state,
        city: input.city,
        address: input.address,
        zipCode: input.zipCode,
        phone: input.phone,
        companyId,
      },
    })

    return returnsDefaultActionMessage({
      message: 'Cliente criado com sucesso',
      success: true,
    })
  })
