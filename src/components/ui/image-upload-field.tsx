'use client'

import { deleteDocumentsAction } from '@inspetor/actions/delete-documents'
import { api } from '@inspetor/lib/api'
import { cn } from '@inspetor/lib/utils'
import { AxiosError } from 'axios'
import {
  CheckCircle2,
  Download,
  Eye,
  ImageIcon,
  Loader2,
  Trash2,
  Upload,
} from 'lucide-react'
import Image from 'next/image'
import { useEffect, useRef, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { useServerAction } from 'zsa-react'

import { Button } from './button'
import { Progress } from './progress'

type SignedUrl = {
  signedUrl: string
  key: string
  correlationId: string
  documentId: string
}

type ImageUploadFieldProps = {
  value?: string
  onChange?: (documentId: string | null) => void
  disabled?: boolean
  existingImageName?: string
}

export function ImageUploadField({
  value,
  onChange,
  disabled,
  existingImageName,
}: ImageUploadFieldProps) {
  const [isUploading, startUpload] = useTransition()
  const [isDeleting, startDeleting] = useTransition()
  const [isDownloading, startDownload] = useTransition()
  const [isViewing, startView] = useTransition()
  const [uploadProgress, setUploadProgress] = useState(0)
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [fileName, setFileName] = useState<string | null>(
    existingImageName ?? null,
  )
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploadedDocumentId, setUploadedDocumentId] = useState<string | null>(
    null,
  )
  const inputRef = useRef<HTMLInputElement>(null)
  const deleteAction = useServerAction(deleteDocumentsAction)

  // Update fileName when existingImageName or value changes
  useEffect(() => {
    if (existingImageName && value) {
      setFileName(existingImageName)
    } else if (!value) {
      setFileName(null)
    }
  }, [existingImageName, value])

  async function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione apenas imagens')
      return
    }

    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      toast.error('A imagem deve ter no máximo 10MB')
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    setUploadProgress(0)
    setFileName(file.name)

    try {
      const correlationId = crypto.randomUUID()

      // Get signed URL
      const response = await api.post<{ signedUrls: SignedUrl[] }>('/storage', {
        files: [
          {
            name: file.name,
            type: file.type,
            size: file.size,
            correlationId,
          },
        ],
      })

      const signedUrl = response.data.signedUrls[0]
      if (!signedUrl) {
        throw new Error('Failed to get signed URL')
      }

      // Upload to R2
      await api.put(signedUrl.signedUrl, file, {
        headers: {
          'Content-Type': file.type,
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total ?? 1),
          )
          setUploadProgress(progress)
        },
      })

      setUploadedDocumentId(signedUrl.documentId)
      onChange?.(signedUrl.documentId)
      toast.success('Imagem enviada com sucesso')
    } catch (error) {
      setPreviewUrl(null)
      setFileName(null)
      onChange?.(null)

      if (error instanceof AxiosError) {
        const message = error.response?.data?.error || 'Erro ao enviar imagem'
        toast.error(message)
      } else {
        toast.error('Erro ao enviar imagem')
      }
    } finally {
      if (inputRef.current) {
        inputRef.current.value = ''
      }
    }
  }

  async function handleRemove() {
    // Only delete from database if it was uploaded in this session (not yet saved)
    // Existing documents (from editing) should not be deleted here - they will be
    // handled when the form is saved or can be deleted separately
    if (uploadedDocumentId) {
      try {
        const [result, error] = await deleteAction.execute({
          documentId: uploadedDocumentId,
        })

        if (error) {
          toast.error('Erro ao remover imagem')
          return
        }

        if (!result?.success) {
          toast.error(result?.message || 'Erro ao remover imagem')
          return
        }

        toast.success('Imagem removida com sucesso')
      } catch {
        toast.error('Erro ao remover imagem')
        return
      }
    }

    // Clear local state
    setPreviewUrl(null)
    setFileName(null)
    setUploadProgress(0)
    setUploadedDocumentId(null)

    // Notify parent that image was removed - React Hook Form will handle the state
    onChange?.(null)
  }

  async function handleDownload() {
    const documentId = value || uploadedDocumentId
    if (!documentId) {
      return
    }

    setDownloadProgress(0)

    try {
      // Get signed URL
      const urlResponse = await api.get<{ url: string; fileName: string }>(
        `/storage/download?documentId=${documentId}`,
      )

      const downloadUrl = urlResponse.data.url
      const fileName = urlResponse.data.fileName

      // Download file with progress tracking
      const response = await api.get(downloadUrl, {
        responseType: 'blob',
        onDownloadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total,
            )
            setDownloadProgress(progress)
          }
        },
      })

      // Create blob URL and trigger download
      const blob = new Blob([response.data])
      const blobUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Clean up blob URL
      window.URL.revokeObjectURL(blobUrl)

      toast.success('Download concluído')
    } catch (error) {
      if (error instanceof AxiosError) {
        const message = error.response?.data?.error || 'Erro ao baixar imagem'
        toast.error(message)
      } else {
        toast.error('Erro ao baixar imagem')
      }
    } finally {
      setDownloadProgress(0)
    }
  }

  async function handleView() {
    const documentId = value || uploadedDocumentId
    if (!documentId) return

    try {
      const response = await api.get<{ url: string; fileName: string }>(
        `/storage/download?documentId=${documentId}`,
      )

      const viewUrl = response.data.url

      // Open in new tab - this is synchronous, no need for loading state
      window.open(viewUrl, '_blank', 'noopener,noreferrer')
    } catch (error) {
      if (error instanceof AxiosError) {
        const message =
          error.response?.data?.error || 'Erro ao visualizar imagem'
        toast.error(message)
      } else {
        toast.error('Erro ao visualizar imagem')
      }
    }
  }

  // Use value from React Hook Form as source of truth
  // previewUrl is only for newly uploaded images before they're saved
  const hasImage = Boolean(value || previewUrl)
  const documentId = value || uploadedDocumentId

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={(event) => {
          startUpload(async () => {
            await handleFileSelect(event)
          })
        }}
        className="hidden"
        disabled={disabled || isUploading}
      />

      {!hasImage && !isUploading && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
          className={cn(
            'w-full border-2 border-dashed rounded-lg p-6 transition-all',
            'flex flex-col items-center justify-center gap-2',
            'hover:border-primary hover:bg-primary/5',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
            disabled && 'opacity-50 cursor-not-allowed hover:border-border',
          )}
        >
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
            <Upload className="size-5 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">Clique para enviar</p>
            <p className="text-xs text-muted-foreground">PNG, JPG até 10MB</p>
          </div>
        </button>
      )}

      {isUploading && (
        <div className="w-full border rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
              <Loader2 className="size-5 text-blue-600 animate-spin" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{fileName}</p>
              <p className="text-xs text-muted-foreground">Enviando...</p>
            </div>
            <span className="text-sm font-medium text-blue-600">
              {uploadProgress}%
            </span>
          </div>
          <Progress
            value={uploadProgress}
            className="h-1.5 [&>*]:data-[slot=progress-indicator]:!bg-blue-500"
          />
        </div>
      )}

      {hasImage && !isUploading && (
        <div className="w-full border rounded-lg p-3 flex items-center gap-3 overflow-hidden">
          {previewUrl ? (
            <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-muted">
              <Image
                src={previewUrl}
                alt="Preview"
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
              <ImageIcon className="size-4 text-green-600" />
            </div>
          )}
          <div className="flex-1 min-w-0 overflow-hidden">
            <p className="text-sm font-medium truncate max-w-full">
              {fileName || 'Imagem selecionada'}
            </p>
            {isDownloading ? (
              <div className="space-y-1.5 mt-1">
                <div className="flex items-center gap-1 text-xs text-blue-600">
                  <Loader2 className="size-3 shrink-0 animate-spin" />
                  <span>Baixando... {downloadProgress}%</span>
                </div>
                <Progress
                  value={downloadProgress}
                  className="h-1.5 [&>*]:data-[slot=progress-indicator]:!bg-blue-500"
                />
              </div>
            ) : (
              <div className="flex items-center gap-1 text-xs text-green-600">
                <CheckCircle2 className="size-3 shrink-0" />
                <span>Enviado com sucesso</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {documentId && (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-primary"
                  onClick={() => {
                    startView(handleView)
                  }}
                  disabled={isViewing}
                  title="Visualizar em nova aba"
                >
                  {isViewing ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-primary"
                  onClick={() => {
                    startDownload(handleDownload)
                  }}
                  disabled={isDownloading}
                  title="Baixar imagem"
                >
                  {isDownloading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Download className="size-4" />
                  )}
                </Button>
              </>
            )}
            {!disabled && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => {
                  startDeleting(handleRemove)
                }}
                disabled={isDeleting}
                title="Remover imagem"
              >
                {isDeleting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Trash2 className="size-4" />
                )}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
