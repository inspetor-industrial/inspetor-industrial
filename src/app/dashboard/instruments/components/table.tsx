'use client'

import { subject } from '@casl/ability'
import { deleteInstrumentAction } from '@inspetor/actions/delete-instrument'
import type { Subjects } from '@inspetor/casl/ability'
import { Can, useAbility } from '@inspetor/casl/context'
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
import { INSTRUMENT_TYPE } from '@inspetor/constants/instrument-type'
import {
  getInstrumentsQueryKey,
  type InstrumentListItem,
  useInstrumentsQuery,
} from '@inspetor/hooks/use-instruments-query'
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
  View,
} from 'lucide-react'
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs'
import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { useServerAction } from 'zsa-react'

import { InstrumentEditModal } from './edit-modal'
import { InstrumentTableSkeleton } from './table-skeleton'

function formatValidationDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  if (!(d instanceof Date) || Number.isNaN(d.getTime())) {
    return '—'
  }
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function InstrumentTable() {
  const deleteAction = useServerAction(deleteInstrumentAction)
  const queryClient = useQueryClient()
  const ability = useAbility()

  const [search] = useQueryState('search', parseAsString.withDefault(''))
  const [companyId] = useQueryState('companyId', parseAsString.withDefault(''))
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1))

  const { data, isPending, isError } = useInstrumentsQuery(
    search,
    page,
    companyId,
  )
  const editModalRef = useRef<{
    open: (instrument: InstrumentListItem, isOnlyRead?: boolean) => void
  } | null>(null)
  const [instrumentToDeleteId, setInstrumentToDeleteId] = useState<
    string | null
  >(null)

  function handlePageChange(newPage: number) {
    setPage(newPage)
  }

  async function handleDeleteInstrument(instrumentId: string) {
    setInstrumentToDeleteId(null)

    toast.loading('Deletando instrumento...', {
      id: 'delete-instrument',
    })
    const [result, resultError] = await deleteAction.execute({
      instrumentId,
    })

    if (resultError) {
      toast.error('Erro ao deletar instrumento', {
        id: 'delete-instrument',
      })
      return
    }

    if (result?.success) {
      toast.success(result.message, {
        id: 'delete-instrument',
      })
      await queryClient.invalidateQueries({
        queryKey: getInstrumentsQueryKey(),
      })
      return
    }

    toast.error(result?.message, {
      id: 'delete-instrument',
    })
  }

  if (isError) {
    return (
      <div className="bg-background @container/table rounded-md border p-6 text-center text-destructive">
        Erro ao carregar instrumentos.
      </div>
    )
  }

  if (isPending || !data) {
    return <InstrumentTableSkeleton />
  }

  const { instruments, totalPages } = data

  return (
    <div className="bg-background @container/table rounded-md border">
      <div className="relative w-full overflow-auto">
        <Table className="min-w-[700px]">
          <TableHeader className="bg-muted">
            <TableRow className="divide-x">
              <TableHead>Número de série</TableHead>
              <TableHead>Número de certificado</TableHead>
              <TableHead>Fabricante</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Data de validade</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-20">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {instruments.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  <div className="flex flex-col items-center gap-2 py-20">
                    <Inbox className="size-10 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Nenhum instrumento encontrado
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {instruments.map((instrument) => {
              const subjectInstrument = subject('Instruments', {
                companyId: instrument.companyId,
              }) as unknown as Subjects
              const canUpdate = ability.can('update', subjectInstrument)
              const canDelete = ability.can('delete', subjectInstrument)
              const canRead = ability.can('read', subjectInstrument)
              const validationDate = instrument.validationDate
              const today = new Date()
              today.setHours(0, 0, 0, 0)
              const validDate =
                validationDate instanceof Date
                  ? new Date(validationDate.getTime())
                  : new Date(validationDate)
              validDate.setHours(0, 0, 0, 0)
              const isValidDate = !Number.isNaN(validDate.getTime())
              const isFuture = isValidDate && validDate > today
              const isToday =
                isValidDate && validDate.getTime() === today.getTime()

              return (
                <TableRow key={instrument.id} className="divide-x">
                  <TableCell>{instrument.serialNumber}</TableCell>
                  <TableCell>{instrument.certificateNumber}</TableCell>
                  <TableCell>{instrument.manufacturer}</TableCell>
                  <TableCell>
                    {
                      INSTRUMENT_TYPE[
                        instrument.type as keyof typeof INSTRUMENT_TYPE
                      ]
                    }
                  </TableCell>
                  <TableCell>
                    {formatValidationDate(instrument.validationDate)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        'capitalize w-fit',
                        isFuture && 'bg-green-500',
                        isValidDate && validDate < today && 'bg-red-500',
                        isToday && 'bg-yellow-500',
                      )}
                    >
                      {isFuture ? 'Válido' : isToday ? 'Vencendo' : 'Inválido'}
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
                                editModalRef.current?.open(instrument)
                              }
                            >
                              <Edit className="size-4" />
                              Editar
                            </DropdownMenuItem>
                          )}
                          {canRead && (
                            <DropdownMenuItem
                              onClick={() =>
                                editModalRef.current?.open(instrument, true)
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
                              onClick={() =>
                                setInstrumentToDeleteId(instrument.id)
                              }
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

      <InstrumentEditModal ref={editModalRef} />

      <AlertDialog
        open={instrumentToDeleteId !== null}
        onOpenChange={(open) => {
          if (!open) setInstrumentToDeleteId(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir instrumento?</AlertDialogTitle>
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
                  instrumentToDeleteId !== null &&
                  handleDeleteInstrument(instrumentToDeleteId)
                }
              >
                <Trash2Icon /> Sim, excluir
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
