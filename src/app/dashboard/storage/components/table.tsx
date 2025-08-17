'use client'

import { useRouter } from '@bprogress/next'
import { deleteStorageAction } from '@inspetor/actions/delete-storage'
import { Badge } from '@inspetor/components/ui/badge'
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
import { cn } from '@inspetor/lib/utils'
import type { Company, Storage } from '@prisma/client'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Edit,
  Ellipsis,
  Inbox,
  Trash,
  View,
} from 'lucide-react'
import { parseAsInteger, useQueryState } from 'nuqs'
import { useRef } from 'react'
import { toast } from 'sonner'
import { useServerAction } from 'zsa-react'

import { StorageEditModal } from './edit-modal'

type StorageWithCompany = Storage & {
  company: Company
}

type StorageTableProps = {
  storages: StorageWithCompany[]
  totalPages: number
}

export function StorageTable({ storages, totalPages }: StorageTableProps) {
  const deleteAction = useServerAction(deleteStorageAction)
  const router = useRouter()

  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1))

  const editModalRef = useRef<any>(null)

  function handlePageChange(page: number) {
    setPage(page)
  }

  async function handleDeleteStorage(storageId: string) {
    const [result, resultError] = await deleteAction.execute({
      storageId,
    })

    if (resultError) {
      toast.error('Erro ao deletar pasta')
    }

    if (result?.success) {
      toast.success(result.message)
      router.refresh()
    } else {
      toast.error(result?.message)
    }
  }

  return (
    <div className="overflow-x-auto rounded border">
      <Table>
        <TableHeader className="bg-muted">
          <TableRow className="divide-x">
            <TableHead>Empresa</TableHead>
            <TableHead>Link relativo</TableHead>
            <TableHead>Data de criação</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-20">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {storages.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                <div className="flex flex-col items-center gap-2 py-20">
                  <Inbox className="size-10 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Nenhuma pasta encontrada
                  </span>
                </div>
              </TableCell>
            </TableRow>
          )}

          {storages.map((storage) => (
            <TableRow key={storage.id} className="divide-x">
              <TableCell>{storage.company.name}</TableCell>
              <TableCell>{storage.relativeLink}</TableCell>
              <TableCell>
                {storage.createdAt.toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </TableCell>
              <TableCell>
                <Badge
                  className={cn(
                    'capitalize',
                    storage.status === 'ACTIVE' && 'bg-green-500',
                    storage.status === 'INACTIVE' && 'bg-red-500',
                  )}
                >
                  {storage.status}
                </Badge>
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
                      <DropdownMenuItem
                        onClick={() => editModalRef.current.open(storage)}
                      >
                        <Edit className="size-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => editModalRef.current.open(storage, true)}
                      >
                        <View className="size-4" />
                        Visualizar
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />

                      <DropdownMenuItem
                        onClick={() => handleDeleteStorage(storage.id)}
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
            <TableCell colSpan={4}>
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
                        disabled={page === 1}
                      >
                        <ChevronLeftIcon className="size-4" />
                      </Button>
                    </PaginationItem>

                    <PaginationItem>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page === totalPages}
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

      <StorageEditModal ref={editModalRef} />
    </div>
  )
}
