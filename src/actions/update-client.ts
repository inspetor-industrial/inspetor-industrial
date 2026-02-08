'use server'

import { subject } from '@casl/ability'
import { type Subjects, defineAbilityFor } from '@inspetor/casl/ability'
import { prisma } from '@inspetor/lib/prisma'
import { returnsDefaultActionMessage } from '@inspetor/utils/returns-default-action-message'
import type { AuthUser } from '@inspetor/types/auth'
import z from 'zod'

import { authProcedure } from './procedures/auth'

export const updateClientAction = authProcedure
  .createServerAction()
  .input(
    z.object({
      clientId: z.string(),
      companyName: z.string(),
      taxId: z.string(),
      taxRegistration: z.string(),
      state: z.string(),
      city: z.string(),
      address: z.string(),
      zipCode: z.string(),
      phone: z.string(),
    }),
  )
  .handler(async ({ input, ctx }) => {
    const existing = await prisma.clients.findUnique({
      where: { id: input.clientId },
      select: { id: true, companyId: true },
    })

    if (!existing) {
      return returnsDefaultActionMessage({
        message: 'Cliente não encontrado',
        success: false,
      })
    }

    const ability = defineAbilityFor(ctx.user as AuthUser)
    const subjectClient = subject('Client', {
      companyId: existing.companyId ?? ('' as string),
    }) as unknown as Subjects
    if (!ability.can('update', subjectClient)) {
      return returnsDefaultActionMessage({
        message: 'Sem permissão para editar cliente',
        success: false,
      })
    }

    const client = await prisma.clients.findFirst({
      where: {
        OR: [
          { taxId: input.taxId },
          { taxRegistration: input.taxRegistration },
        ],
        id: {
          not: input.clientId,
        },
      },
    })

    if (client) {
      return returnsDefaultActionMessage({
        message: 'Cliente já existe, com este CNPJ ou CPF',
        success: false,
      })
    }

    await prisma.clients.update({
      where: {
        id: input.clientId,
      },
      data: {
        companyName: input.companyName,
        taxId: input.taxId,
        taxRegistration: input.taxRegistration,
        state: input.state,
        city: input.city,
        address: input.address,
        zipCode: input.zipCode,
        phone: input.phone,
      },
    })

    return returnsDefaultActionMessage({
      message: 'Cliente atualizado com sucesso',
      success: true,
    })
  })
