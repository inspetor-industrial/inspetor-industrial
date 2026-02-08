'use server'

import { BoilerReportAttachmentFieldName } from '@inspetor/generated/prisma/enums'
import { prisma } from '@inspetor/lib/prisma'
import { returnsDefaultActionMessage } from '@inspetor/utils/returns-default-action-message'
import z from 'zod'

import { authProcedure } from '../../procedures/auth'

export const upsertStructureTubeInfoAction = authProcedure
  .createServerAction()
  .input(
    z.object({
      boilerReportId: z.string(),
      length: z.string(),
      diameter: z.string(),
      thickness: z.string(),
      material: z.string(),
      certificateId: z.string().optional().nullable(),
      isNaturalOrForced: z.string(),
      quantityOfSafetyFuse: z.string(),
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

      const {
        boilerReportId,
        length,
        diameter,
        thickness,
        material,
        certificateId,
        isNaturalOrForced,
        quantityOfSafetyFuse,
      } = input

      const boilerReport = await prisma.boilerReport.findUnique({
        where: {
          id: boilerReportId,
          companyId: organizationId,
        },
      })

      if (!boilerReport) {
        return returnsDefaultActionMessage({
          message: 'Relatório de inspeção de caldeira não encontrado',
          success: false,
        })
      }

      let finalCertificateId = certificateId ?? null

      if (certificateId && certificateId.trim() !== '') {
        const existingAttachment =
          await prisma.boilerReportAttachment.findUnique({
            where: { id: certificateId },
          })

        if (existingAttachment) {
          finalCertificateId = certificateId
        } else {
          const document = await prisma.documents.findUnique({
            where: { id: certificateId },
          })

          if (document) {
            const existingAttachmentForDocument =
              await prisma.boilerReportAttachment.findFirst({
                where: {
                  documentId: certificateId,
                  fieldName: BoilerReportAttachmentFieldName.STRUCTURE_TUBE_CERTIFICATE,
                },
              })

            if (existingAttachmentForDocument) {
              finalCertificateId = existingAttachmentForDocument.id
            } else {
              const newAttachment = await prisma.boilerReportAttachment.create({
                data: {
                  documentId: certificateId,
                  fieldName: BoilerReportAttachmentFieldName.STRUCTURE_TUBE_CERTIFICATE,
                },
              })
              finalCertificateId = newAttachment.id
            }
          }
        }
      }

      await prisma.structureTubeInfo.upsert({
        where: {
          boilerReportId,
        },
        create: {
          boilerReportId,
          length,
          diameter,
          thickness,
          material: material as 'ASTMA178' | 'NOT_SPECIFIED',
          certificateId: finalCertificateId,
          isNaturalOrForced,
          quantityOfSafetyFuse,
        },
        update: {
          length,
          diameter,
          thickness,
          material: material as 'ASTMA178' | 'NOT_SPECIFIED',
          certificateId: finalCertificateId,
          isNaturalOrForced,
          quantityOfSafetyFuse,
        },
      })

      return returnsDefaultActionMessage({
        message: 'Informações da estrutura dos tubos salvas com sucesso',
        success: true,
      })
    } catch (error) {
      return returnsDefaultActionMessage({
        message:
          'Erro ao salvar informações da estrutura dos tubos, ' +
          (error instanceof Error ? error.message : String(error)),
        success: false,
      })
    }
  })
