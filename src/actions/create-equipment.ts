'use server'

import { subject } from '@casl/ability'
import { defineAbilityFor, type Subjects } from '@inspetor/casl/ability'
import { UserRole } from '@inspetor/generated/prisma/enums'
import { prisma } from '@inspetor/lib/prisma'
import type { AuthUser } from '@inspetor/types/auth'
import { returnsDefaultActionMessage } from '@inspetor/utils/returns-default-action-message'
import z from 'zod'

import { authProcedure } from './procedures/auth'

export const createEquipmentAction = authProcedure
  .createServerAction()
  .input(
    z.object({
      name: z.string(),
      mark: z.string(),
      model: z.string(),
      type: z.string(),
      identificationNumber: z.string(),
      manufactorYear: z.string(),
      category: z.string(),
      pmta: z.string(),
      companyId: z.string().optional(),
      unitIds: z.array(z.string()).optional(),
    }),
  )
  .handler(async ({ input, ctx }) => {
    const organizationId = ctx.user.organization?.id ?? null
    const isAdminWithCompanyInPayload =
      ctx.user.role === UserRole.ADMIN && input.companyId

    if (!organizationId && !isAdminWithCompanyInPayload) {
      return returnsDefaultActionMessage({
        message: 'Usuário não possui empresa ou não está autenticado',
        success: false,
      })
    }

    const ability = defineAbilityFor(ctx.user as AuthUser)
    const resolvedCompanyId =
      ctx.user.role === UserRole.ADMIN && input.companyId
        ? input.companyId
        : organizationId
    const subjectEquipment = subject('MaintenanceEquipment', {
      companyId: resolvedCompanyId,
    }) as unknown as Subjects
    if (!ability.can('create', subjectEquipment)) {
      return returnsDefaultActionMessage({
        message: 'Sem permissão para criar equipamento',
        success: false,
      })
    }

    if (!resolvedCompanyId) {
      return returnsDefaultActionMessage({
        message: 'Empresa é obrigatória para criar equipamento',
        success: false,
      })
    }

    if (ctx.user.role === UserRole.ADMIN && input.companyId) {
      const company = await prisma.company.findUnique({
        where: { id: input.companyId },
      })
      if (!company) {
        return returnsDefaultActionMessage({
          message: 'Empresa não encontrada',
          success: false,
        })
      }
    }

    const unitIds = input.unitIds ?? []
    if (unitIds.length > 0) {
      const unitsInCompany = await prisma.companyUnit.findMany({
        where: {
          companyId: resolvedCompanyId,
          id: { in: unitIds },
        },
        select: { id: true },
      })
      const validIds = new Set(unitsInCompany.map((u) => u.id))
      const invalid = unitIds.filter((id: string) => !validIds.has(id))
      if (invalid.length > 0) {
        return returnsDefaultActionMessage({
          message:
            'Uma ou mais unidades não pertencem à empresa selecionada.',
          success: false,
        })
      }
    }

    const equipment = await prisma.equipment.create({
      data: {
        name: input.name,
        mark: input.mark,
        type: input.type,
        identificationNumber: input.identificationNumber,
        manufactorYear: input.manufactorYear,
        category: input.category,
        pmta: input.pmta,
        model: input.model,
        companyId: resolvedCompanyId,
      },
    })

    if (unitIds.length > 0) {
      await prisma.equipmentUnit.createMany({
        data: unitIds.map((unitId: string) => ({
          equipmentId: equipment.id,
          unitId,
        })),
      })
    }

    return returnsDefaultActionMessage({
      message: 'Equipamento criado com sucesso',
      success: true,
    })
  })
