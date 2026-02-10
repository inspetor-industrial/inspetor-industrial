'use server'

import { subject } from '@casl/ability'
import { defineAbilityFor, type Subjects } from '@inspetor/casl/ability'
import { prisma } from '@inspetor/lib/prisma'
import type { AuthUser } from '@inspetor/types/auth'
import { returnsDefaultActionMessage } from '@inspetor/utils/returns-default-action-message'
import z from 'zod'

import { authProcedure } from '../procedures/auth'

export const setUserUnitAccessAction = authProcedure
  .createServerAction()
  .input(
    z
      .object({
        userId: z.string(),
        companyId: z.string(),
        scope: z.enum(['all', 'restricted']),
        allowedUnitIds: z.array(z.string()),
        defaultUnitId: z.string().nullable().optional(),
      })
      .refine(
        (data) => {
          if (data.scope === 'all') return data.allowedUnitIds.length === 0
          return data.allowedUnitIds.length >= 1
        },
        {
          message:
            'Escopo restrito exige ao menos uma unidade; escopo "todas" exige lista vazia.',
          path: ['allowedUnitIds'],
        },
      ),
  )
  .handler(async ({ input, ctx }) => {
    const existingUser = await prisma.user.findUnique({
      where: { id: input.userId },
      select: { id: true, companyId: true },
    })

    if (!existingUser) {
      return returnsDefaultActionMessage({
        message: 'Usuário não encontrado',
        success: false,
      })
    }

    const ability = defineAbilityFor(ctx.user as AuthUser)
    const subjectUser = subject('User', {
      companyId: existingUser.companyId ?? '',
    }) as unknown as Subjects
    if (!ability.can('update', subjectUser)) {
      return returnsDefaultActionMessage({
        message: 'Sem permissão para alterar acesso do usuário',
        success: false,
      })
    }

    if (input.scope === 'restricted') {
      const unitsInCompany = await prisma.companyUnit.findMany({
        where: {
          companyId: input.companyId,
          id: { in: input.allowedUnitIds },
        },
        select: { id: true },
      })
      const validIds = new Set(unitsInCompany.map((u) => u.id))
      if (input.allowedUnitIds.some((id: string) => !validIds.has(id))) {
        return returnsDefaultActionMessage({
          message: 'Uma ou mais unidades não pertencem à empresa informada.',
          success: false,
        })
      }
      if (
        input.defaultUnitId != null &&
        input.defaultUnitId !== '' &&
        !validIds.has(input.defaultUnitId)
      ) {
        return returnsDefaultActionMessage({
          message: 'Unidade padrão deve estar entre as unidades permitidas.',
          success: false,
        })
      }
    }

    await prisma.userUnitAccess.deleteMany({
      where: {
        userId: input.userId,
        companyId: input.companyId,
      },
    })

    if (input.scope === 'all') {
      await prisma.userUnitAccess.create({
        data: {
          userId: input.userId,
          companyId: input.companyId,
          unitId: null,
        },
      })
    } else {
      for (const unitId of input.allowedUnitIds) {
        await prisma.userUnitAccess.create({
          data: {
            userId: input.userId,
            companyId: input.companyId,
            unitId,
          },
        })
      }
    }

    await prisma.user.update({
      where: { id: input.userId },
      data: {
        defaultUnitId:
          input.scope === 'restricted' && input.defaultUnitId
            ? input.defaultUnitId
            : null,
      },
    })

    return returnsDefaultActionMessage({
      message: 'Acesso por unidade atualizado com sucesso',
      success: true,
    })
  })
