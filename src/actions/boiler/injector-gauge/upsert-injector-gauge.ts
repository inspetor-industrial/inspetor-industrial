'use server'

import { BoilerReportAttachmentFieldName } from '@inspetor/generated/prisma/enums'
import { InjectorGaugeFuel } from '@inspetor/generated/prisma/enums'
import { prisma } from '@inspetor/lib/prisma'
import { returnsDefaultActionMessage } from '@inspetor/utils/returns-default-action-message'
import z from 'zod'

import { authProcedure } from '../../procedures/auth'

const testsSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string(),
      answer: z.enum(['yes', 'no']).or(z.literal('')),
    }),
  ),
  nrs: z.array(
    z.object({
      parent: z.string(),
      parentSelected: z.boolean(),
      children: z.array(
        z.object({
          selected: z.boolean(),
          text: z.string(),
        }),
      ),
    }),
  ),
})

export const upsertInjectorGaugeAction = authProcedure
  .createServerAction()
  .input(
    z.object({
      boilerReportId: z.string(),
      tests: testsSchema,
      observations: z.string().optional().nullable(),
      fuelType: z.nativeEnum(InjectorGaugeFuel),
      mark: z.string(),
      diameter: z.string(),
      serialNumber: z.string(),
      photoDocumentId: z.string().optional().nullable(),
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

      const injectorGauge = await prisma.injectorGauge.upsert({
        where: {
          boilerReportId: input.boilerReportId,
        },
        create: {
          boilerReportId: input.boilerReportId,
          tests: input.tests as object,
          observations: input.observations ?? null,
          fuelType: input.fuelType,
          mark: input.mark,
          diameter: input.diameter,
          serialNumber: input.serialNumber,
        },
        update: {
          tests: input.tests as object,
          observations: input.observations ?? null,
          fuelType: input.fuelType,
          mark: input.mark,
          diameter: input.diameter,
          serialNumber: input.serialNumber,
        },
      })

      const existingPhotos = await prisma.boilerReportAttachment.findMany({
        where: {
          injectorGaugeId: injectorGauge.id,
          fieldName: BoilerReportAttachmentFieldName.INJECTOR_GAUGE_PHOTOS,
        },
      })

      for (const attachment of existingPhotos) {
        await prisma.boilerReportAttachment.delete({
          where: { id: attachment.id },
        })
      }

      if (
        input.photoDocumentId &&
        input.photoDocumentId.trim() !== ''
      ) {
        const document = await prisma.documents.findUnique({
          where: { id: input.photoDocumentId },
        })
        if (document) {
          await prisma.boilerReportAttachment.create({
            data: {
              documentId: input.photoDocumentId,
              fieldName: BoilerReportAttachmentFieldName.INJECTOR_GAUGE_PHOTOS,
              injectorGaugeId: injectorGauge.id,
              sortOrder: 1,
            },
          })
        }
      }

      return returnsDefaultActionMessage({
        message: 'Dados do injetor salvos com sucesso',
        success: true,
      })
    } catch (error) {
      return returnsDefaultActionMessage({
        message:
          'Erro ao salvar dados do injetor, ' +
          (error instanceof Error ? error.message : String(error)),
        success: false,
      })
    }
  })
