'use server'

import { prisma } from '@inspetor/lib/prisma'
import { returnsDefaultActionMessage } from '@inspetor/utils/returns-default-action-message'
import z from 'zod'

import { authProcedure } from '../../procedures/auth'

export const getLocalInstallationPerformedTestsByBoilerReportIdAction =
  authProcedure
    .createServerAction()
    .input(z.object({ boilerReportId: z.string() }))
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

        const localInstallationPerformedTests =
          await prisma.localInstallationPerformedTests.findUnique({
            where: {
              boilerReportId: input.boilerReportId,
            },
          })

        return returnsDefaultActionMessage({
          message: localInstallationPerformedTests
            ? 'Dados dos testes de instalação local encontrados com sucesso'
            : 'Nenhum dado dos testes de instalação local salvo ainda',
          success: true,
          data: localInstallationPerformedTests,
        })
      } catch {
        return returnsDefaultActionMessage({
          message: 'Erro ao buscar dados dos testes de instalação local',
          success: false,
        })
      }
    })
