'use server'

import { prisma } from '@inspetor/lib/prisma'
import { returnsDefaultActionMessage } from '@inspetor/utils/returns-default-action-message'
import z from 'zod'

import { authProcedure } from './procedures/auth'

export const registerMaintenanceAction = authProcedure
  .createServerAction()
  .input(
    z.object({
      equipmentId: z.string(),
      operatorName: z.string(),
      description: z.string(),
    }),
  )
  .handler(async ({ input, ctx }) => {
    if (!ctx.user.email) {
      return returnsDefaultActionMessage({
        message: 'Usuário não autenticado',
        success: false,
      })
    }

    const company = await prisma.company.findFirst({
      where: {
        users: {
          some: {
            email: ctx.user.email,
          },
        },
      },
    })

    if (!company) {
      return returnsDefaultActionMessage({
        message: 'Usuário não possui empresa',
        success: false,
      })
    }

    await prisma.dailyMaintenance.create({
      data: {
        companyId: company?.id,
        equipmentId: input.equipmentId,
        operatorName: input.operatorName,
        description: input.description,
      },
    })

    return returnsDefaultActionMessage({
      message: 'Manutenção registrada com sucesso',
      success: true,
    })
  })
