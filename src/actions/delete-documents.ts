'use server'

import { DeleteObjectCommand } from '@aws-sdk/client-s3'
import { env } from '@inspetor/env'
import { prisma } from '@inspetor/lib/prisma'
import { r2 } from '@inspetor/lib/r2'
import { returnsDefaultActionMessage } from '@inspetor/utils/returns-default-action-message'
import z from 'zod'

import { authProcedure } from './procedures/auth'
import { getUserByUsernameOrEmail } from './utils/get-user-by-username-or-email'

export const deleteDocumentsAction = authProcedure
  .createServerAction()
  .input(z.object({ documentId: z.string() }))
  .handler(async ({ input, ctx }) => {
    console.log('[deleteDocumentsAction] Starting with input:', input)
    console.log('[deleteDocumentsAction] Context user:', ctx.user)

    if (!ctx.user.email) {
      console.log('[deleteDocumentsAction] No user email')
      return returnsDefaultActionMessage({
        message: 'Usuário não autenticado',
        success: false,
      })
    }

    const user = await getUserByUsernameOrEmail({
      email: ctx.user.email,
      username: ctx.user.username,
    })

    console.log('[deleteDocumentsAction] User found:', user)

    if (!user || !user.companyId) {
      console.log('[deleteDocumentsAction] User not found or no companyId')
      return returnsDefaultActionMessage({
        message: 'Usuário não encontrado',
        success: false,
      })
    }

    console.log('[deleteDocumentsAction] Looking for document with:', {
      id: input.documentId,
      companyId: user.companyId,
    })

    const documentOnDatabase = await prisma.documents.findUnique({
      where: {
        id: input.documentId,
        companyId: user.companyId,
      },
    })

    console.log('[deleteDocumentsAction] Document found:', documentOnDatabase)

    if (!documentOnDatabase) {
      console.log('[deleteDocumentsAction] Document not found')
      return returnsDefaultActionMessage({
        message:
          'Documento não encontrado ou você não tem permissão para deletá-lo',
        success: false,
      })
    }

    // Check if document is being used by a Bomb
    const bombUsingDocument = await prisma.bomb.findFirst({
      where: {
        photoId: input.documentId,
      },
    })

    console.log('[deleteDocumentsAction] Bomb using document:', bombUsingDocument)

    if (bombUsingDocument) {
      console.log('[deleteDocumentsAction] Document is in use by a bomb, cannot delete')
      return returnsDefaultActionMessage({
        message: 'Este documento está vinculado a uma bomba e não pode ser deletado',
        success: false,
      })
    }

    try {
      console.log('[deleteDocumentsAction] Deleting from R2:', documentOnDatabase.cloudflareR2Key)
      await r2.send(
        new DeleteObjectCommand({
          Bucket: env.CLOUDFLARE_R2_BUCKET_NAME,
          Key: documentOnDatabase.cloudflareR2Key,
        }),
      )
      console.log('[deleteDocumentsAction] R2 delete success')
    } catch (r2Error) {
      console.error('[deleteDocumentsAction] R2 delete error:', r2Error)
    }

    try {
      console.log('[deleteDocumentsAction] Deleting from database')
      await prisma.documents.delete({
        where: {
          id: input.documentId,
        },
      })
      console.log('[deleteDocumentsAction] Database delete success')
    } catch (dbError) {
      console.error('[deleteDocumentsAction] Database delete error:', dbError)
      return returnsDefaultActionMessage({
        message: 'Erro ao deletar documento do banco de dados',
        success: false,
      })
    }

    return returnsDefaultActionMessage({
      message: 'Documento deletado com sucesso',
      success: true,
    })
  })
