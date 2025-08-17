'use server'

import { prisma } from '@inspetor/lib/prisma'
import { returnsDefaultActionMessage } from '@inspetor/utils/returns-default-action-message'

import { authProcedure } from './procedures/auth'

export const listCompanyAction = authProcedure
  .createServerAction()
  .handler(async () => {
    const companies = await prisma.company.findMany()

    return returnsDefaultActionMessage({
      message: 'Empresas listadas com sucesso',
      success: true,
      companies,
    })
  })
