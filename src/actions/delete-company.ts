'use server'

import { prisma } from '@inspetor/lib/prisma'
import { returnsDefaultActionMessage } from '@inspetor/utils/returns-default-action-message'
import z from 'zod'

import { authProcedure } from './procedures/auth'

export const deleteCompanyAction = authProcedure
  .createServerAction()
  .input(
    z.object({
      companyId: z.string(),
    }),
  )
  .handler(async ({ input }) => {
    await prisma.company.delete({
      where: {
        id: input.companyId,
      },
    })

    return returnsDefaultActionMessage({
      message: 'Empresa deletada com sucesso',
      success: true,
    })
  })
