'use client'

import { subject } from '@casl/ability'
import { deleteValveAction } from '@inspetor/actions/delete-valve'
import type { Subjects } from '@inspetor/casl/ability'
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
  getValvesQueryKey,
  useValvesQuery,
  type ValveListItem,
} from '@inspetor/hooks/use-valves-query'
import { useQueryClient } from '@tanstack/react-query'
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
import { useServerAction } from 'zsa-react'

import { ValveEditModal } from './edit-modal'
import { ValveTableSkeleton } from './table-skeleton'

export function ValveTable() {
  const deleteAction = useServerAction(deleteValveAction)
  const queryClient = useQueryClient()
  const ability = useAbility()

  const [search] = useQueryState('search', parseAsString.withDefault(''))
  const [companyId] = useQueryState('companyId', parseAsString.withDefault(''))
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1))

  const { data, isPending, isError } = useValvesQuery(search, page, companyId)
  const editModalRef = useRef<{
    open: (valve: ValveListItem, isOnlyRead?: boolean) => void
  } | null>(null)
  const [valveToDeleteId, setValveToDeleteId] = useState<string | null>(null)
  const [conflictAlert, setConflictAlert] = useState<{
    open: boolean
    message: string
  }>({ open: false, message: '' })

  function handlePageChange(newPage: number) {
    setPage(newPage)
  }

  async function handleDeleteValve(valveId: string) {
    setValveToDeleteId(null)

    toast.loading('Deletando válvula...', {
      id: 'delete-valve',
    })
    const [result, resultError] = await deleteAction.execute({
      valveId,
    })

    if (resultError) {
      toast.error('Erro ao deletar válvula', {
        id: 'delete-valve',
      })
      return
    }

    if (result?.success) {
      toast.success(result.message, {
        id: 'delete-valve',
      })
      await queryClient.invalidateQueries({ queryKey: getValvesQueryKey() })
      return
    }

    if (result?.others?.conflict) {
      toast.dismiss('delete-valve')
      setConflictAlert({ open: true, message: result.message ?? '' })
      return
    }

    toast.error(result?.message, {
      id: 'delete-valve',
    })
  }

  if (isError) {
    return (
      <div className="bg-background @container/table rounded-md border p-6 text-center text-destructive">
        Erro ao carregar válvulas.
      </div>
    )
  }

  if (isPending || !data) {
    return <ValveTableSkeleton />
  }

  const { valves, totalPages } = data

  return (
    <div className="bg-background @container/table rounded-md border">
      <div className="relative w-full overflow-auto">
        <Table className="min-w-[800px]">
          <TableHeader className="bg-muted">
            <TableRow className="divide-x">
              <TableHead>Número de Série</TableHead>
              <TableHead>Modelo</TableHead>
              <TableHead>Diâmetro</TableHead>
              <TableHead>Vazão</TableHead>
              <TableHead>Pressão de Abertura</TableHead>
              <TableHead>Pressão de Fechamento</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead className="w-20">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {valves.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center">
                  <div className="flex flex-col items-center gap-2 py-20">
                    <Inbox className="size-10 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Nenhuma válvula encontrada
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {valves.map((valve) => {
              const subjectValve = subject('ReportValve', {
                companyId: valve.companyId,
              }) as unknown as Subjects
              const canUpdate = ability.can('update', subjectValve)
              const canDelete = ability.can('delete', subjectValve)
              const canRead = ability.can('read', subjectValve)

              return (
                <TableRow key={valve.id} className="divide-x">
                  <TableCell>{valve.serialNumber}</TableCell>
                  <TableCell>{valve.model}</TableCell>
                  <TableCell>{String(valve.diameter)}</TableCell>
                  <TableCell>{String(valve.flow)}</TableCell>
                  <TableCell>{String(valve.openingPressure)}</TableCell>
                  <TableCell>{String(valve.closingPressure)}</TableCell>
                  <TableCell>{valve.company?.name ?? '-'}</TableCell>
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
                              onClick={() => editModalRef.current?.open(valve)}
                            >
                              <Edit className="size-4" />
                              Editar
                            </DropdownMenuItem>
                          )}
                          {canRead && (
                            <DropdownMenuItem
                              onClick={() =>
                                editModalRef.current?.open(valve, true)
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
                              onClick={() => setValveToDeleteId(valve.id)}
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
              <TableCell colSpan={6}>
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

      <ValveEditModal ref={editModalRef} />

      <AlertDialog
        open={valveToDeleteId !== null}
        onOpenChange={(open) => {
          if (!open) setValveToDeleteId(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir válvula?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Deseja continuar?
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
                  valveToDeleteId !== null && handleDeleteValve(valveToDeleteId)
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
