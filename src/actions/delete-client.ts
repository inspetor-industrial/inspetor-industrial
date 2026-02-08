'use server'

import { subject } from '@casl/ability'
import { defineAbilityFor, type Subjects } from '@inspetor/casl/ability'
import { prisma } from '@inspetor/lib/prisma'
import type { AuthUser } from '@inspetor/types/auth'
import { returnsDefaultActionMessage } from '@inspetor/utils/returns-default-action-message'
import z from 'zod'

import { authProcedure } from './procedures/auth'

export const deleteClientAction = authProcedure
  .createServerAction()
  .input(z.object({ clientId: z.string() }))
  .handler(async ({ input, ctx }) => {
    const client = await prisma.clients.findUnique({
      where: { id: input.clientId },
      select: { id: true, companyId: true },
    })

    if (!client) {
      return returnsDefaultActionMessage({
        message: 'Cliente não encontrado',
        success: false,
      })
    }

    const ability = defineAbilityFor(ctx.user as AuthUser)
    const subjectClient = subject('Client', {
      companyId: client.companyId ?? ('' as string),
    }) as unknown as Subjects
    if (!ability.can('delete', subjectClient)) {
      return returnsDefaultActionMessage({
        message: 'Sem permissão para excluir cliente',
        success: false,
      })
    }

    const boilerReportCount = await prisma.boilerReport.count({
      where: { clientId: input.clientId },
    })

    if (boilerReportCount > 0) {
      return returnsDefaultActionMessage({
        message:
          'Não é possível excluir este cliente pois existem relatórios de inspeção de caldeira vinculados a ele.',
        success: false,
        conflict: true,
      })
    }

    await prisma.clients.delete({
      where: {
        id: input.clientId,
      },
    })

    return returnsDefaultActionMessage({
      message: 'Cliente deletado com sucesso',
      success: true,
    })
  })
