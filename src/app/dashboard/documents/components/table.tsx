'use client'

import { useRouter } from '@bprogress/next'
import { deleteDocumentsAction } from '@inspetor/actions/delete-documents'
import { invalidatePageCache } from '@inspetor/actions/utils/invalidate-page-cache'
import { Button } from '@inspetor/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@inspetor/components/ui/dropdown-menu'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from '@inspetor/components/ui/pagination'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@inspetor/components/ui/table'
import { FileSizeFormatter } from '@inspetor/utils/file'
import type { Documents } from '@prisma/client'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Ellipsis,
  FolderOpen,
  Trash,
  View,
} from 'lucide-react'
import { parseAsInteger, useQueryState } from 'nuqs'
import { toast } from 'sonner'
import { useServerAction } from 'zsa-react'

type DocumentWithOwner = Documents & {
  owner: {
    name: string
  }
}

type DocumentsTableProps = {
  documents: DocumentWithOwner[]
  totalPages: number
}

export function DocumentsTable({ documents, totalPages }: DocumentsTableProps) {
  const deleteAction = useServerAction(deleteDocumentsAction)
  const router = useRouter()

  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1))

  async function handlePageChange(page: number) {
    setPage(page)

    try {
      await invalidatePageCache('/dashboard/documents')
    } finally {
      router.refresh()
    }
  }

  async function handleDeleteDocument(documentId: string) {
    toast.loading('Deletando documento...', {
      id: 'delete-document',
    })
    const [result, resultError] = await deleteAction.execute({
      documentId,
    })

    if (resultError) {
      console.log(resultError)
      toast.error('Erro ao deletar documento', {
        id: 'delete-document',
      })
      return
    }

    if (result?.success) {
      toast.success(result.message, {
        id: 'delete-document',
      })
      router.refresh()
    } else {
      toast.error(result?.message, {
        id: 'delete-document',
      })
    }
  }

  return (
    <div className="bg-background @container/table rounded-md border">
      <div className="relative w-full overflow-auto">
        <Table>
          <TableHeader className="bg-muted">
            <TableRow className="divide-x">
              <TableHead>Nome</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Tamanho</TableHead>
              <TableHead>Dono</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead className="w-20">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  <div className="flex flex-col items-center gap-2 py-20">
                    <FolderOpen className="size-10 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Nenhum documento criado ainda.
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {documents.map((document) => (
              <TableRow key={document.id} className="divide-x">
                <TableCell>{document.name}</TableCell>
                <TableCell>{document.type}</TableCell>
                <TableCell>{FileSizeFormatter.format(document.size)}</TableCell>
                <TableCell>{document.owner.name}</TableCell>
                <TableCell>
                  {document.createdAt.toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </TableCell>
                <TableCell>
                  <div className="flex justify-center items-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" icon={Ellipsis} size="icon">
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuItem>
                          <View className="size-4" />
                          Visualizar
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          onClick={() => handleDeleteDocument(document.id)}
                        >
                          <Trash className="size-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={5}>
                <div className="flex items-center gap-2 justify-start">
                  <span>
                    Página {page} de {totalPages}
                  </span>
                </div>
              </TableCell>
              <TableCell colSpan={1} className="flex justify-end">
                <div className="flex items-center gap-2 justify-end">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handlePageChange(page - 1)}
                          disabled={page === 1 || totalPages === 0}
                        >
                          <ChevronLeftIcon className="size-4" />
                        </Button>
                      </PaginationItem>

                      <PaginationItem>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handlePageChange(page + 1)}
                          disabled={page === totalPages || totalPages === 0}
                        >
                          <ChevronRightIcon className="size-4" />
                        </Button>
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </div>
  )
}
