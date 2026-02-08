import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@inspetor/components/ui/alert-dialog'
import { Button } from '@inspetor/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@inspetor/components/ui/dialog'
import { FileUpload } from '@inspetor/components/ui/file-upload'
import { Progress } from '@inspetor/components/ui/progress'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@inspetor/components/ui/tooltip'
import { getDocumentsQueryKey } from '@inspetor/hooks/use-documents-query'
import { api } from '@inspetor/lib/api'
import { cn } from '@inspetor/lib/utils'
import { FileSizeFormatter } from '@inspetor/utils/file'
import { useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Loader2,
  Upload,
} from 'lucide-react'
import { Fragment, useRef, useState, useTransition } from 'react'
import { toast } from 'sonner'

type SignedUrl = {
  signedUrl: string
  key: string
  correlationId: string
}

type FileToUpload = {
  name: string
  type: string
  size: number
  correlationId: string
  raw: File
}

type FileInUpload = {
  name: string
  type: string
  size: number
  correlationId: string
  progress: number
}

export function DocumentsCreationModal() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAlertOpen, setIsAlertOpen] = useState(false)

  const [isUploading, startUpload] = useTransition()

  const [filesInUpload, setFilesInUpload] = useState<FileInUpload[]>([])

  const fileUploadRef = useRef<any>(null)
  const queryClient = useQueryClient()

  async function handleUploadToCloudflareR2(
    signedUrls: SignedUrl[],
    files: FileToUpload[],
  ) {
    setIsAlertOpen(true)

    try {
      const promises: Promise<void>[] = []
      for (const file of files) {
        const signedUrl = signedUrls.find(
          (signedUrl) => signedUrl.correlationId === file.correlationId,
        )

        if (!signedUrl) {
          toast.error('Arquivo não encontrado', {
            description: `O arquivo ${file.name} não foi encontrado.`,
          })
          continue
        }

        promises.push(
          api.put(signedUrl.signedUrl, file.raw, {
            headers: {
              'Content-Type': file.type,
            },
            onUploadProgress: (progressEvent) => {
              const progress = Math.round(
                (progressEvent.loaded * 100) / (progressEvent.total ?? 1),
              )

              setFilesInUpload((prev) =>
                prev.map((fileInUpload) =>
                  fileInUpload.correlationId === file.correlationId
                    ? { ...fileInUpload, progress }
                    : fileInUpload,
                ),
              )
            },
          }),
        )

        setFilesInUpload((prev) => [
          ...prev,
          {
            name: file.name,
            type: file.type,
            size: file.size,
            correlationId: file.correlationId,
            progress: 0,
          },
        ])
      }

      const results = await Promise.allSettled(promises)

      const hasError = results.some((result) => result.status === 'rejected')
      if (hasError) {
        toast.error('Erro ao fazer upload', {
          description: 'Verifique se os arquivos foram enviados com sucesso.',
        })

        return
      }

      toast.success('Arquivos enviados com sucesso')
      fileUploadRef.current?.clearFiles()

      await queryClient.invalidateQueries({ queryKey: getDocumentsQueryKey() })
      setIsModalOpen(false)
    } catch (error) {
      if (error instanceof AxiosError) {
        const message = error.response?.data?.error || 'Erro ao fazer upload'

        if (message) {
          toast.error(message)
        }
      }
    }
  }

  function handleUploadFiles() {
    startUpload(async () => {
      try {
        const filesToUpload = fileUploadRef.current?.getFiles()
        if (!filesToUpload) {
          toast.error('Nenhum arquivo selecionado')
          return
        }

        const files: FileToUpload[] = filesToUpload.map((file: File) => ({
          name: file.name,
          type: file.type,
          size: file.size,
          raw: file,
          correlationId: crypto.randomUUID(),
        }))

        const response = await api.post<{ signedUrls: SignedUrl[] }>(
          '/storage',
          {
            files: files.map((file) => ({
              name: file.name,
              type: file.type,
              size: file.size,
              correlationId: file.correlationId,
            })),
          },
        )

        if (response.status === 200) {
          await handleUploadToCloudflareR2(response.data.signedUrls, files)

          return
        }

        toast.error('Erro ao fazer upload')
      } catch (error) {
        if (error instanceof AxiosError) {
          const message = error.response?.data?.error || 'Erro ao fazer upload'

          if (message) {
            toast.error(message)
          }
        }
      }
    })
  }

  return (
    <Fragment>
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Atenção</AlertDialogTitle>
            <AlertDialogDescription>
              Você precisa aguardar o término do upload dos arquivos para
              continuar.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="flex flex-col gap-4 w-full">
            {filesInUpload.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                  <Upload className="size-8 text-blue-600" />
                </div>
                <h3 className="font-medium text-lg mb-2">
                  Nenhum arquivo em upload
                </h3>
                <p className="text-muted-foreground text-sm text-center max-w-sm">
                  Os arquivos selecionados aparecerão aqui com o progresso de
                  upload em tempo real.
                </p>
              </div>
            ) : (
              <ul className="space-y-4 max-h-60 overflow-auto pr-2 w-full">
                {filesInUpload.map((file) => (
                  <li
                    key={file.correlationId}
                    className={cn(
                      'relative flex items-start gap-4 p-4 rounded-lg border transition-all duration-200',
                      file.progress === 100
                        ? 'bg-green-50 border-green-200 shadow-sm'
                        : file.progress > 0
                          ? 'bg-blue-50 border-blue-200 shadow-sm'
                          : 'bg-muted border-border',
                    )}
                  >
                    {/* Ícone do arquivo */}
                    <div
                      className={cn(
                        'flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center',
                        file.progress === 100
                          ? 'bg-green-100 text-green-600'
                          : file.progress > 0
                            ? 'bg-blue-100 text-blue-600'
                            : 'bg-muted-foreground/10 text-muted-foreground',
                      )}
                    >
                      {file.progress === 100 ? (
                        <CheckCircle2 className="size-5" />
                      ) : (
                        <FileText className="size-5" />
                      )}
                    </div>

                    {/* Conteúdo principal */}
                    <div className="flex-1 min-w-0 space-y-3">
                      {/* Cabeçalho com nome e status */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <h4 className="font-medium text-sm truncate cursor-help">
                                {file.name}
                              </h4>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs max-w-96">{file.name}</p>
                            </TooltipContent>
                          </Tooltip>
                          <p className="text-xs text-muted-foreground mt-1">
                            {FileSizeFormatter.format(file.size)} • {file.type}
                          </p>
                        </div>

                        {/* Status e porcentagem */}
                        <div className="flex flex-col items-end gap-1">
                          {file.progress === 100 ? (
                            <div className="flex items-center gap-1.5 text-green-600">
                              <CheckCircle2 className="size-4" />
                              <span className="text-xs font-medium">
                                Concluído
                              </span>
                            </div>
                          ) : file.progress > 0 ? (
                            <div className="flex items-center gap-1.5 text-blue-600">
                              <Loader2 className="size-4 animate-spin" />
                              <span className="text-xs font-medium">
                                {file.progress}%
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <AlertCircle className="size-4" />
                              <span className="text-xs font-medium">
                                Aguardando
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Barra de progresso */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Progresso</span>
                          <span>{file.progress}%</span>
                        </div>
                        <Progress
                          className={cn(
                            'h-2',
                            file.progress === 100
                              ? '[&>*]:data-[slot=progress-indicator]:!bg-green-500'
                              : '[&>*]:data-[slot=progress-indicator]:!bg-blue-500',
                          )}
                          value={file.progress}
                        />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogAction asChild>
              <Button
                disabled={filesInUpload.some((file) => file.progress !== 100)}
                onClick={() => {
                  setIsModalOpen(false)
                  setIsAlertOpen(false)
                  setFilesInUpload([])
                }}
              >
                Fechar
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogTrigger asChild>
          <Button type="button" className="w-full md:w-auto" icon={Upload}>
            Upload
          </Button>
        </DialogTrigger>

        <DialogContent
          onInteractOutside={(event) => {
            if (isUploading) {
              event.preventDefault()
            }
          }}
          onEscapeKeyDown={(event) => {
            if (isUploading) {
              event.preventDefault()
            }
          }}
        >
          <DialogHeader>
            <DialogTitle>Upload de documento</DialogTitle>
            <DialogDescription>
              Selecione um arquivo para upload.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 border-2 border-dashed border-blue-400 rounded-lg overflow-hidden max-h-96">
            <div className="overflow-auto">
              <FileUpload ref={fileUploadRef} />
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={isUploading}>
                Cancelar
              </Button>
            </DialogClose>

            <Button isLoading={isUploading} onClick={handleUploadFiles}>
              Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Fragment>
  )
}
