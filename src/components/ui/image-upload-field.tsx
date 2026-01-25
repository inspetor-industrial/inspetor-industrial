'use client'

import { deleteDocumentsAction } from '@inspetor/actions/delete-documents'
import { api } from '@inspetor/lib/api'
import { cn } from '@inspetor/lib/utils'
import { AxiosError } from 'axios'
import { CheckCircle2, ImageIcon, Loader2, Trash2, Upload } from 'lucide-react'
import Image from 'next/image'
import { useRef, useState } from 'react'
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
  const [isUploading, setIsUploading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [fileName, setFileName] = useState<string | null>(
    existingImageName ?? null,
  )
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploadedDocumentId, setUploadedDocumentId] = useState<string | null>(
    null,
  )
  const inputRef = useRef<HTMLInputElement>(null)
  const deleteAction = useServerAction(deleteDocumentsAction)

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

    setIsUploading(true)
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
      setIsUploading(false)
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
      setIsDeleting(true)
      try {
        const [result, error] = await deleteAction.execute({
          documentId: uploadedDocumentId,
        })

        if (error) {
          toast.error('Erro ao remover imagem')
          setIsDeleting(false)
          return
        }

        if (!result?.success) {
          toast.error(result?.message || 'Erro ao remover imagem')
          setIsDeleting(false)
          return
        }

        toast.success('Imagem removida com sucesso')
      } catch {
        toast.error('Erro ao remover imagem')
        setIsDeleting(false)
        return
      }
      setIsDeleting(false)
    }

    setPreviewUrl(null)
    setFileName(null)
    setUploadProgress(0)
    setUploadedDocumentId(null)
    onChange?.(null)
  }

  const hasImage = value || previewUrl

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
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
            <div className="flex items-center gap-1 text-xs text-green-600">
              <CheckCircle2 className="size-3 shrink-0" />
              <span>Enviado com sucesso</span>
            </div>
          </div>
          {!disabled && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0 h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={handleRemove}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Trash2 className="size-4" />
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
