'use server'

import { subject } from '@casl/ability'
import { defineAbilityFor, type Subjects } from '@inspetor/casl/ability'
import { UserRole } from '@inspetor/generated/prisma/enums'
import { prisma } from '@inspetor/lib/prisma'
import type { AuthUser } from '@inspetor/types/auth'
import { returnsDefaultActionMessage } from '@inspetor/utils/returns-default-action-message'
import z from 'zod'

import { authProcedure } from './procedures/auth'

export const updateEquipmentAction = authProcedure
  .createServerAction()
  .input(
    z.object({
      equipmentId: z.string(),
      name: z.string(),
      mark: z.string(),
      type: z.string(),
      identificationNumber: z.string(),
      manufactorYear: z.string(),
      category: z.string(),
      pmta: z.string(),
      model: z.string(),
      companyId: z.string().optional(),
      unitIds: z.array(z.string()).optional(),
    }),
  )
  .handler(async ({ input, ctx }) => {
    const organizationId = ctx.user.organization?.id ?? null
    if (ctx.user.role !== UserRole.ADMIN && !organizationId) {
      return returnsDefaultActionMessage({
        message: 'Usuário não possui empresa ou não está autenticado',
        success: false,
      })
    }

    const equipment =
      ctx.user.role === UserRole.ADMIN
        ? await prisma.equipment.findUnique({
            where: { id: input.equipmentId },
          })
        : await prisma.equipment.findFirst({
            where: {
              id: input.equipmentId,
              companyId: organizationId as string,
            },
          })

    if (!equipment) {
      return returnsDefaultActionMessage({
        message: 'Equipamento não encontrado',
        success: false,
      })
    }

    const ability = defineAbilityFor(ctx.user as AuthUser)
    const subjectEquipment = subject('MaintenanceEquipment', {
      companyId: equipment.companyId,
    }) as unknown as Subjects
    if (!ability.can('update', subjectEquipment)) {
      return returnsDefaultActionMessage({
        message: 'Sem permissão para atualizar equipamento',
        success: false,
      })
    }

    const resolvedCompanyId =
      ctx.user.role === UserRole.ADMIN &&
      input.companyId != null &&
      input.companyId !== ''
        ? input.companyId
        : equipment.companyId

    const updateData: Parameters<typeof prisma.equipment.update>[0]['data'] = {
      name: input.name,
      mark: input.mark,
      type: input.type,
      identificationNumber: input.identificationNumber,
      manufactorYear: input.manufactorYear,
      category: input.category,
      pmta: input.pmta,
      model: input.model,
    }
    if (
      ctx.user.role === UserRole.ADMIN &&
      input.companyId &&
      input.companyId !== equipment.companyId
    ) {
      const company = await prisma.company.findUnique({
        where: { id: input.companyId },
      })
      if (!company) {
        return returnsDefaultActionMessage({
          message: 'Empresa não encontrada',
          success: false,
        })
      }
      updateData.companyId = input.companyId
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

    await prisma.equipment.update({
      where: { id: input.equipmentId },
      data: updateData,
    })

    await prisma.equipmentUnit.deleteMany({
      where: { equipmentId: input.equipmentId },
    })
    if (unitIds.length > 0) {
      await prisma.equipmentUnit.createMany({
        data: unitIds.map((unitId: string) => ({
          equipmentId: input.equipmentId,
          unitId,
        })),
      })
    }

    return returnsDefaultActionMessage({
      message: 'Equipamento atualizado com sucesso',
      success: true,
    })
  })
