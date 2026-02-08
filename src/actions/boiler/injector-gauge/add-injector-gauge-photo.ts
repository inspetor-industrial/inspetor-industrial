'use server'

import { BoilerReportAttachmentFieldName } from '@inspetor/generated/prisma/enums'
import { prisma } from '@inspetor/lib/prisma'
import { returnsDefaultActionMessage } from '@inspetor/utils/returns-default-action-message'
import z from 'zod'

import { authProcedure } from '../../procedures/auth'

export const addInjectorGaugePhotoAction = authProcedure
  .createServerAction()
  .input(
    z.object({
      boilerReportId: z.string(),
      documentId: z.string(),
    }),
  )
  .handler(async ({ input, ctx }) => {
    try {
      const organizationId = ctx.user.organization?.id
      if (!organizationId) {
        return returnsDefaultActionMessage({
          message: 'Organização não encontrada',
          success: false,
        })
      }

      const boilerReport = await prisma.boilerReport.findUnique({
        where: {
          id: input.boilerReportId,
          companyId: organizationId,
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
          },
        },
      })

      if (!injectorGauge) {
        return returnsDefaultActionMessage({
          message: 'Salve os dados do injetor antes de adicionar fotos',
          success: false,
        })
      }

      const document = await prisma.documents.findUnique({
        where: { id: input.documentId },
      })

      if (!document) {
        return returnsDefaultActionMessage({
          message: 'Documento não encontrado',
          success: false,
        })
      }

      const maxSortOrder = injectorGauge.photos.reduce(
        (max, p) => Math.max(max, p.sortOrder ?? 0),
        0,
      )

      await prisma.boilerReportAttachment.create({
        data: {
          documentId: input.documentId,
          fieldName: BoilerReportAttachmentFieldName.INJECTOR_GAUGE_PHOTOS,
          injectorGaugeId: injectorGauge.id,
          sortOrder: maxSortOrder + 1,
        },
      })

      return returnsDefaultActionMessage({
        message: 'Foto adicionada com sucesso',
        success: true,
      })
    } catch (error) {
      return returnsDefaultActionMessage({
        message:
          'Erro ao adicionar foto, ' +
          (error instanceof Error ? error.message : String(error)),
        success: false,
      })
    }
  })
