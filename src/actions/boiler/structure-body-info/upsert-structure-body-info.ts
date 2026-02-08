'use server'

import { BoilerReportAttachmentFieldName } from '@inspetor/generated/prisma/enums'
import { prisma } from '@inspetor/lib/prisma'
import { returnsDefaultActionMessage } from '@inspetor/utils/returns-default-action-message'
import z from 'zod'

import { authProcedure } from '../../procedures/auth'

export const upsertStructureBodyInfoAction = authProcedure
  .createServerAction()
  .input(
    z.object({
      boilerReportId: z.string(),
      thickness: z.string(),
      diameter: z.string(),
      length: z.string(),
      material: z.string(),
      certificateId: z.string().optional().nullable(),
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
        thickness,
        diameter,
        length,
        material,
        certificateId,
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
                  fieldName: BoilerReportAttachmentFieldName.STRUCTURE_BODY_CERTIFICATE,
                },
              })

            if (existingAttachmentForDocument) {
              finalCertificateId = existingAttachmentForDocument.id
            } else {
              const newAttachment = await prisma.boilerReportAttachment.create({
                data: {
                  documentId: certificateId,
                  fieldName: BoilerReportAttachmentFieldName.STRUCTURE_BODY_CERTIFICATE,
                },
              })
              finalCertificateId = newAttachment.id
            }
          }
        }
      }

      await prisma.structureBodyInfo.upsert({
        where: {
          boilerReportId,
        },
        create: {
          boilerReportId,
          thickness,
          diameter,
          length,
          material: material as 'ASTMA285GRC' | 'ASTMA516' | 'NOT_SPECIFIED',
          certificateId: finalCertificateId,
        },
        update: {
          thickness,
          diameter,
          length,
          material: material as 'ASTMA285GRC' | 'ASTMA516' | 'NOT_SPECIFIED',
          certificateId: finalCertificateId,
        },
      })

      return returnsDefaultActionMessage({
        message: 'Informações da estrutura do corpo salvas com sucesso',
        success: true,
      })
    } catch (error) {
      console.log('error', error)
      return returnsDefaultActionMessage({
        message:
          'Erro ao salvar informações da estrutura do corpo, ' +
          (error instanceof Error ? error.message : String(error)),
        success: false,
      })
    }
  })
