'use server'

import { UserResponsibility } from '@inspetor/generated/prisma/enums'
import { prisma } from '@inspetor/lib/prisma'
import z from 'zod'

import { authProcedure } from '../procedures/auth'

export const getClientsAndEngineersForBoilerAction = authProcedure
  .createServerAction()
  .input(z.object({ companyId: z.string().optional() }))
  .handler(async ({ input, ctx }) => {
    const isAdmin = ctx.user.role === 'ADMIN'
    const resolvedCompanyId =
      isAdmin && input.companyId
        ? input.companyId
        : (ctx.user.organization?.id ?? undefined)

    if (!resolvedCompanyId) {
      return { clients: [], engineers: [] }
    }

    const [clients, engineers] = await Promise.all([
      prisma.clients.findMany({
        where: { companyId: resolvedCompanyId },
        orderBy: { companyName: 'asc' },
      }),
      prisma.user.findMany({
        where: {
          companyId: resolvedCompanyId,
          responsibility: UserResponsibility.ENGINEER,
        },
        select: {
          id: true,
          name: true,
          username: true,
        },
        orderBy: { name: 'asc' },
      }),
    ])

    return {
      clients,
      engineers: engineers as Array<{
        id: string
        name: string | null
        username: string | null
      }>,
    }
  })
