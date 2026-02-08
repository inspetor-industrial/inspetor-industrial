'use client'

import { deleteMaintenanceAction } from '@inspetor/actions/delete-maintenance'
import { Can } from '@inspetor/casl/context'
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
  getDailyMaintenanceQueryKey,
  useDailyMaintenanceQuery,
} from '@inspetor/hooks/use-daily-maintenance-query'
import { useQueryClient } from '@tanstack/react-query'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@inspetor/components/ui/table'
import type { Equipment } from '@inspetor/generated/prisma/browser'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Edit,
  Ellipsis,
  Inbox,
  Trash,
  View,
} from 'lucide-react'
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs'
import { useRef } from 'react'
import { toast } from 'sonner'
import { useServerAction } from 'zsa-react'

import { DailyMaintenanceEditModal } from './edit-modal'
import { DailyMaintenanceTableSkeleton } from './table-skeleton'

type DailyMaintenanceTableProps = {
  equipment: Equipment
}

export function DailyMaintenanceTable({
  equipment,
}: DailyMaintenanceTableProps) {
  const deleteAction = useServerAction(deleteMaintenanceAction)
  const queryClient = useQueryClient()

  const [search] = useQueryState('search', parseAsString.withDefault(''))
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1))

  const { data, isPending, isError } = useDailyMaintenanceQuery(
    equipment.id,
    search,
    page,
  )
  const editModalRef = useRef<any>(null)

  function handlePageChange(newPage: number) {
    setPage(newPage)
  }

  async function handleDeleteDailyMaintenance(dailyMaintenanceId: string) {
    toast.loading('Deletando manutenção diária...', {
      id: 'delete-daily-maintenance',
    })
    const [result, resultError] = await deleteAction.execute({
      dailyMaintenanceId,
    })

    if (resultError) {
      toast.error('Erro ao deletar manutenção diária', {
        id: 'delete-daily-maintenance',
      })
      return
    }

    if (result?.success) {
      toast.success(result.message, {
        id: 'delete-daily-maintenance',
      })
      await queryClient.invalidateQueries({
        queryKey: getDailyMaintenanceQueryKey(),
      })
    } else {
      toast.error(result?.message, {
        id: 'delete-daily-maintenance',
      })
    }
  }

  if (isError) {
    return (
      <div className="bg-background @container/table rounded-md border p-6 text-center text-destructive">
        Erro ao carregar manutenções diárias.
      </div>
    )
  }

  if (isPending || !data) {
    return <DailyMaintenanceTableSkeleton />
  }

  const { dailyMaintenances, totalPages } = data

  return (
    <div className="bg-background @container/table rounded-md border">
      <div className="relative w-full overflow-auto">
        <Table>
          <TableHeader className="bg-muted">
            <TableRow className="divide-x">
              <TableHead>Empresa</TableHead>
              <TableHead>Equipamento</TableHead>
              <TableHead>Operador</TableHead>
              <TableHead>Data de criação</TableHead>
              <TableHead>Data de atualização</TableHead>
              <TableHead className="w-20">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dailyMaintenances.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  <div className="flex flex-col items-center gap-2 py-20">
                    <Inbox className="size-10 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Nenhuma manutenção diária encontrada
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {dailyMaintenances.map((dailyMaintenance) => (
              <TableRow key={dailyMaintenance.id} className="divide-x">
                <TableCell>{dailyMaintenance.company.name}</TableCell>
                <TableCell>{equipment.name}</TableCell>
                <TableCell>{dailyMaintenance.operatorName}</TableCell>
                <TableCell>
                  {dailyMaintenance.createdAt.toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </TableCell>
                <TableCell>
                  {dailyMaintenance.updatedAt.toLocaleDateString('pt-BR', {
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
                        <Can I="update" a="MaintenanceDaily">
                          <DropdownMenuItem
                            onClick={() =>
                              editModalRef.current.open(dailyMaintenance)
                            }
                          >
                            <Edit className="size-4" />
                            Editar
                          </DropdownMenuItem>
                        </Can>
                        <DropdownMenuItem
                          onClick={() =>
                            editModalRef.current.open(dailyMaintenance, true)
                          }
                        >
                          <View className="size-4" />
                          Visualizar
                        </DropdownMenuItem>

                        <Can I="delete" a="MaintenanceDaily">
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() =>
                              handleDeleteDailyMaintenance(
                                dailyMaintenance.id,
                              )
                            }
                          >
                            <Trash className="size-4" />
                            Excluir
                          </DropdownMenuItem>
                        </Can>
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
      <DailyMaintenanceEditModal ref={editModalRef} equipment={equipment} />
    </div>
  )
}
