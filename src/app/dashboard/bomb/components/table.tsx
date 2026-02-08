'use client'

import { subject } from '@casl/ability'
import { deleteBombAction } from '@inspetor/actions/delete-bomb'
import { useAbility } from '@inspetor/casl/context'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@inspetor/components/ui/alert-dialog'
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
  type BombListItem,
  getBombsQueryKey,
  useBombsQuery,
} from '@inspetor/hooks/use-bombs-query'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Edit,
  Ellipsis,
  Inbox,
  Trash,
  Trash2Icon,
  View,
} from 'lucide-react'
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs'
import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { useServerAction } from 'zsa-react'

import { BombEditModal } from './edit-modal'
import { BombTableSkeleton } from './table-skeleton'

export function BombTable() {
  const deleteAction = useServerAction(deleteBombAction)
  const queryClient = useQueryClient()
  const ability = useAbility()

  const [search] = useQueryState('search', parseAsString.withDefault(''))
  const [companyId] = useQueryState('companyId', parseAsString.withDefault(''))
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1))

  const { data, isPending, isError } = useBombsQuery(search, page, companyId)
  const editModalRef = useRef<{
    open: (bomb: BombListItem, isOnlyRead?: boolean) => void
  } | null>(null)
  const [bombToDeleteId, setBombToDeleteId] = useState<string | null>(null)
  const [conflictAlert, setConflictAlert] = useState<{
    open: boolean
    message: string
  }>({ open: false, message: '' })

  function handlePageChange(newPage: number) {
    setPage(newPage)
  }

  async function handleDeleteBomb(bombId: string) {
    setBombToDeleteId(null)

    toast.loading('Deletando bomba...', {
      id: 'delete-bomb',
    })
    const [result, resultError] = await deleteAction.execute({
      bombId,
    })

    if (resultError) {
      toast.error('Erro ao deletar bomba', {
        id: 'delete-bomb',
      })
      return
    }

    if (result?.success) {
      toast.success(result.message, {
        id: 'delete-bomb',
      })
      await queryClient.invalidateQueries({ queryKey: getBombsQueryKey() })
      return
    }

    if (result?.others?.conflict) {
      toast.dismiss('delete-bomb')
      setConflictAlert({ open: true, message: result.message ?? '' })
      return
    }

    toast.error(result?.message, {
      id: 'delete-bomb',
    })
  }

  if (isError) {
    return (
      <div className="bg-background @container/table rounded-md border p-6 text-center text-destructive">
        Erro ao carregar bombas.
      </div>
    )
  }

  if (isPending || !data) {
    return <BombTableSkeleton />
  }

  const { bombs, totalPages } = data

  return (
    <div className="bg-background @container/table rounded-md border">
      <div className="relative w-full overflow-auto">
        <Table className="min-w-[600px]">
          <TableHeader className="bg-muted">
            <TableRow className="divide-x">
              <TableHead>Marca</TableHead>
              <TableHead>Modelo</TableHead>
              <TableHead>Estágios</TableHead>
              <TableHead>Potência</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead className="w-20">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bombs.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  <div className="flex flex-col items-center gap-2 py-20">
                    <Inbox className="size-10 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Nenhuma bomba encontrada
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {bombs.map((bomb) => {
              const subjectBomb = subject('ReportBomb', {
                companyId: bomb.companyId,
              })
              const canUpdate = ability.can('update', subjectBomb)
              const canDelete = ability.can('delete', subjectBomb)
              const canRead = ability.can('read', subjectBomb)

              return (
                <TableRow key={bomb.id} className="divide-x">
                  <TableCell>{bomb.mark}</TableCell>
                  <TableCell>{bomb.model}</TableCell>
                  <TableCell>{bomb.stages}</TableCell>
                  <TableCell>{String(bomb.potency)}</TableCell>
                  <TableCell>{bomb.company?.name ?? '-'}</TableCell>
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
                          {canUpdate && (
                            <DropdownMenuItem
                              onClick={() =>
                                editModalRef.current?.open(bomb)
                              }
                            >
                              <Edit className="size-4" />
                              Editar
                            </DropdownMenuItem>
                          )}
                          {canRead && (
                            <DropdownMenuItem
                              onClick={() =>
                                editModalRef.current?.open(bomb, true)
                              }
                            >
                              <View className="size-4" />
                              Visualizar
                            </DropdownMenuItem>
                          )}
                          {(canUpdate || canRead) && canDelete && (
                            <DropdownMenuSeparator />
                          )}
                          {canDelete && (
                            <DropdownMenuItem
                              onClick={() => setBombToDeleteId(bomb.id)}
                            >
                              <Trash className="size-4" />
                              Excluir
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
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
              <TableCell colSpan={1} />
              <TableCell colSpan={1} className="flex justify-end">
                <div className="flex gap-2 justify-end">
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

      <BombEditModal ref={editModalRef} />

      <AlertDialog
        open={bombToDeleteId !== null}
        onOpenChange={(open) => {
          if (!open) setBombToDeleteId(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir bomba?</AlertDialogTitle>
            <AlertDialogDescription>
              A foto vinculada à bomba também será excluída. Esta ação não pode
              ser desfeita. Deseja continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                type="button"
                className="bg-destructive hover:bg-destructive/90"
                variant="destructive"
                onClick={() =>
                  bombToDeleteId !== null &&
                  handleDeleteBomb(bombToDeleteId)
                }
              >
                <Trash2Icon /> Sim, excluir
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={conflictAlert.open}
        onOpenChange={(open) => {
          if (!open) setConflictAlert({ open: false, message: '' })
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Não foi possível excluir</AlertDialogTitle>
            <AlertDialogDescription>
              {conflictAlert.message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => setConflictAlert({ open: false, message: '' })}
            >
              Fechar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
