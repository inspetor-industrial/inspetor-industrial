'use server'

import { BoilerReportAttachmentFieldName } from '@inspetor/generated/prisma/enums'
import { prisma } from '@inspetor/lib/prisma'
import { returnsDefaultActionMessage } from '@inspetor/utils/returns-default-action-message'
import z from 'zod'

import { authProcedure } from '../../procedures/auth'

export const getInjectorGaugePhotosAction = authProcedure
  .createServerAction()
  .input(z.object({ boilerReportId: z.string() }))
  .handler(async ({ input, ctx }) => {
    try {
      const boilerReport = await prisma.boilerReport.findUnique({
        where: {
          id: input.boilerReportId,
          companyId: ctx.user.organization.id,
        },
      })

      if (!boilerReport) {
        return returnsDefaultActionMessage({
          message: 'Relatório de inspeção de caldeira não encontrado',
          success: false,
        })
      }

      const injectorGauge = await prisma.injectorGauge.findUnique({
        where: { boilerReportId: input.boilerReportId },
        include: {
          photos: {
            where: {
              fieldName: BoilerReportAttachmentFieldName.INJECTOR_GAUGE_PHOTOS,
            },
            orderBy: { sortOrder: 'asc' },
            include: { document: true },
          },
        },
      })

      const photos = injectorGauge?.photos ?? []

      return returnsDefaultActionMessage({
        message: 'Fotos do injetor carregadas',
        success: true,
        data: photos,
      })
    } catch {
      return returnsDefaultActionMessage({
        message: 'Erro ao buscar fotos do injetor',
        success: false,
      })
    }
  })
