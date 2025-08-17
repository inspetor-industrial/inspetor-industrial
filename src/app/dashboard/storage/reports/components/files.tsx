'use client'

import { useRouter } from '@bprogress/next'
import { invalidatePageCache } from '@inspetor/actions/utils/invalidate-page-cache'
import { GoogleDriveFile } from '@inspetor/types/google'
import { useQueryState } from 'nuqs'
import { useTransition } from 'react'
import { toast } from 'sonner'

import { FileCard } from './file-card'

type FilesProps = {
  files: GoogleDriveFile[]
}

export function Files({ files }: FilesProps) {
  const [, setSelectedFolderId] = useQueryState('folderId', {
    defaultValue: '',
  })

  const [isDownloadingFile, startDownloadingFile] = useTransition()
  const router = useRouter()

  async function handleNavigateToFolder(targetFile: GoogleDriveFile) {
    setSelectedFolderId(targetFile.id)

    try {
      await invalidatePageCache('/dashboard/storage/reports')
    } finally {
      router.refresh()
    }
  }

  async function handleDownloadFile(file: GoogleDriveFile) {
    startDownloadingFile(async () => {
      try {
        const response = await fetch(`/api/drive/download?fileId=${file.id}`)
        if (response.status === 401) {
          toast.error('Acesso negado', {
            description: 'Você não tem permissão para baixar este arquivo',
          })
          return
        }

        if (response.status === 200) {
          const blob = await response.blob()
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = file.name
          a.click()

          window.URL.revokeObjectURL(url)
          toast.success('Arquivo baixado com sucesso')
        }
      } catch {
        toast.error('Erro ao baixar o arquivo')
      }
    })
  }

  return files?.map((file) => (
    <FileCard
      key={file.id}
      file={file}
      isDownloading={isDownloadingFile}
      onOpenFolder={handleNavigateToFolder}
      onDownload={handleDownloadFile}
    />
  ))
}
