import type { StorageWhereInput } from '@inspetor/generated/prisma/models'
import { getSession } from '@inspetor/lib/auth/server'
import { getGoogleDriveClient } from '@inspetor/lib/google'
import { prisma } from '@inspetor/lib/prisma'
import type { GoogleDriveFile } from '@inspetor/types/google'
import { Inbox } from 'lucide-react'
import { redirect } from 'next/navigation'

import { Files } from './components/files'
import { GoBackButton } from './components/goback-button'

type StorageReportsPageProps = {
  searchParams: Promise<{
    folderId: string
  }>
}

export default async function StorageReportsPage({
  searchParams,
}: StorageReportsPageProps) {
  const { folderId } = await searchParams
  try {
    const session = await getSession()

    if (!session?.user) {
      return redirect('/auth/sign-in')
    }

    const userCompanyId = session.user.companyId ?? null
    if (!userCompanyId) {
      return redirect('/access-denied')
    }

    const isAdmin = session.user.role === 'ADMIN'

    let storageWhere: StorageWhereInput = {
      companyId: userCompanyId,
    }

    if (!isAdmin) {
      const accessRows = await prisma.userUnitAccess.findMany({
        where: {
          userId: session.user.id,
          companyId: userCompanyId,
        },
        select: { unitId: true },
      })
      const hasFullAccess = accessRows.some((r) => r.unitId === null)
      const allowedUnitIds = accessRows
        .filter((r): r is { unitId: string } => r.unitId !== null)
        .map((r) => r.unitId)

      if (!hasFullAccess && allowedUnitIds.length > 0) {
        storageWhere = {
          ...storageWhere,
          OR: [
            { storageUnits: { none: {} } },
            {
              storageUnits: {
                some: { unitId: { in: allowedUnitIds } },
              },
            },
          ],
        }
      }
    }

    const storage = await prisma.storage.findFirst({
      where: storageWhere,
    })

    if (!storage) {
      return redirect('/access-denied')
    }

    const folderIdToLoadFiles = (
      folderId || storage.relativeLink.replace('/', '')
    ).replace(/\?.*$/, '')

    const drive = getGoogleDriveClient()
    const res = await drive.files.list({
      q: `'${folderIdToLoadFiles}' in parents and trashed = false`,
      fields: 'files(*)',
    })

    const files = res.data.files as GoogleDriveFile[]

    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold">Relatórios</h1>
            <p className="text-sm text-muted-foreground">
              Aqui você pode gerenciar os relatórios de inspeção.
            </p>
          </div>

          <GoBackButton
            parentFolderId={storage.relativeLink.replace('/', '')}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <Files files={files} />

          {(!files || files?.length === 0) && (
            <div className="col-span-full h-64 p-10 sm:h-96 flex flex-col items-center justify-center">
              <Inbox
                className="size-20 text-muted-foreground"
                strokeWidth={1}
              />
              <p className="text-sm text-muted-foreground">
                Nenhum relatório encontrado nesta pasta.
              </p>
            </div>
          )}
        </div>
      </div>
    )
  } catch (error) {
    console.trace(error)
    return redirect('/access-denied')
  }
}
