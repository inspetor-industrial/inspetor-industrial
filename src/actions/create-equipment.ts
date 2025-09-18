'use server'

import { prisma } from '@inspetor/lib/prisma'
import { returnsDefaultActionMessage } from '@inspetor/utils/returns-default-action-message'
import z from 'zod'

import { authProcedure } from './procedures/auth'

export const createEquipmentAction = authProcedure
  .createServerAction()
  .input(
    z.object({
      name: z.string(),
      mark: z.string(),
      model: z.string(),
      type: z.string(),
      identificationNumber: z.string(),
      manufactorYear: z.string(),
      category: z.string(),
      pmta: z.string(),
    }),
  )
  .handler(async ({ input, ctx }) => {
    if (!ctx.user.organization.id) {
      return returnsDefaultActionMessage({
        message: 'Usuário não possui empresa ou não está autenticado',
        success: false,
      })
    }

    await prisma.equipment.create({
      data: {
        name: input.name,
        mark: input.mark,
        type: input.type,
        identificationNumber: input.identificationNumber,
        manufactorYear: input.manufactorYear,
        category: input.category,
        pmta: input.pmta,
        model: input.model,
        companyId: ctx.user.organization.id,
      },
    })

    return returnsDefaultActionMessage({
      message: 'Equipamento criado com sucesso',
      success: true,
    })
  })
