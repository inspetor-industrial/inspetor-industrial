'use server'

import { prisma } from '@inspetor/lib/prisma'
import { returnsDefaultActionMessage } from '@inspetor/utils/returns-default-action-message'

import { authProcedure } from './procedures/auth'

export const listEquipmentAction = authProcedure
  .createServerAction()
  .handler(async ({ ctx }) => {
    if (!ctx.user.organization.id) {
      return returnsDefaultActionMessage({
        message: 'Usuário não possui empresa ou não está autenticado',
        success: false,
        equipments: [],
      })
    }

    const equipments = await prisma.equipment.findMany({
      where: {
        companyId: ctx.user.organization.id,
      },
    })

    return returnsDefaultActionMessage({
      message: 'Equipamentos listados com sucesso',
      success: true,
      equipments,
    })
  })
