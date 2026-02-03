'use server'

import { prisma } from '@inspetor/lib/prisma'
import { returnsDefaultActionMessage } from '@inspetor/utils/returns-default-action-message'
import z from 'zod'

import { authProcedure } from '../../procedures/auth'

export const upsertOperatorAction = authProcedure
  .createServerAction()
  .input(
    z.object({
      boilerReportId: z.string(),
      name: z.string(),
      isAbleToOperateWithNR13: z.string(),
      certificateId: z.string().optional().nullable(),
      provisionsForOperator: z.string().optional().nullable(),
      observations: z.string().optional().nullable(),
    }),
  )
  .handler(async ({ input, ctx }) => {
    try {
      const {
        boilerReportId,
        name,
        isAbleToOperateWithNR13,
        certificateId,
        provisionsForOperator,
        observations,
      } = input

      const boilerReport = await prisma.boilerReport.findUnique({
        where: {
          id: boilerReportId,
          companyId: ctx.user.organization.id,
        },
      })

      if (!boilerReport) {
        return returnsDefaultActionMessage({
          message: 'Relatório de inspeção de caldeira não encontrado',
          success: false,
        })
      }

      let finalCertificateId = certificateId

      if (certificateId) {
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
                  fieldName: 'OPERATOR_CERTIFICATION',
                },
              })

            if (existingAttachmentForDocument) {
              finalCertificateId = existingAttachmentForDocument.id
            } else {
              const newAttachment = await prisma.boilerReportAttachment.create({
                data: {
                  documentId: certificateId,
                  fieldName: 'OPERATOR_CERTIFICATION',
                },
              })
              finalCertificateId = newAttachment.id
            }
          }
        }
      }

      await prisma.operator.upsert({
        where: {
          boilerReportId,
        },
        create: {
          boilerReportId,
          name,
          isAbleToOperateWithNR13,
          certificateId: finalCertificateId,
          provisionsForOperator,
          observations,
        },
        update: {
          name,
          isAbleToOperateWithNR13,
          certificateId: finalCertificateId,
          provisionsForOperator,
          observations,
        },
      })

      return returnsDefaultActionMessage({
        message: 'Dados do operador salvos com sucesso',
        success: true,
      })
    } catch (error) {
      console.log('error', error)
      return returnsDefaultActionMessage({
        message: 'Erro ao salvar dados do operador',
        success: false,
      })
    }
  })
