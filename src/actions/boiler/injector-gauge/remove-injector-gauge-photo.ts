'use server'

import { BoilerReportAttachmentFieldName } from '@inspetor/generated/prisma/enums'
import { prisma } from '@inspetor/lib/prisma'
import { returnsDefaultActionMessage } from '@inspetor/utils/returns-default-action-message'
import z from 'zod'

import { authProcedure } from '../../procedures/auth'

export const removeInjectorGaugePhotoAction = authProcedure
  .createServerAction()
  .input(z.object({ attachmentId: z.string() }))
  .handler(async ({ input, ctx }) => {
    try {
      const organizationId = ctx.user.organization?.id
      if (!organizationId) {
        return returnsDefaultActionMessage({
          message: 'Organização não encontrada',
          success: false,
        })
      }

      const attachment = await prisma.boilerReportAttachment.findUnique({
        where: { id: input.attachmentId },
        include: {
          injectorGauge: {
            include: {
              boilerReport: true,
            },
          },
        },
      })

      if (!attachment) {
        return returnsDefaultActionMessage({
          message: 'Anexo não encontrado',
          success: false,
        })
      }

      if (
        attachment.fieldName !==
          BoilerReportAttachmentFieldName.INJECTOR_GAUGE_PHOTOS ||
        !attachment.injectorGauge
      ) {
        return returnsDefaultActionMessage({
          message: 'Anexo inválido',
          success: false,
        })
      }

      if (attachment.injectorGauge.boilerReport.companyId !== organizationId) {
        return returnsDefaultActionMessage({
          message: 'Sem permissão para remover esta foto',
          success: false,
        })
      }

      await prisma.boilerReportAttachment.delete({
        where: { id: input.attachmentId },
      })

      return returnsDefaultActionMessage({
        message: 'Foto removida com sucesso',
        success: true,
      })
    } catch (error) {
      return returnsDefaultActionMessage({
        message:
          'Erro ao remover foto, ' +
          (error instanceof Error ? error.message : String(error)),
        success: false,
      })
    }
  })
