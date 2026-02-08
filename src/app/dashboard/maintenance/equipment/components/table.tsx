'use client'

import { useRouter } from '@bprogress/next'
import { deleteEquipmentAction } from '@inspetor/actions/delete-equipment'
import { Can } from '@inspetor/casl/context'
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
  getEquipmentQueryKey,
  useEquipmentQuery,
} from '@inspetor/hooks/use-equipment-query'
import { useQueryClient } from '@tanstack/react-query'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Edit,
  Ellipsis,
  Inbox,
  Notebook,
  Trash,
  Trash2Icon,
  View,
} from 'lucide-react'
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs'
import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { useServerAction } from 'zsa-react'

import { EquipmentEditModal } from './edit-modal'
import { EquipmentTableSkeleton } from './table-skeleton'

export function EquipmentTable() {
  const deleteAction = useServerAction(deleteEquipmentAction)
  const router = useRouter()
  const queryClient = useQueryClient()

  const [search] = useQueryState('search', parseAsString.withDefault(''))
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1))

  const { data, isPending, isError } = useEquipmentQuery(search, page)
  const editModalRef = useRef<any>(null)
  const [equipmentToDeleteId, setEquipmentToDeleteId] = useState<string | null>(
    null,
  )

  function handlePageChange(newPage: number) {
    setPage(newPage)
  }

  async function handleDeleteEquipment(equipmentId: string) {
    setEquipmentToDeleteId(null)
    toast.loading('Deletando equipamento...', {
      id: 'delete-equipment',
    })
    const [result, resultError] = await deleteAction.execute({
      equipmentId,
    })

    if (resultError) {
      toast.error('Erro ao deletar equipamento', {
        id: 'delete-equipment',
      })
      return
    }

    if (result?.success) {
      toast.success(result.message, {
        id: 'delete-equipment',
      })
      await queryClient.invalidateQueries({ queryKey: getEquipmentQueryKey() })
    } else {
      toast.error(result?.message, {
        id: 'delete-equipment',
      })
    }
  }

  function handleRedirectToDailyMaintenance(equipmentId: string) {
    router.push(`/dashboard/maintenance/equipment/${equipmentId}/daily`)
  }

  if (isError) {
    return (
      <div className="bg-background @container/table rounded-md border p-6 text-center text-destructive">
        Erro ao carregar equipamentos.
      </div>
    )
  }

  if (isPending || !data) {
    return <EquipmentTableSkeleton />
  }

  const { equipments, totalPages } = data

  return (
    <div className="bg-background @container/table rounded-md border">
      <div className="relative w-full overflow-auto">
        <Table>
          <TableHeader className="bg-muted">
            <TableRow className="divide-x">
              <TableHead>Empresa</TableHead>
              <TableHead>Equipamento</TableHead>
              <TableHead>Marca</TableHead>
              <TableHead>Número de identificação</TableHead>
              <TableHead>Data de criação</TableHead>
              <TableHead>Data de atualização</TableHead>
              <TableHead className="w-20">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {equipments.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  <div className="flex flex-col items-center gap-2 py-20">
                    <Inbox className="size-10 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Nenhum equipamento encontrado
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {equipments.map((equipment) => (
              <TableRow key={equipment.id} className="divide-x">
                <TableCell>{equipment.company.name}</TableCell>
                <TableCell>{equipment.name}</TableCell>
                <TableCell>{equipment.mark}</TableCell>
                <TableCell>{equipment.identificationNumber}</TableCell>
                <TableCell>
                  {equipment.createdAt.toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </TableCell>
                <TableCell>
                  {equipment.updatedAt.toLocaleDateString('pt-BR', {
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
                        <Can I="update" a="MaintenanceEquipment">
                          <DropdownMenuItem
                            onClick={() => editModalRef.current.open(equipment)}
                          >
                            <Edit className="size-4" />
                            Editar
                          </DropdownMenuItem>
                        </Can>
                        <DropdownMenuItem
                          onClick={() =>
                            editModalRef.current.open(equipment, true)
                          }
                        >
                          <View className="size-4" />
                          Visualizar
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() =>
                            handleRedirectToDailyMaintenance(equipment.id)
                          }
                        >
                          <Notebook className="size-4" />
                          Manutenções diárias
                        </DropdownMenuItem>

                        <Can I="delete" a="MaintenanceEquipment">
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setEquipmentToDeleteId(equipment.id)}
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
              <TableCell colSpan={6}>
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
      <EquipmentEditModal ref={editModalRef} />

      <AlertDialog
        open={equipmentToDeleteId !== null}
        onOpenChange={(open) => {
          if (!open) setEquipmentToDeleteId(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir equipamento?</AlertDialogTitle>
            <AlertDialogDescription>
              Todas as manutenções diárias vinculadas a este equipamento também
              serão excluídas. Esta ação não pode ser desfeita. Deseja
              continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                className="bg-destructive hover:bg-destructive/90"
                variant="destructive"
                onClick={() =>
                  equipmentToDeleteId !== null &&
                  handleDeleteEquipment(equipmentToDeleteId)
                }
              >
                <Trash2Icon /> Sim, excluir tudo
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
