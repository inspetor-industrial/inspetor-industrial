'use client'

import { deleteDocumentsAction } from '@inspetor/actions/delete-documents'
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
import {
  type DocumentListItem,
  getDocumentsQueryKey,
  useDocumentsQuery,
} from '@inspetor/hooks/use-documents-query'
import { FileSizeFormatter } from '@inspetor/utils/file'
import { useQueryClient } from '@tanstack/react-query'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Ellipsis,
  FolderOpen,
  Trash,
  View,
} from 'lucide-react'
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs'
import { toast } from 'sonner'
import { useServerAction } from 'zsa-react'

import { DocumentsTableSkeleton } from './table-skeleton'

export function DocumentsTable() {
  const deleteAction = useServerAction(deleteDocumentsAction)
  const queryClient = useQueryClient()

  const [search] = useQueryState('search', parseAsString.withDefault(''))
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1))

  const { data, isPending, isError } = useDocumentsQuery(search, page)

  function handlePageChange(newPage: number) {
    setPage(newPage)
  }

  async function handleDeleteDocument(documentId: string) {
    toast.loading('Deletando documento...', {
      id: 'delete-document',
    })
    const [result, resultError] = await deleteAction.execute({
      documentId,
    })

    if (resultError) {
      toast.error('Erro ao deletar documento', {
        id: 'delete-document',
      })
      return
    }

    if (result?.success) {
      toast.success(result.message, {
        id: 'delete-document',
      })
      await queryClient.invalidateQueries({ queryKey: getDocumentsQueryKey() })
      return
    }

    toast.error(result?.message, {
      id: 'delete-document',
    })
  }

  if (isError) {
    return (
      <div className="bg-background @container/table rounded-md border p-6 text-center text-destructive">
        Erro ao carregar documentos.
      </div>
    )
  }

  if (isPending || !data) {
    return <DocumentsTableSkeleton />
  }

  const { documents, totalPages } = data

  return (
    <div className="bg-background @container/table rounded-md border">
      <div className="relative w-full overflow-auto">
        <Table className="min-w-[600px]">
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
                        <Button
                          type="button"
                          variant="outline"
                          icon={Ellipsis}
                          size="icon"
                        >
                          <span className="sr-only">Abrir menu</span>
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
                          type="button"
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
                          type="button"
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
