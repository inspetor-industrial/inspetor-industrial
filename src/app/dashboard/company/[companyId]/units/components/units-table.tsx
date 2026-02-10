'use client'

import { subject } from '@casl/ability'
import { deleteCompanyUnitAction } from '@inspetor/actions/units/delete-company-unit'
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
import { Badge } from '@inspetor/components/ui/badge'
import { Button } from '@inspetor/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
  type CompanyUnitListItem,
  getCompanyUnitsQueryKey,
  useCompanyUnitsQuery,
} from '@inspetor/hooks/use-company-units-query'
import { cn } from '@inspetor/lib/utils'
import { useQueryClient } from '@tanstack/react-query'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Edit,
  Ellipsis,
  Inbox,
  Trash,
  Trash2Icon,
} from 'lucide-react'
import { parseAsInteger, useQueryState } from 'nuqs'
import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { useServerAction } from 'zsa-react'

import { UnitEditModal } from './edit-modal'
import { UnitsTableSkeleton } from './units-table-skeleton'

type UnitsTableProps = {
  companyId: string
}

export function UnitsTable({ companyId }: UnitsTableProps) {
  const deleteAction = useServerAction(deleteCompanyUnitAction)
  const queryClient = useQueryClient()
  const ability = useAbility()
  const editModalRef = useRef<{
    open: (unit: CompanyUnitListItem) => void
    close: () => void
  } | null>(null)
  const [unitToDeleteId, setUnitToDeleteId] = useState<string | null>(null)
  const [conflictAlert, setConflictAlert] = useState<{
    open: boolean
    message: string
  }>({ open: false, message: '' })

  const [page, setPage] = useQueryState(
    'page',
    parseAsInteger.withDefault(1),
  )

  const { data, isPending, isError } = useCompanyUnitsQuery(companyId, page)

  function handlePageChange(newPage: number) {
    setPage(newPage)
  }

  async function handleDeleteUnit(unitId: string) {
    setUnitToDeleteId(null)

    toast.loading('Excluindo unidade...', { id: 'delete-unit' })
    const [result, resultError] = await deleteAction.execute({ unitId })

    if (resultError) {
      toast.error('Erro ao excluir unidade', { id: 'delete-unit' })
      return
    }

    if (result?.success) {
      toast.success(result.message, { id: 'delete-unit' })
      await queryClient.invalidateQueries({
        queryKey: getCompanyUnitsQueryKey(companyId),
      })
      return
    }

    if (result?.others?.conflict) {
      toast.dismiss('delete-unit')
      setConflictAlert({ open: true, message: result.message ?? '' })
      return
    }

    toast.error(result?.message, { id: 'delete-unit' })
  }

  if (isError) {
    return (
      <div className="bg-background @container/table rounded-md border p-6 text-center text-destructive">
        Erro ao carregar unidades.
      </div>
    )
  }

  if (isPending || !data) {
    return <UnitsTableSkeleton />
  }

  const units = data.units ?? []
  const totalPages = data.totalPages ?? 0

  return (
    <div className="bg-background @container/table rounded-md border">
      <div className="relative w-full overflow-auto">
        <Table>
          <TableHeader className="bg-muted">
            <TableRow className="divide-x">
              <TableHead>Nome</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-20">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {units.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center">
                  <div className="flex flex-col items-center gap-2 py-20">
                    <Inbox className="size-10 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Nenhuma unidade encontrada
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            )}
            {units.map((unit) => {
              const subjectUnit = subject('CompanyUnit', {
                companyId,
              }) as unknown as Subjects
              const canUpdate = ability.can('update', subjectUnit)
              const canDelete = ability.can('delete', subjectUnit)

              return (
                <TableRow key={unit.id} className="divide-x">
                  <TableCell>{unit.name}</TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        'capitalize',
                        unit.status === 'ACTIVE' && 'bg-green-500',
                        unit.status === 'INACTIVE' && 'bg-red-500',
                      )}
                    >
                      {unit.status}
                    </Badge>
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
                          {canUpdate && (
                            <DropdownMenuItem
                              onClick={() =>
                                editModalRef.current?.open(unit)
                              }
                            >
                              <Edit className="size-4" />
                              Editar
                            </DropdownMenuItem>
                          )}
                          {canDelete && (
                            <DropdownMenuItem
                              onClick={() => setUnitToDeleteId(unit.id)}
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
              <TableCell colSpan={2}>
                <div className="flex items-center gap-2 justify-start">
                  <span>
                    Página {page} de {totalPages || 1}
                  </span>
                </div>
              </TableCell>
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
                          disabled={
                            page === totalPages || totalPages === 0
                          }
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

      <UnitEditModal ref={editModalRef} companyId={companyId} />

      <AlertDialog
        open={unitToDeleteId !== null}
        onOpenChange={(open) => {
          if (!open) setUnitToDeleteId(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir unidade?</AlertDialogTitle>
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
                  unitToDeleteId !== null &&
                  handleDeleteUnit(unitToDeleteId)
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
